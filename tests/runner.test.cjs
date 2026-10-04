const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('Newman runner processes complete synthetic sequence, two-owner controls and temporal pair', {timeout:45000}, async()=>{
  const users=new Map([['admin@example.com','Admin!123']]);const counts=new Map();const owned=new Map();
  const server=http.createServer(async(req,res)=>{
    let raw='';for await(const chunk of req)raw+=chunk;
    let body={};try{body=JSON.parse(raw);}catch(_){}
    const send=(code,data)=>{res.writeHead(code,{'content-type':'application/json'});res.end(JSON.stringify(data));};
    if(req.url.endsWith('/signup')){users.set(body.email,body.password);return send(200,{status:200});}
    if(req.url.endsWith('/login')){
      if(!users.has(body.email)||users.get(body.email)!==body.password)return send(401,{error:'denied'});
      const count=(counts.get(body.email)||0)+1;counts.set(body.email,count);
      const now=Math.floor(Date.now()/1000);
      // Synthetic acceleration only: exp-iat is 120, but the second token expires in 3 s.
      const exp=now+(count===2?3:120);
      const payload=Buffer.from(JSON.stringify({sub:body.email,iat:exp-120,exp})).toString('base64url');
      return send(200,{token:'e30.'+payload+'.c2ln'});
    }
    if(req.url.endsWith('/dashboard') || req.url.includes('/vehicle/') || req.url.startsWith('/workshop/')){
      const token=(req.headers.authorization||'').slice(7);const parts=token.split('.');
      try{
        const claims=JSON.parse(Buffer.from(parts[1],'base64url'));
        if(parts[2]!=='c2ln'||claims.exp<=Date.now()/1000)return send(401,{error:'denied'});
        
        const index=claims.sub.startsWith('lab-a-')?'A':'B';const ownId='vehicle-'+index;
        if(req.url.endsWith('/dashboard')) return send(200,{email:claims.sub,id:1,role:claims.sub==='admin@example.com'?'ROLE_ADMIN':'ROLE_USER'});
        if(req.url.endsWith('/add_vehicle')){if(body.vin!==index.repeat(17)||body.pincode!=='1234')return send(403,{error:'invalid fixture'});owned.set(claims.sub,ownId);return send(200,{status:200});}
        if(req.url.endsWith('/vehicles'))return send(200,owned.has(claims.sub)?[{uuid:ownId}]:[]);
        if(req.url.endsWith('/location')){const id=req.url.split('/').at(-2);if(id!==ownId)return send(403,{error:'denied'});return send(200,{carId:id,vehicleLocation:{latitude:'1',longitude:'2'}});}
        if(req.url.startsWith('/workshop/')){if(claims.sub!=='admin@example.com')return send(403,{error:'denied'});return send(200,{users:[{},{}]});}

      }catch(_){return send(401,{error:'denied'});}
    }
    send(404,{error:'not found'});
  });
  
  const mail=http.createServer((_req,res)=>{res.writeHead(200,{'content-type':'application/json'});
    res.end(JSON.stringify({items:[...users.keys()].filter(email=>email.startsWith('lab-')).map(email=>({
      To:[{Mailbox:email.split('@')[0],Domain:'example.com'}],Content:email.startsWith('lab-a-')?
        {Headers:{'Content-Transfer-Encoding':['base64']},Body:Buffer.from('<b>VIN: </b><font>'+ 'A'.repeat(17)+'</font> Pincode: <b>1234</b>').toString('base64')}:
        {Headers:{'Content-Transfer-Encoding':['quoted-printable']},Body:'<b>VIN: </b><font face=3D"calibri">BBBBBBBBB=\r\nBBBBBBBB</font> Pincode: <b>1234</b>'}
    }))}));
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8888,'127.0.0.1',resolve);});
  await new Promise((resolve,reject)=>{mail.once('error',reject);mail.listen(8025,'127.0.0.1',resolve);});

  let output='';let runPath;
  try{
    const child=spawn(process.execPath,['scripts/run.cjs'],{cwd:root});
    child.stdout.on('data',b=>output+=b.toString());
    const status=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
    const match=output.match(/Evidence saved: (results\/runs\/[^\s]+)/);assert.ok(match,output);
    runPath=path.join(root,match[1]);
    const results=JSON.parse(fs.readFileSync(path.join(runPath,'results.json')));
    const manifest=JSON.parse(fs.readFileSync(path.join(runPath,'run-manifest.json')));
    assert.equal(status,0,JSON.stringify(results));
    for(const id of ['T01','T02','T03','T04','T05','T06','T07','T08','T09','T10','T11']){
      assert.equal(results.find(r=>r.test_id===id)?.outcome,'PASS',id+': '+JSON.stringify(results));
    }
    assert.ok(results.filter(r=>r.test_id==='T06').every(r=>r.outcome==='PASS')); 
    assert.equal(manifest.experiment_status,'COMPLETED');
    assert.equal(manifest.timing.same_token_before_after,true);
    assert.ok(Date.parse(manifest.timing.T11_request_at)>=manifest.timing.exp*1000+10000);
    const published=fs.readFileSync(path.join(runPath,'results.json'),'utf8');
    assert.ok(!published.includes('@example.com'));
    assert.ok(!published.includes('e30.'));
  }finally{
    await new Promise(resolve=>server.close(resolve));
    await new Promise(resolve=>mail.close(resolve));
    if(runPath)fs.rmSync(runPath,{recursive:true,force:true});
  }
});
