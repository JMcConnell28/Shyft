const rotaNotePrompts = [
  "Opening",
  "Closing",
  "Entertainment",
  "Cleaning",
  "Special events",
] as const

function buildNotePromptTemplate(label: string) {
  return `${label}\n- `
}

export { buildNotePromptTemplate, rotaNotePrompts }
