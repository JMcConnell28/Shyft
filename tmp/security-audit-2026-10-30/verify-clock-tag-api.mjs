process.loadEnvFile(".env.local")
const url = process.env.VITE_SUPABASE_URL
const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const secretKey = process.env.SUPABASE_SECRET_KEY
if (!url || !publicKey || !secretKey) throw new Error("Required Supabase configuration is missing.")

const results = []
for (const [role, key] of [["browser", publicKey], ["server", secretKey]]) {
  for (const selection of ["ntag_aes_key_hex", "*"]) {
    const response = await fetch(`${url}/rest/v1/clock_tags?select=${selection}&limit=0`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(10000),
    })
    // limit=0 ensures no real station records or keys are fetched, even if the
    // access check unexpectedly succeeds. Do not print response bodies.
    const body = await response.text()
    const passed = role === "browser"
      ? [401, 403].includes(response.status)
      : response.status === 200 && body.trim() === "[]"
    results.push({ role, selection, status: response.status, passed })
    if (!passed) process.exitCode = 1
  }
}
console.log(JSON.stringify(results, null, 2))
