import "@tanstack/react-start/server-only"

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

export { getOptionalEnv, getRequiredEnv }
