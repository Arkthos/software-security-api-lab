const crypto = require('node:crypto');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function outcome({code,transportError=false,assertions=[]}) {
  if (transportError || !Number.isInteger(code) || code >= 500) return 'ERROR';
  if (!assertions.length || assertions.some(a=>a.error && a.assertion.startsWith('PRECONDITION:'))) return 'BLOCKED';
  return assertions.some(a=>a.error) ? 'FAIL' : 'PASS';
}
// Allowlist: no raw requests, tokens, headers, credentials or response body are persisted.
function evidence(execution) {
  const body = execution.response?.stream?.toString('utf8') || '';
  let parsed = {}; try { parsed = JSON.parse(body); } catch (_) {}
  return {
    name:execution.item.name,
    test_id:execution.item.name.match(/^T\d+/)?.[0] || null,
    method:execution.request.method,
    http_status:execution.response?.code || null,
    response_sha256:hash(body),
    response_bytes:Buffer.byteLength(body),
    observations:{www_authenticate_present:!!execution.response?.headers?.get?.('WWW-Authenticate'),
      token_present:typeof parsed.token === 'string',email_present:typeof parsed.email === 'string',location_present:!!parsed.vehicleLocation,
      role:parsed.role || null,user_count:Array.isArray(parsed.users)?parsed.users.length:null,
      car_id_sha256:typeof parsed.carId==='string'?hash(parsed.carId):null,
      email_sha256:typeof parsed.email==='string'?hash(parsed.email):null,
      location_sha256:parsed.vehicleLocation?hash(JSON.stringify(parsed.vehicleLocation)):null,
      vehicle_ids_sha256:Array.isArray(parsed)?parsed.filter(v=>typeof v.uuid==='string').map(v=>hash(v.uuid)):null},
    assertions:(execution.assertions || []).map(a=>({name:a.assertion,passed:!a.error})),
    outcome:outcome({code:execution.response?.code,transportError:!!execution.requestError,assertions:execution.assertions || []})
  };
}
function applyDependencies(rows) {
  const dependencies={T02:['T01'],T03:['T01','CONTROL | Owned vehicles A'],T04:['T01','T05'],T05:['T01'],
    T06:['T01','CONTROL | Own location A','CONTROL | Own location B'],
    T07:['CONTROL | Admin identity','CONTROL | Ordinary identity','CONTROL | Admin user listing'],
    T09:['T01','T08'],T10:['T01','CONTROL | Owned vehicles A'],T11:['T10']};
  // Fixed point also propagates a blocked prerequisite recorded later in the sequence.
  for(let pass=0;pass<rows.length;pass++)for(const row of rows){
    if(row.outcome==='ERROR')continue;
    if((dependencies[row.test_id] || []).some(id=>rows.find(r=>r.test_id===id || r.name===id)?.outcome!=='PASS')){
      row.outcome='BLOCKED';row.reason='A required positive control or prior state did not pass.';
    }
  }
  return rows;
}
module.exports = {hash,outcome,evidence,applyDependencies};
