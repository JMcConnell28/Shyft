function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOptionalEnv(name: string) {
  return process.env[name]
}

function getRequiredPublicEnv(name: string) {
  const env = import.meta.env as Record<string, string | undefined>
  const value = env[name]

  if (!value) {
    throw new Error(`Missing required public environment variable: ${name}`)
  }

  return value
}

export { getOptionalEnv, getRequiredEnv, getRequiredPublicEnv }
