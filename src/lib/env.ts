function getRequiredPublicEnv(name: string) {
  const env = import.meta.env as Record<string, string | undefined>
  const value = env[name]

  if (!value) {
    throw new Error(`Missing required public environment variable: ${name}`)
  }

  return value
}

export { getRequiredPublicEnv }
