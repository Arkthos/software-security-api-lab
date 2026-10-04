const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const items = [];
function add(name, method, endpoint, body, auth, test, pre = '') {
  const request = {method, header:[{key:'Content-Type',value:'application/json'}],
    url:'{{base_url}}' + endpoint, auth: {type:'noauth'}};
  if (auth) request.header.push({key:'Authorization',value:'Bearer {{' + auth + '}}'});
  if (body) request.body = {mode:'raw',raw:JSON.stringify(body),options:{raw:{language:'json'}}};
  const event = [{listen:'test',script:{type:'text/javascript',exec:test.split('\n')}}];
  if (pre) event.unshift({listen:'prerequest',script:{type:'text/javascript',exec:pre.split('\n')}});
  items.push({name,request,event});
}
const login = who => ({email:'{{user_' + who + '_email}}',password:'{{lab_password}}'});
const signup = who => ({...login(who),name:'Lab ' + who.toUpperCase(),number:'{{user_'+who+'_number}}'});
const denied = `pm.test('SECURITY: denied without token or protected data', function () {
  pm.expect([401,403]).to.include(pm.response.code);
  let b = {}; try { b = pm.response.json(); } catch (_) {}
  pm.expect(Boolean(b.token || b.email || b.vehicleLocation)).to.equal(false);
});`;
const token = who => `pm.test('PRECONDITION: login produces JWT', function () {
  pm.expect(pm.response.code).to.equal(200);
  const b = pm.response.json(); pm.expect(b.token).to.be.a('string');
  pm.expect(b.token.split('.').length).to.equal(3);
  pm.collectionVariables.set('token_${who}', b.token);
});`;
const dashboard = `pm.test('SECURITY: own dashboard identity', function () {
  pm.expect(pm.response.code).to.equal(200);
  pm.expect(pm.response.json().email).to.equal(pm.collectionVariables.get('user_a_email'));
});`;
add('T08 | Login before account creation','POST','/identity/api/auth/login',login('a'),null,denied);
for (const who of ['a','b']) add('SETUP | Create user ' + who.toUpperCase(),'POST','/identity/api/auth/signup',signup(who),null,
  `pm.test('PRECONDITION: new account created', () => {pm.expect(pm.response.code).to.equal(200);});`);
add('T01 | Valid login A','POST','/identity/api/auth/login',login('a'),null,token('a'));
add('SETUP | Valid login B','POST','/identity/api/auth/login',login('b'),null,token('b'));
add('T02 | Wrong password','POST','/identity/api/auth/login',{...login('a'),password:'Incorrect-Lab-Password!'},null,denied);
add('T03 | Protected vehicles without token','GET','/identity/api/v2/vehicle/vehicles',null,null,denied);
add('T04 | Dashboard with altered signature','GET','/identity/api/v2/user/dashboard',null,'modified_token',denied,
  `const parts = pm.collectionVariables.get('token_a').split('.');
parts[2] = (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1);
pm.collectionVariables.set('modified_token', parts.join('.'));`);
add('T05 | Own dashboard','GET','/identity/api/v2/user/dashboard',null,'token_a',dashboard);
add('T09 | Dashboard after signup and login','GET','/identity/api/v2/user/dashboard',null,'token_a',dashboard);
for(const who of ['a','b']){
  add('FIXTURE | Read vehicle email '+who.toUpperCase(),'GET','/api/v2/messages?limit=100',null,null,
    `const email=pm.collectionVariables.get('user_${who}_email');
const messages=pm.response.json().items || [];
const message=messages.find(m=>(m.To || []).some(t=>t.Mailbox+'@'+t.Domain===email) || (m.Content?.Headers?.To || []).some(t=>t.includes(email)));
const text=(message?.Content?.Body || '').replace(/=\\r?\\n/g,'').replace(/<[^>]*>/g,'');
const vin=text.match(/VIN:\\s*([A-Z0-9]{17})/i)?.[1];
const pin=text.match(/Pincode:\\s*(\\d+)/i)?.[1];
pm.test('PRECONDITION: own vehicle email found',()=>{pm.expect(pm.response.code).to.equal(200);pm.expect(vin).to.be.a('string');pm.expect(pin).to.be.a('string');});
pm.collectionVariables.set('vin_${who}',vin);pm.collectionVariables.set('pin_${who}',pin);`);
  items.at(-1).request.url='http://127.0.0.1:8025/api/v2/messages?limit=100';
  add('FIXTURE | Link vehicle '+who.toUpperCase(),'POST','/identity/api/v2/vehicle/add_vehicle',
    {vin:'{{vin_'+who+'}}',pincode:'{{pin_'+who+'}}'},'token_'+who,
    `pm.test('PRECONDITION: vehicle linked',()=>pm.expect(pm.response.code).to.equal(200));`);
  add('CONTROL | Owned vehicles '+who.toUpperCase(),'GET','/identity/api/v2/vehicle/vehicles',null,'token_'+who,
    `const b=pm.response.json();
pm.test('PRECONDITION: one own vehicle exists',()=>{pm.expect(pm.response.code).to.equal(200);pm.expect(b).to.be.an('array');pm.expect(b.length).to.equal(1);pm.expect(b[0].uuid).to.be.a('string');});
pm.collectionVariables.set('object_${who}_id',b[0]?.uuid);`);
  add('CONTROL | Own location '+who.toUpperCase(),'GET','/identity/api/v2/vehicle/{{object_'+who+'_id}}/location',null,'token_'+who,
    `const b=pm.response.json();
pm.test('PRECONDITION: own location matches own object',()=>{pm.expect(pm.response.code).to.equal(200);pm.expect(b.carId).to.equal(pm.collectionVariables.get('object_${who}_id'));pm.expect(b.vehicleLocation).to.be.an('object');});`);
}
for(const [actor,target] of [['a','b'],['b','a']])add('T06 | Cross-user location '+actor.toUpperCase()+' to '+target.toUpperCase(),'GET',
  '/identity/api/v2/vehicle/{{object_'+target+'_id}}/location',null,'token_'+actor,
  `pm.test('PRECONDITION: objects are distinct',()=>pm.expect(pm.collectionVariables.get('object_a_id')).not.to.equal(pm.collectionVariables.get('object_b_id')));
pm.test('SECURITY: other owner location denied',()=>{pm.expect([403,404]).to.include(pm.response.code);const b=pm.response.json();pm.expect(Boolean(b.vehicleLocation || b.carId)).to.equal(false);});`);
add('CONTROL | Admin login','POST','/identity/api/auth/login',{email:'{{admin_email}}',password:'{{admin_password}}'},null,token('admin'));
add('CONTROL | Admin identity','GET','/identity/api/v2/user/dashboard',null,'token_admin',
  `pm.test('PRECONDITION: actual admin role',()=>{pm.expect(pm.response.code).to.equal(200);pm.expect(pm.response.json().role).to.equal('ROLE_ADMIN');});`);
