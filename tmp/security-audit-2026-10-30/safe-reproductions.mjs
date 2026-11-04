import fs from 'node:fs';
import crypto from 'node:crypto';
import webPush from 'web-push';
import ts from 'typescript';
const vapid=webPush.generateVAPIDKeys();
const ecdh=crypto.createECDH('prime256v1');ecdh.generateKeys();
webPush.setVapidDetails('mailto:audit@example.invalid',vapid.publicKey,vapid.privateKey);
const subscription={endpoint:'https://127.0.0.1:8443/internal-audit-probe',keys:{auth:crypto.randomBytes(16).toString('base64url'),p256dh:ecdh.getPublicKey().toString('base64url')}};
// Only prepare request options. Never perform a network request.
const options=webPush.generateRequestDetails(subscription,JSON.stringify({title:'audit'}));
const csvSource=fs.readFileSync('src/features/timesheets/utils/csv.ts','utf8');
const js=ts.transpileModule(csvSource,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const csv=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const exported=csv.serializeCsv([['=1+1']]);
const local=fs.readFileSync('.env.local','utf8');
const hosted=fs.readFileSync('.env.hosted.local','utf8');
const {parse}=await import('dotenv');const a=parse(local), b=parse(hosted);
const result={pushRequestPreparedForLoopback:options.endpoint===subscription.endpoint,pushRequestMethod:options.method,networkRequestPerformed:false,csvFormulaPreserved:exported.includes('"=1+1"'),localHostedAuthSecretReused:!!a.BETTER_AUTH_SECRET&&a.BETTER_AUTH_SECRET===b.BETTER_AUTH_SECRET,localHostedSupabaseProjectReused:a.VITE_SUPABASE_URL===b.VITE_SUPABASE_URL};
fs.writeFileSync('tmp/security-audit-2026-10-30/reproductions.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
