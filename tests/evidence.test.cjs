const {test}=require('node:test');
const assert=require('node:assert/strict');
const {outcome,evidence}=require('../scripts/evidence.cjs');
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
    response:{code:200,stream:Buffer.from(JSON.stringify({token:'private-token',password:'private-password',email:'private@example.com'}))},
    assertions:[{assertion:'PRECONDITION: login'}]});
  const s=JSON.stringify(row);
  for(const secret of ['private-token','private-password','private@example.com']) assert.ok(!s.includes(secret));
  assert.equal(row.observations.token_present,true);assert.equal(row.outcome,'PASS');
});
