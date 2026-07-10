import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

import { appName } from "@/features/email/templates/email-styles"

type AuthEmailLayoutProps = {
  children: ReactNode
  preview: string
}

const page = {
  backgroundColor: "#f6f7f9",
  color: "#111827",
  fontFamily:
    'Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: "0",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  margin: "32px auto",
  maxWidth: "560px",
  padding: "32px",
}

const brand = {
  color: "#1f5f9f",
  fontSize: "18px",
  fontWeight: "700",
  lineHeight: "24px",
  margin: "0",
}

const footer = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
}

function AuthEmailLayout({ children, preview }: AuthEmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={page}>
        <Container style={container}>
          <Text style={brand}>{appName}</Text>
          <Section>{children}</Section>
          <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0 18px" }} />
          <Text style={footer}>
            This email was sent because someone used this address with
            {appName}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export { AuthEmailLayout }
