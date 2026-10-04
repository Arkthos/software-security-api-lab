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
const signup = who => ({...login(who),name:'Lab ' + who.toUpperCase(),number:who==='a'?'7000000001':'7000000002'});
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
add('T03 | Dashboard without token','GET','/identity/api/v2/user/dashboard',null,null,denied);
add('T04 | Dashboard with altered signature','GET','/identity/api/v2/user/dashboard',null,'modified_token',denied,
  `const parts = pm.collectionVariables.get('token_a').split('.');
parts[2] = (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1);
pm.collectionVariables.set('modified_token', parts.join('.'));`);
add('T05 | Own dashboard','GET','/identity/api/v2/user/dashboard',null,'token_a',dashboard);
add('T09 | Dashboard after signup and login','GET','/identity/api/v2/user/dashboard',null,'token_a',dashboard);
add('TIME-SETUP | Fresh login','POST','/identity/api/auth/login',login('a'),null,
  token('time') + `\nconst b = pm.response.json();
const p = JSON.parse(atob(b.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
pm.test('PRECONDITION: bounded temporal token', () => {
  pm.expect(p.exp).to.be.a('number'); pm.expect(p.iat).to.be.a('number');
  pm.expect(p.exp - p.iat).to.be.within(115,125);
});
pm.collectionVariables.set('token_time_exp', p.exp);
pm.collectionVariables.set('token_time_iat', p.iat);`);
add('T10 | Same token before expiration','GET','/identity/api/v2/user/dashboard',null,'token_time',
  dashboard + `\npm.test('PRECONDITION: request before exp', () => {
  pm.expect(Date.now()/1000).to.be.below(Number(pm.collectionVariables.get('token_time_exp')));
});`);
add('T11 | Same token after expiration','GET','/identity/api/v2/user/dashboard',null,'token_time',
  denied + `\npm.test('PRECONDITION: request after exp plus grace', () => {
  pm.expect(Date.now()).to.be.at.least(Number(pm.collectionVariables.get('token_time_exp'))*1000 + 10000);
});`,
  `const waitMs = Number(pm.collectionVariables.get('token_time_exp'))*1000 + 10000 - Date.now();
if (!Number.isFinite(waitMs) || waitMs > 140000) throw new Error('Invalid temporal precondition');
setTimeout(function(){}, Math.max(0,waitMs));`);
const collection = {info:{name:'API Security Lab v0.1',schema:'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',description:'crAPI v1.1.6; solo localhost. T06 y T07 pendientes de fixtures/oráculo. Ver docs/04-test-plan.md.'},
  event:[{listen:'prerequest',script:{type:'text/javascript',exec:[
    "if (pm.collectionVariables.get('base_url') !== 'http://127.0.0.1:8888') throw new Error('Only the local crAPI laboratory is supported');"
  ]}}],
  variable:[{key:'base_url',value:'http://127.0.0.1:8888'},
    {key:'user_a_email',value:''},{key:'user_b_email',value:''},{key:'lab_password',value:''}],item:items};
fs.writeFileSync(path.join(root,'postman/api-security-lab.postman_collection.json'),JSON.stringify(collection,null,2)+'\n');
console.log('Collection generated: ' + items.length + ' requests');
