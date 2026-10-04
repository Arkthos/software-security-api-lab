const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const newman = require('newman');
const {evidence,hash,applyDependencies} = require('./evidence.cjs');
const root = path.resolve(__dirname,'..');
const lock = require('../lab/crapi.lock.json');
const collectionPath = path.join(root,'postman/api-security-lab.postman_collection.json');
const runId = new Date().toISOString().replace(/[:.]/g,'-') + '-' + crypto.randomBytes(4).toString('hex');
const out = path.join(root,'results/runs',runId); fs.mkdirSync(out,{recursive:true});
const stamp = crypto.randomBytes(8).toString('hex');
const startedAt = new Date().toISOString();
const git = spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
const rows = []; const timing = {}; const requestTimes = new Map();
let tokenBeforeHash = null;
const manifest = {run_id:runId,started_at:startedAt,experiment_status:'RUNNING',
  lab_repository_commit:git.status===0?git.stdout.trim():null,crapi:lock,
  collection_sha256:hash(fs.readFileSync(collectionPath)),node:process.version,
  newman:require('newman/package.json').version,os:os.platform(),architecture:os.arch(),
  base_url:'http://127.0.0.1:8888',evidence_policy:'allowlisted observations + hashes; raw secrets omitted',
  deployment:fs.existsSync(path.join(root,'.lab/deployment.json'))?JSON.parse(fs.readFileSync(path.join(root,'.lab/deployment.json'))):null};
const save = () => {
  fs.writeFileSync(path.join(out,'run-manifest.json'),JSON.stringify({...manifest,timing},null,2)+'\n');
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2)+'\n');
};
save();
const collection=JSON.parse(fs.readFileSync(collectionPath));
const values={user_a_email:`lab-a-${stamp}@example.com`,user_b_email:`lab-b-${stamp}@example.com`,
  lab_password:`Lab-${crypto.randomBytes(16).toString('hex')}!Aa1`,
  user_a_number:'7'+String(crypto.randomInt(1000000000)).padStart(9,'0'),
  user_b_number:'8'+String(crypto.randomInt(1000000000)).padStart(9,'0'),
  admin_email:'admin@example.com',admin_password:'Admin!123'}; // Public, synthetic crAPI seed account, not a personal credential.
for(const variable of collection.variable) if(variable.key in values) variable.value=values[variable.key];
const run = newman.run({collection,
  reporters:[],timeoutRequest:15000,timeoutScript:150000,timeout:420000,
  ignoreRedirects:true},(err,summary)=>{
    rows.push(...(summary?.run?.executions || []).map(execution=>({
      ...evidence(execution),request_at:requestTimes.get(execution.item.name) || null
    })));
    if (timing.same_token_before_after !== true) {
      const temporal = rows.find(r=>r.test_id==='T11');
      if (temporal) temporal.outcome='BLOCKED';
    }
    applyDependencies(rows);
    const allRequestsExecuted=rows.length===collection.item.length && collection.item.every(item=>rows.some(row=>row.name===item.name));
    const status = err || !summary ? 'ERROR' : !allRequestsExecuted || rows.some(r=>r.outcome==='ERROR'||r.outcome==='BLOCKED')?'INCOMPLETE':'COMPLETED';
    manifest.finished_at = new Date().toISOString(); manifest.experiment_status=status;
    manifest.all_requests_executed=allRequestsExecuted;
    save();
    fs.writeFileSync(path.join(out,'summary.md'),`# Ejecución ${runId}\n\nEstado: ${manifest.experiment_status}.\n\n| Caso | Resultado | HTTP |\n|---|---|---|\n`+
      rows.map(r=>`| ${r.name.replaceAll('|','\\|')} | ${r.outcome} | ${r.http_status??'-'} |`).join('\n')+'\n\nFAIL indica una propiedad incumplida; requiere análisis. BLOCKED no es PASS.\n');
    console.log('Evidence saved: results/runs/' + runId);
    process.exitCode = err || rows.some(r=>r.outcome==='ERROR') ? 2 : !allRequestsExecuted || rows.some(r=>r.outcome==='BLOCKED') ? 3 : rows.some(r=>r.outcome==='FAIL') ? 1 : 0;
  });
run.on('beforeRequest',(_err,args)=>{
  requestTimes.set(args.item.name,new Date().toISOString());
  if (/^T1[01]/.test(args.item.name)) {
    const id=args.item.name.slice(0,3); timing[id+'_request_at']=new Date().toISOString();
    const auth=args.request.headers.get('Authorization') || '';
    const fingerprint=hash(auth);
    if(id==='T10'){tokenBeforeHash=fingerprint;timing.token_sha256=fingerprint;}
    if(id==='T11') timing.same_token_before_after = fingerprint===tokenBeforeHash;
  }
});
run.on('request',(_err,args)=>{
  if(/^T1[01]/.test(args.item.name))timing[args.item.name.slice(0,3)+'_server_date']=args.response?.headers.get('Date') || null;
  if(args.item.name.startsWith('TIME-SETUP') && args.response){
    try {const token=JSON.parse(args.response.stream.toString()).token;
      const payload=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));
      timing.iat=payload.iat;timing.exp=payload.exp;timing.grace_ms=lock.expiration_grace_ms;
    } catch (_) { timing.decode_status='ERROR'; }
  }
});
run.on('request',(_err,args)=>{console.log(args.item.name + ': HTTP ' + (args.response?.code || 'ERROR'));save();});
