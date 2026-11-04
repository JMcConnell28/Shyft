import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = process.cwd()
const directory = path.join(root, "src/features/email")
const edits = []
const components = new Set()
function inspect(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name)
    if (entry.isDirectory()) { inspect(file); continue }
    if (!/\.tsx?$/.test(file)) continue
    const source = fs.readFileSync(file, "utf8")
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    const replacements = []
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier) || node.moduleSpecifier.text !== "@react-email/components") continue
      const testing = file.includes(".test.")
      if (!testing) {
        const bindings = node.importClause?.namedBindings
        if (!bindings || !ts.isNamedImports(bindings)) throw new Error("Unexpected email import shape")
        for (const item of bindings.elements) components.add(item.propertyName?.text ?? item.name.text)
      }
      replacements.push({ start: node.moduleSpecifier.getStart(ast) + 1, end: node.moduleSpecifier.getEnd() - 1, value: testing ? "@/features/email/testing/render" : "@/features/email/components/primitives" })
    }
    let updated = source
    for (const edit of replacements.reverse()) updated = updated.slice(0, edit.start) + edit.value + updated.slice(edit.end)
    if (updated !== source) edits.push({ file, source: updated })
  }
}
inspect(directory)
const manifestPath = path.join(root, "package.json")
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
delete manifest.dependencies["@react-email/components"]
const lines = []
for (const component of [...components].sort()) {
  const name = `@react-email/${component.toLowerCase()}`
  const metadata = JSON.parse(fs.readFileSync(path.join(root, "node_modules", name, "package.json"), "utf8"))
  manifest.dependencies[name] = metadata.version
  lines.push(`export { ${component} } from "${name}"`)
}
manifest.dependencies = Object.fromEntries(Object.entries(manifest.dependencies).sort(([a], [b]) => a.localeCompare(b)))
for (const edit of edits) fs.writeFileSync(edit.file, edit.source)
fs.mkdirSync(path.join(directory, "components"), { recursive: true })
fs.writeFileSync(path.join(directory, "components/primitives.ts"), lines.join("\n") + "\n")
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
console.log(`Replaced ${edits.length} aggregate imports with ${components.size} pinned email primitives.`)
