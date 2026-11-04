import fs from 'node:fs';
import {X509Certificate} from 'node:crypto';

for (const url of ['https://supabase.com/downloads/prod-ca-2021.crt','https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt']) {
 try {
  const response = await fetch(url,{signal:AbortSignal.timeout(10000)});
  const pem = await response.text();
  if (!response.ok || !pem.includes('-----BEGIN CERTIFICATE-----')) { console.log(JSON.stringify({url,status:response.status,certificate:false}));continue; }
  const cert=new X509Certificate(pem);
  console.log(JSON.stringify({url,finalUrl:response.url,subject:cert.subject,ca:cert.ca,validTo:cert.validTo,fingerprint256:cert.fingerprint256}));
  fs.writeFileSync('tmp/security-audit-2026-10-30/supabase-ca.crt',pem);
  break;
 } catch(error) { console.log(JSON.stringify({url,error:error.message})); }
}
