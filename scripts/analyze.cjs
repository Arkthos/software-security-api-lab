const fs=require('node:fs');
const path=require('node:path');
const {hash}=require('./evidence.cjs');
function analyze(directory){
  const runs=fs.readdirSync(directory).filter(name=>fs.existsSync(path.join(directory,name,'run-manifest.json'))).sort().map(name=>{
    const base=path.join(directory,name);
    const manifest=JSON.parse(fs.readFileSync(path.join(base,'run-manifest.json')));
    const rows=JSON.parse(fs.readFileSync(path.join(base,'results.json')));
    if(manifest.experiment_status!=='COMPLETED'||rows.length!==28||rows.some(r=>!['PASS','FAIL'].includes(r.outcome)))throw new Error('Incomplete run: '+name);
    for(let n=1;n<=11;n++)if(!rows.some(r=>r.test_id==='T'+String(n).padStart(2,'0')))throw new Error('Missing case: '+name);
    if(rows.filter(r=>r.test_id==='T06').length!==2)throw new Error('Missing ownership direction');
    return {manifest,rows};
  });
  if(runs.length!==3)throw new Error('Exactly three complete runs are required');
  const first=runs[0].manifest;
  if(runs.some(r=>r.manifest.collection_sha256!==first.collection_sha256||r.manifest.lab_repository_commit!==first.lab_repository_commit||JSON.stringify(r.manifest.crapi)!==JSON.stringify(first.crapi)))throw new Error('Runs have different experiment definitions');
  const cases=runs[0].rows.filter(r=>r.test_id).map(row=>({name:row.name,id:row.test_id,
    outcomes:runs.map(run=>run.rows.find(r=>r.name===row.name)?.outcome),
    http:runs.map(run=>run.rows.find(r=>r.name===row.name)?.http_status)}));
  const equal=(a,b)=>typeof a==='string'&&a===b;
  const corroboration=runs.map(({manifest:m,rows})=>{
    const get=name=>rows.find(r=>r.name===name);
    const byId=id=>rows.find(r=>r.test_id===id);
    const ownA=get('CONTROL | Own location A'),ownB=get('CONTROL | Own location B');
    const cross=['T06 | Cross-user location A to B','T06 | Cross-user location B to A'].map(get);
    const ordinary=get('CONTROL | Ordinary identity'),admin=get('CONTROL | Admin identity');
    const timing=m.timing;
    return {run_id:m.run_id,
      http_401_challenges:rows.filter(r=>r.http_status===401).map(r=>({name:r.name,present:r.observations.www_authenticate_present})),
      altered_signature_matches_own_email:equal(byId('T04')?.observations.email_sha256,byId('T05')?.observations.email_sha256),
      distinct_owner_objects:!!ownA?.observations.car_id_sha256&&!!ownB?.observations.car_id_sha256&&ownA.observations.car_id_sha256!==ownB.observations.car_id_sha256,
      cross_owner_location_matches:cross.map((r,i)=>({name:r.name,
        matches_car:equal(r.observations.car_id_sha256,(i===0?ownB:ownA)?.observations.car_id_sha256),
        matches_location:equal(r.observations.location_sha256,(i===0?ownB:ownA)?.observations.location_sha256)})),
      verified_roles:ordinary?.observations.role==='ROLE_USER'&&admin?.observations.role==='ROLE_ADMIN',
      ordinary_listing_matches_admin:equal(byId('T07')?.response_sha256,get('CONTROL | Admin user listing')?.response_sha256),
      same_temporal_token:timing.same_token_before_after===true,
      token_lifetime_seconds:timing.exp-timing.iat,
      before_exp_seconds:(Date.parse(timing.T10_request_at)-timing.exp*1000)/1000,
      after_exp_seconds:(Date.parse(timing.T11_request_at)-timing.exp*1000)/1000,
      after_server_exp_seconds:(Date.parse(timing.T11_server_date)-timing.exp*1000)/1000,
      temporal_response_matches:equal(byId('T10')?.response_sha256,byId('T11')?.response_sha256)};
  });
  return {runs: runs.map(r=>({run_id:r.manifest.run_id,started_at:r.manifest.started_at,finished_at:r.manifest.finished_at,
    pass:r.rows.filter(x=>x.outcome==='PASS').length,fail:r.rows.filter(x=>x.outcome==='FAIL').length})),
    experiment_commit:first.lab_repository_commit,collection_sha256:first.collection_sha256,cases,corroboration,
    stable_outcomes:cases.every(c=>new Set(c.outcomes).size===1)};
}
function writeAnalysis(directory){
  const result=analyze(directory);
  fs.writeFileSync(path.join(directory,'analysis.json'),JSON.stringify(result,null,2)+'\n');
  const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
  const csv=['run_id,case,name,outcome,http_status'];
  for(let i=0;i<result.runs.length;i++)for(const c of result.cases)csv.push([result.runs[i].run_id,c.id,c.name,c.outcomes[i],c.http[i]].map(quote).join(','));
  fs.writeFileSync(path.join(directory,'cases.csv'),csv.join('\n')+'\n');
  fs.writeFileSync(path.join(directory,'comparison.md'),'# Comparación de tres ejecuciones reales\n\n'+
    'Commit del experimento: `'+result.experiment_commit+'`. Resultados estables: '+result.stable_outcomes+'.\n\n'+
    '| Caso | Run 1 | Run 2 | Run 3 | HTTP 1/2/3 |\n|---|---|---|---|---|\n'+
    result.cases.map(c=>'| '+c.name+' | '+c.outcomes.join(' | ')+' | '+c.http.join('/')+' |').join('\n')+'\n\n'+
    'FAIL requiere interpretación con controles; no equivale por sí solo a una clasificación de vulnerabilidad. Ver analysis.json y docs/05-results-analysis.md.\n');
  const inventory={};
  function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);if(entry.isDirectory())scan(full);
    else if(entry.name!=='checksums.json')inventory[path.relative(directory,full).replaceAll(path.sep,'/')]=hash(fs.readFileSync(full));
  }}scan(directory);
  fs.writeFileSync(path.join(directory,'checksums.json'),JSON.stringify({algorithm:'sha256',files:inventory},null,2)+'\n');
  return result;
}
if(require.main===module){try{console.log(JSON.stringify(writeAnalysis(path.resolve(process.argv[2]||'results/approved')),null,2));}catch(error){console.error(error.message);process.exitCode=2;}}
module.exports={analyze,writeAnalysis};
