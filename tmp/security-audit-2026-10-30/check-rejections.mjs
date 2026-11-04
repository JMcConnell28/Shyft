import fs from 'node:fs';
const results=[];
for(const [url,headers,body] of [
 ['https://rocketrota.com/api/auth/update-user',{'content-type':'application/json',origin:'https://security-audit.invalid'},'{}'],
 ['https://admin.rocketrota.com/api/auth/update-user',{'content-type':'application/json',origin:'https://security-audit.invalid'},'{}'],
 ['https://rocketrota.com/api/stripe/webhook',{'content-type':'application/json'},'{}'],
 ['https://rocketrota.com/api/billing/reconcile',{},undefined]
]){
 try{const r=await fetch(url,{method:'POST',headers,body,signal:AbortSignal.timeout(10000)});await r.text();results.push({url,status:r.status});}catch(e){results.push({url,error:e.message});}
}
fs.writeFileSync('tmp/security-audit-2026-10-30/rejection-checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
