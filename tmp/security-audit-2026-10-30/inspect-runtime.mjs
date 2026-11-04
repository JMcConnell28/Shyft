import fs from 'node:fs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
const env=dotenv.parse(fs.readFileSync('.env.local'));
const results={checkedAt:new Date().toISOString(),http:[],dataApi:[]};
for(const target of ['https://rocketrota.com/','https://rocketrota.com/login','https://rocketrota.com/api/auth/get-session','https://rocketrota.com/.env','https://admin.rocketrota.com/']){
 try{
  const response=await fetch(target,{signal:AbortSignal.timeout(12000),redirect:'follow'});
  const body=await response.text();
  results.http.push({target,status:response.status,finalUrl:response.url,headers:Object.fromEntries(['content-security-policy','x-frame-options','x-content-type-options','referrer-policy','cache-control','cdn-cache-control','server'].map(k=>[k,response.headers.get(k)])),htmlNonceCount:(body.match(/nonce=/g)||[]).length,possibleEnvBody:target.endsWith('/.env')&&/(?:DATABASE_URL|BETTER_AUTH_SECRET|STRIPE_SECRET_KEY)=/.test(body)});
 }catch(error){results.http.push({target,error:error.message});}
}
const api=env.VITE_SUPABASE_URL;
const key=env.VITE_SUPABASE_PUBLISHABLE_KEY||env.VITE_SUPABASE_KEY;
for(const table of ['user','employees','account','clock_tags','time_entries']){
 try{const r=await fetch(`${api}/rest/v1/${table}?select=*&limit=0`,{headers:{apikey:key},signal:AbortSignal.timeout(10000)});results.dataApi.push({table,status:r.status});}catch(e){results.dataApi.push({table,error:e.message});}
}
try{
 const r=await fetch(`${api}/rest/v1/rpc/current_better_auth_user_id`,{method:'POST',headers:{apikey:key,'content-type':'application/json','x-shyft-session-token':'security-audit-nonexistent-token'},body:'{}',signal:AbortSignal.timeout(10000)});
 const body=await r.text(); results.syntheticSession={status:r.status,returnsNull:body.trim()==='null'};
}catch(e){results.syntheticSession={error:e.message};}
const pool=new Pool({connectionString:env.DATABASE_URL,connectionTimeoutMillis:10000});
try{const {rows}=await pool.query('select current_user, current_database(), ssl, version as tls_version from pg_stat_ssl where pid=pg_backend_pid()');results.localHostedConnection=rows;}catch(e){results.localHostedConnection={error:e.message};}finally{await pool.end();}
for(const name of ['VITE_SUPABASE_KEY','VITE_SUPABASE_PUBLISHABLE_KEY']){
 const value=env[name];if(!value)continue;
 let role=null;try{role=JSON.parse(Buffer.from(value.split('.')[1],'base64url')).role;}catch{}
 results[name]={modernPublishable:value.startsWith('sb_publishable_'),jwtRole:role,secretPrefix:value.startsWith('sb_secret_')};
}
fs.writeFileSync('tmp/security-audit-2026-10-30/runtime-summary.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
