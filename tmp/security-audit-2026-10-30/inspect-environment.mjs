import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import dotenv from 'dotenv';

const root = process.cwd();
const envFiles = ['.env', '.env.local', '.env.hosted.local', '.env.production.local', 'apps/admin/.env', 'apps/admin/.env.local'];
const envs = envFiles.filter(fs.existsSync).map(file => ({file, values: dotenv.parse(fs.readFileSync(file))}));
const privatePattern = /SECRET|PRIVATE|PASSWORD|DATABASE_URL|SERVICE_ROLE|API_KEY/;
const secrets = envs.flatMap(({file, values}) => Object.entries(values).filter(([name,value]) => privatePattern.test(name) && value.length >= 12 && !/replace-with|your-|YOUR_|example/.test(value)).map(([name,value]) => ({file,name,value})));
const tracked = execFileSync('git', ['ls-files', '-z'], {encoding:'utf8'}).split('\0').filter(Boolean);
const matches = [];
for(const file of tracked){
  if(!fs.existsSync(file) || fs.statSync(file).size > 10000000) continue;
  const data = fs.readFileSync(file).toString('utf8');
  for(const secret of secrets) if(data.includes(secret.value)) matches.push({file, variable: secret.name, source: secret.file});
}
function walk(dir){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
const bundles = ['.output/public', 'apps/admin/.output/public', 'apps/admin/dist'].flatMap(walk).filter(f=>/\.(js|css|html|map|json)$/.test(f));
const bundleMatches=[];
for(const file of bundles){ const data=fs.readFileSync(file,'utf8');for(const secret of secrets)if(data.includes(secret.value))bundleMatches.push({file,variable:secret.name}); }
const summaries = envs.map(({file,values})=>({file,variables:Object.keys(values),publicVariables:Object.keys(values).filter(n=>n.startsWith('VITE_')),db:values.DATABASE_URL?(()=>{try{const u=new URL(values.DATABASE_URL);return {role:u.username.split('.')[0],host:u.hostname,sslmode:u.searchParams.get('sslmode'),sslrejectunauthorized:u.searchParams.get('sslrejectunauthorized')};}catch{return 'unparseable';}})():null,flags:Object.fromEntries(['DEV_BYPASS_EMAIL_VERIFICATION','VITE_DEV_BYPASS_EMAIL_VERIFICATION','PUSH_TESTING_ENABLED','PERFORMANCE_PROFILE'].filter(n=>n in values).map(n=>[n,values[n]==='true'||values[n]==='1'])),authSecretsDistinct: values.BETTER_AUTH_SECRET&&values.ADMIN_BETTER_AUTH_SECRET?values.BETTER_AUTH_SECRET!==values.ADMIN_BETTER_AUTH_SECRET:null,testRecipientSet:!!values.RESEND_TEST_TO_EMAIL,signupCodeConfigured:/^\d{6}$/.test(values.SIGNUP_ACCESS_CODE??''),adminBootstrapConfigured:!!values.ADMIN_BOOTSTRAP_EMAILS,stripeKeyClass:values.STRIPE_SECRET_KEY?.startsWith('rk_')?'restricted':values.STRIPE_SECRET_KEY?.startsWith('sk_')?'secret':values.STRIPE_SECRET_KEY?'other':'missing'}));
const output={environment:summaries,trackedFiles:tracked.length,trackedSecretMatches:matches,bundleFiles:bundles.length,bundleSecretMatches:bundleMatches,sourceMaps:bundles.filter(f=>f.endsWith('.map')).length};
fs.writeFileSync('tmp/security-audit-2026-10-30/environment-summary.json',JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
