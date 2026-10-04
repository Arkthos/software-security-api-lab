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
    observations:{token_present:typeof parsed.token === 'string',email_present:typeof parsed.email === 'string',location_present:!!parsed.vehicleLocation},
    assertions:(execution.assertions || []).map(a=>({name:a.assertion,passed:!a.error})),
    outcome:outcome({code:execution.response?.code,transportError:!!execution.requestError,assertions:execution.assertions || []})
  };
}
module.exports = {hash,outcome,evidence};
