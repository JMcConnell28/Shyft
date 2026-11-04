const recoveryWindowSeconds = 15 * 60

const passwordRecoveryLimits = {
  request: { global: 500, source: 20, unknownSource: 100, target: 3 },
  reset: { global: 1000, source: 60, unknownSource: 100, target: 10 },
} as const

export { passwordRecoveryLimits, recoveryWindowSeconds }
