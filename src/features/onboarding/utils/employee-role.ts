function isEmployeeOnlyRole(role: string): boolean {
  return role
    .split(",")
    .map((entry) => entry.trim())
    .every((entry) => entry === "employee")
}

export { isEmployeeOnlyRole }
