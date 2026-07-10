import "@tanstack/react-start/server-only"

function getOptionalEnv(name: string) {
  return process.env[name]
}

function getRequiredEnv(name: string) {
  const value = getOptionalEnv(name)

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export { getOptionalEnv, getRequiredEnv }
