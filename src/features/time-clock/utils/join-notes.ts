function joinNotes(...values: Array<string | null | undefined>) {
  const notes = values.filter((value): value is string =>
    Boolean(value?.trim())
  )

  return notes.length > 0 ? notes.join("\n") : null
}

export { joinNotes }