add('CONTROL | Ordinary identity','GET','/identity/api/v2/user/dashboard',null,'token_a',
  `pm.test('PRECONDITION: ordinary role',()=>{pm.expect(pm.response.code).to.equal(200);pm.expect(pm.response.json().role).to.equal('ROLE_USER');});`);
add('CONTROL | Admin user listing','GET','/workshop/api/management/users/all?limit=100',null,'token_admin',
  `pm.test('PRECONDITION: admin listing available',()=>{pm.expect(pm.response.code).to.equal(200);pm.expect(pm.response.json().users).to.be.an('array');pm.expect(pm.response.json().users.length).to.be.above(1);});`);
add('T07 | Ordinary user attempts admin listing','GET','/workshop/api/management/users/all?limit=100',null,'token_a',
  `pm.test('SECURITY: admin function denied for ordinary role',()=>{pm.expect([403,404]).to.include(pm.response.code);const b=pm.response.json();pm.expect(Array.isArray(b.users)&&b.users.length>0).to.equal(false);});`);
add('TIME-SETUP | Fresh login','POST','/identity/api/auth/login',login('a'),null,
  token('time') + `\nconst b = pm.response.json();
const p = JSON.parse(atob(b.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
pm.test('PRECONDITION: bounded temporal token', () => {
  pm.expect(p.exp).to.be.a('number'); pm.expect(p.iat).to.be.a('number');
  pm.expect(p.exp - p.iat).to.be.within(115,125);
});
pm.collectionVariables.set('token_time_exp', p.exp);
pm.collectionVariables.set('token_time_iat', p.iat);`);
const ownVehicles=`pm.test('SECURITY: own authenticated vehicle list',()=>{const b=pm.response.json();pm.expect(pm.response.code).to.equal(200);pm.expect(b).to.be.an('array');pm.expect(b.some(v=>v.uuid===pm.collectionVariables.get('object_a_id'))).to.equal(true);});`;
add('T10 | Same token before expiration','GET','/identity/api/v2/vehicle/vehicles',null,'token_time',
  ownVehicles + `\npm.test('PRECONDITION: request before exp', () => {
  pm.expect(Date.now()/1000).to.be.below(Number(pm.collectionVariables.get('token_time_exp')));
});`);
add('T11 | Same token after expiration','GET','/identity/api/v2/vehicle/vehicles',null,'token_time',
  denied + `\npm.test('PRECONDITION: request after exp plus grace', () => {
  pm.expect(Date.now()).to.be.at.least(Number(pm.collectionVariables.get('token_time_exp'))*1000 + 10000);
});`,
  `const waitMs = Number(pm.collectionVariables.get('token_time_exp'))*1000 + 10000 - Date.now();
if (!Number.isFinite(waitMs) || waitMs > 140000) throw new Error('Invalid temporal precondition');
setTimeout(function(){}, Math.max(0,waitMs));`);
const collection = {info:{name:'API Security Lab v1.0',schema:'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',description:'crAPI v1.1.6-rc8; solo localhost. T01–T11 con controles de propietarios y roles. Ver docs/04-test-plan.md.'},
  event:[{listen:'prerequest',script:{type:'text/javascript',exec:[
    "if (pm.collectionVariables.get('base_url') !== 'http://127.0.0.1:8888') throw new Error('Only the local crAPI laboratory is supported');"
  ]}}],
  variable:[{key:'base_url',value:'http://127.0.0.1:8888'},
    {key:'user_a_email',value:''},{key:'user_b_email',value:''},{key:'lab_password',value:''},
    {key:'user_a_number',value:''},{key:'user_b_number',value:''},{key:'admin_email',value:'admin@example.com'},{key:'admin_password',value:''}],item:items};
fs.writeFileSync(path.join(root,'postman/api-security-lab.postman_collection.json'),JSON.stringify(collection,null,2)+'\n');
console.log('Collection generated: ' + items.length + ' requests');
