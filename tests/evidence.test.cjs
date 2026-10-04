const {test}=require('node:test');
const assert=require('node:assert/strict');
const {outcome,evidence,applyDependencies}=require('../scripts/evidence.cjs');
test('5xx or transport failure cannot become a successful denial',()=>{
  assert.equal(outcome({code:500,assertions:[{assertion:'SECURITY: denied'}]}),'ERROR');
  assert.equal(outcome({code:401,transportError:true}),'ERROR');
});
test('missing and failed preconditions remain blocked',()=>{
  assert.equal(outcome({code:200}),'BLOCKED');
  assert.equal(outcome({code:403,assertions:[{assertion:'PRECONDITION: owner verified',error:{}}]}),'BLOCKED');
});
test('violation remains a failure, legitimate control passes',()=>{
  assert.equal(outcome({code:200,assertions:[{assertion:'SECURITY: denied',error:{}}]}),'FAIL');
  assert.equal(outcome({code:401,assertions:[{assertion:'SECURITY: denied'}]}),'PASS');
});
test('published evidence omits tokens, credentials, response bodies and headers',()=>{
  const row=evidence({item:{name:'T01 | login'},request:{method:'POST',body:{password:'private-password'}},
    response:{code:200,headers:{get:name=>name==='WWW-Authenticate'?'Bearer private-challenge':null},stream:Buffer.from(JSON.stringify({token:'private-token',password:'private-password',email:'private@example.com'}))},
    assertions:[{assertion:'PRECONDITION: login'}]});
  const s=JSON.stringify(row);
  for(const secret of ['private-token','private-password','private@example.com','private-challenge']) assert.ok(!s.includes(secret));
  assert.equal(row.observations.www_authenticate_present,true);
  assert.equal(row.observations.token_present,true);assert.equal(row.outcome,'PASS');
});
test('a denial cannot pass when positive baseline failed; blocking propagates',()=>{
  const rows=[{test_id:'T01',outcome:'BLOCKED'},{test_id:'T02',outcome:'PASS'},
    {test_id:'T10',outcome:'PASS'},{test_id:'T11',outcome:'PASS'}];
  applyDependencies(rows);
  assert.ok(rows.every(r=>r.outcome==='BLOCKED'));
});
test('temporal rejection cannot be assessed when token lifetime setup failed',()=>{
  const rows=[{test_id:'T01',outcome:'PASS'},{name:'CONTROL | Owned vehicles A',outcome:'PASS'},
    {name:'TIME-SETUP | Fresh login',outcome:'BLOCKED'},{test_id:'T10',outcome:'PASS'},{test_id:'T11',outcome:'PASS'}];
  applyDependencies(rows);
  assert.equal(rows.find(r=>r.test_id==='T10').outcome,'BLOCKED');
  assert.equal(rows.find(r=>r.test_id==='T11').outcome,'BLOCKED');
});
