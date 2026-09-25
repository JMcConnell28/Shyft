const page = {
  backgroundColor: "#f2f7ff",
  color: "#0b2a63",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: "0",
  padding: "16px 12px",
}

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4edfb",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  width: "100%",
}

const header = {
  padding: "20px 28px",
}

const logoColumn = {
  width: "56px",
}

const wordmark = {
  fontSize: "25px",
  fontWeight: "800",
  letterSpacing: "-1px",
  lineHeight: "30px",
  margin: "0",
}

const wordmarkFirst = {
  color: "#102f69",
}

const wordmarkSecond = {
  color: "#1768f6",
}

const content = {
  padding: "24px 28px 30px",
  textAlign: "center" as const,
}

const heading = {
  color: "#0a2456",
  fontSize: "30px",
  fontWeight: "800",
  letterSpacing: "-0.8px",
  lineHeight: "38px",
  margin: "16px 0 12px",
}

const message = {
  color: "#4b6391",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 auto 24px",
  maxWidth: "390px",
}

const button = {
  backgroundColor: "#0f6fff",
  borderRadius: "8px",
  color: "#ffffff",
  display: "block",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 auto",
  maxWidth: "250px",
  padding: "14px 20px",
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
  textDecoration: "underline",
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
  logoColumn,
  message,
  page,
  wordmark,
  wordmarkFirst,
  wordmarkSecond,
}
