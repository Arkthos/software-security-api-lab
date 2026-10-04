const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const collection=require('../postman/api-security-lab.postman_collection.json');
const cases=require('../tests/test-cases.json');
const sourceIds=new Set(require('../references/sources.json').map(s=>s.id));
const names=new Set();
for(const item of collection.item){
  if(names.has(item.name))throw new Error('Duplicate request');names.add(item.name);
  if(!item.request.url.startsWith('{{base_url}}/'))throw new Error('Unexpected target');
  for(const event of item.event || [])new vm.Script(event.script.exec.join('\n'));
}
for(const c of cases){
  for(const id of c.sources)if(!sourceIds.has(id))throw new Error('Unknown source: '+id);
  if(c.implementation==='implemented' && !collection.item.some(i=>i.name.startsWith(c.id+' |')))throw new Error('Missing case: '+c.id);
}
if(cases.length!==11 || new Set(cases.map(c=>c.id)).size!==11)throw new Error('Case IDs are incomplete');
for(const file of fs.readdirSync(path.join(root,'scripts')).filter(f=>f.endsWith('.cjs')))new vm.Script(fs.readFileSync(path.join(root,'scripts',file),'utf8'));
console.log('Validated 11 cases, literature IDs, local targets and script syntax.');
