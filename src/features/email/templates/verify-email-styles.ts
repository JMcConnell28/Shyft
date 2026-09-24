const page = {
  backgroundColor: "#f2f7ff",
  color: "#0b2a63",
  fontFamily:
    'Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: "0",
  padding: "24px 12px",
}

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4edfb",
  borderRadius: "24px",
  boxShadow: "0 18px 55px rgba(39, 105, 190, 0.14)",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden" as const,
}

const header = {
  padding: "10px 42px",
}

const content = {
  padding: "28px 48px 42px",
  textAlign: "center" as const,
}

const heading = {
  color: "#0a2456",
  fontSize: "38px",
  fontWeight: "800",
  letterSpacing: "-1.2px",
  lineHeight: "46px",
  margin: "12px 0 14px",
}

const message = {
  color: "#4b6391",
  fontSize: "18px",
  lineHeight: "29px",
  margin: "0 auto 28px",
  maxWidth: "440px",
}

const button = {
  backgroundColor: "#0f6fff",
  borderRadius: "12px",
  boxShadow: "0 10px 24px rgba(15, 111, 255, 0.22)",
  color: "#ffffff",
  display: "block",
  fontSize: "17px",
  fontWeight: "700",
  margin: "0 auto",
  maxWidth: "330px",
  padding: "16px 24px",
  textAlign: "center" as const,
  textDecoration: "none",
}

const footerText = {
  color: "#60749b",
  fontSize: "13px",
  lineHeight: "21px",
  margin: "0 0 14px",
  textAlign: "center" as const,
}

const fallbackText = {
  color: "#8190ad",
  fontSize: "11px",
  lineHeight: "18px",
  margin: "0 0 18px",
  textAlign: "center" as const,
}

const fallbackLink = {
  color: "#5076b5",
  wordBreak: "break-all" as const,
}

export {
  button,
  card,
  content,
  fallbackLink,
  fallbackText,
  footerText,
  header,
  heading,
  message,
  page,
}
