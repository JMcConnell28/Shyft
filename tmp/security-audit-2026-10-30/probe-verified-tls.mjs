import fs from 'node:fs';
import dotenv from 'dotenv';
import { Pool } from 'pg';

const env = dotenv.parse(fs.readFileSync('.env.local'));
const connection = new URL(env.DATABASE_URL);
for (const name of ['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslnegotiation', 'uselibpqcompat']) connection.searchParams.delete(name);
const pool = new Pool({connectionString:connection.toString(),ssl:{rejectUnauthorized:true,ca:fs.readFileSync('tmp/security-audit-2026-10-30/supabase-ca.crt','utf8')},connectionTimeoutMillis:10000,max:1});
try {
 const client=await pool.connect();
 try {
  const socket=client.connection.stream;
  const {rows}=await client.query('select ssl, version as tls_version from pg_stat_ssl where pid=pg_backend_pid()');
  console.log(JSON.stringify({clientTls:{encrypted:socket.encrypted,authorized:socket.authorized,protocol:socket.getProtocol()},poolerToDatabase:rows}));
 } finally {client.release();}
} catch(error) {
 console.log(JSON.stringify({connectionFailed:true,code:error.code??null,message:error.message}));
 process.exitCode=1;
} finally { await pool.end(); }
