const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const work = path.join(root,'.lab');
const repo = path.join(work,'crapi');
const lock = require('./crapi.lock.json');
function exec(cmd,args,cwd=root){
  const result=spawnSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024});
  if(result.error || result.status!==0) throw new Error(`${cmd} failed: ${result.error?.message || result.stderr}`);
  return result.stdout.trim();
}
(async()=>{
  exec('docker',['info','--format','{{.ServerVersion}}']);
  if(process.argv.includes('--down')){
    if(!fs.existsSync(path.join(work,'compose.resolved.json'))) throw new Error('No local deployment');
    exec('docker',['compose','-p','software-security-api-lab','-f',path.join(work,'compose.resolved.json'),'down']);
    console.log('Lab stopped; volumes retained.');return;
  }
  fs.mkdirSync(work,{recursive:true});
  if(!fs.existsSync(repo))exec('git',['clone','--depth','1','--branch',lock.tag,lock.repository,repo]);
  if(exec('git',['rev-parse','HEAD'],repo)!==lock.commit)throw new Error('crAPI commit does not match lock');
  const sourceConfig=exec('docker',['compose','-f','docker-compose.yml','config','--format','json'],path.join(repo,'deploy/docker'));
  const config=JSON.parse(sourceConfig);
  config.name='software-security-api-lab';
  for(const [name,service] of Object.entries(config.services)){
    if(lock.image_digests[name])service.image=lock.image_digests[name];
    if(service.environment && 'TLS_ENABLED' in service.environment) service.environment.TLS_ENABLED='false';
    delete service.container_name;
  }
  for(const [name,volume] of Object.entries(config.volumes || {}))volume.name='software-security-api-lab_'+name;
  for(const [name,network] of Object.entries(config.networks || {}))network.name='software-security-api-lab_'+name;
  config.services['crapi-identity'].environment.JWT_EXPIRATION=String(lock.jwt_expiration_ms);
  config.services['crapi-web'].ports=[{target:80,published:'8888',host_ip:'127.0.0.1',protocol:'tcp'}];
  config.services.mailhog.ports=[{target:8025,published:'8025',host_ip:'127.0.0.1',protocol:'tcp'}];
  // Chatbot and its dependencies remain available in upstream config, but are not started.
  const active=['crapi-web','mailhog','api.mypremiumdealership.com'];
  const compose=path.join(work,'compose.resolved.json');
  fs.writeFileSync(compose,JSON.stringify(config,null,2)+'\n');
  const prefix=['compose','-p','software-security-api-lab','-f',compose];
  exec('docker',[...prefix,'pull','--include-deps',...active]);
  // Resolve all pulled active dependencies to immutable image digests for this deployment.
  const images={};
  for(const [name,service] of Object.entries(config.services)){
    if(['crapi-chatbot','chromadb'].includes(name))continue;
    if(!lock.image_digests[name])throw new Error('Unpinned active image: '+name);
    const info=JSON.parse(exec('docker',['image','inspect',service.image]))[0];
    const digest=info.RepoDigests?.[0];
    if(!digest)throw new Error('Cannot resolve image digest: '+service.image);
    images[name]={tag:service.image,digest,image_id:info.Id};service.image=digest;
  }
  fs.writeFileSync(compose,JSON.stringify(config,null,2)+'\n');
  exec('docker',[...prefix,'up','-d','--wait','--wait-timeout','360',...active]);
  const deadline=Date.now()+60000;
  while(true){
    try {const response=await fetch('http://127.0.0.1:8888/health',{signal:AbortSignal.timeout(5000)});if(response.ok)break;}catch(_){}
    if(Date.now()>deadline)throw new Error('Health endpoint did not become ready');
    await new Promise(resolve=>setTimeout(resolve,2000));
  }
  fs.writeFileSync(path.join(work,'deployment.json'),JSON.stringify({
    crapi_commit:lock.commit,configured_jwt_expiration_ms:lock.jwt_expiration_ms,
    docker:exec('docker',['--version']),compose:exec('docker',['compose','version']),
    started_at:new Date().toISOString(),images,resolved_compose_sha256:require('../scripts/evidence.cjs').hash(fs.readFileSync(compose))
  },null,2)+'\n');
  console.log('crAPI ready at http://127.0.0.1:8888');
})().catch(error=>{console.error(error.message);process.exitCode=2;});
