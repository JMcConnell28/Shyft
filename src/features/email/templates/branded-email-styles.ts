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

const header = { padding: "20px 28px" }

const wordmark = {
  fontSize: "25px",
  fontWeight: "800",
  letterSpacing: "-1px",
  lineHeight: "30px",
  margin: "0",
}

const divider = {
  borderColor: "#e4edfb",
  margin: "0",
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

const footerLink = {
  color: "#5076b5",
  textDecoration: "underline",
}

export { button, card, divider, footerLink, footerText, header, page, wordmark }
