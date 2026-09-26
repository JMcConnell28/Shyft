const content = {
  padding: "28px 28px 30px",
  textAlign: "center" as const,
}

const heading = {
  color: "#0a2456",
  fontSize: "30px",
  fontWeight: "800",
  letterSpacing: "-0.8px",
  lineHeight: "38px",
  margin: "0 0 12px",
}

const message = {
  color: "#4b6391",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 auto 24px",
  maxWidth: "440px",
}

const summary = {
  backgroundColor: "#f4f8ff",
  border: "1px solid #e4edfb",
  borderRadius: "10px",
  margin: "0 0 16px",
  padding: "14px 12px",
  textAlign: "left" as const,
}

const summaryColumn = {
  padding: "0 7px",
  verticalAlign: "top" as const,
}

const summaryLabel = {
  color: "#60749b",
  fontSize: "11px",
  lineHeight: "17px",
  margin: "0 0 3px",
}

const summaryValue = {
  color: "#0a2456",
  fontSize: "13px",
  fontWeight: "700",
  lineHeight: "18px",
  margin: "0",
}

const table = {
  border: "1px solid #e4edfb",
  borderCollapse: "separate" as const,
  borderRadius: "10px",
  borderSpacing: "0",
  fontSize: "12px",
  margin: "0 0 24px",
  tableLayout: "fixed" as const,
  textAlign: "left" as const,
  width: "100%",
}

const tableHeader = {
  backgroundColor: "#f0f5fd",
  color: "#4b6391",
  fontSize: "11px",
  fontWeight: "700",
  padding: "10px 6px",
}

const tableCell = {
  borderTop: "1px solid #e4edfb",
  color: "#0a2456",
  lineHeight: "18px",
  padding: "9px 6px",
  verticalAlign: "top" as const,
  wordBreak: "break-word" as const,
}

const tableMutedCell = { ...tableCell, color: "#7a8caf" }

const noteTitle = {
  color: "#0a2456",
  fontSize: "14px",
  fontWeight: "700",
  lineHeight: "21px",
  margin: "0 0 3px",
}

const noteText = {
  color: "#60749b",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
}

export {
  content,
  heading,
  message,
  noteText,
  noteTitle,
  summary,
  summaryColumn,
  summaryLabel,
  summaryValue,
  table,
  tableCell,
  tableHeader,
  tableMutedCell,
}
