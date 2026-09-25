import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"

import { appName } from "@/features/email/templates/email-styles"
import {
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
} from "@/features/email/templates/verify-email-styles"

type VerifyEmailProps = {
  brandLogoUrl: string
  emailGraphicUrl: string
  verificationUrl: string
}

const divider = {
  borderColor: "#e4edfb",
  margin: "0",
}

function VerifyEmail({
  brandLogoUrl,
  emailGraphicUrl,
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your {appName} account</Preview>
      <Body style={page}>
        <Container style={card}>
          <Section style={header}>
            <Row>
              <Column style={logoColumn}>
                <Img
                  alt="RR"
                  height="44"
                  src={brandLogoUrl}
                  style={{ display: "block" }}
                  width="44"
                />
              </Column>
              <Column>
                <Text style={wordmark}>
                  <span style={wordmarkFirst}>Rocket</span>
                  <span style={wordmarkSecond}>Rota</span>
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Img
              alt="An envelope with a verification checkmark"
              height="128"
              src={emailGraphicUrl}
              style={{ display: "block", margin: "0 auto" }}
              width="128"
            />
            <Heading as="h1" style={heading}>
              Verify your email
            </Heading>
            <Text style={message}>
              Thanks for creating a {appName} account. Please verify your email
              address before continuing.
            </Text>
            <Button
              href={verificationUrl}
              rel="noopener noreferrer"
              style={button}
              target="_blank"
            >
              Verify email&nbsp;&nbsp;→
            </Button>

            <Hr style={{ ...divider, margin: "26px 0 18px" }} />

            <Text style={footerText}>
              If you didn&apos;t create an account, you can ignore this email.
            </Text>
            <Text style={fallbackText}>
              Button not working?{" "}
              <Link
                href={verificationUrl}
                rel="noopener noreferrer"
                style={fallbackLink}
                target="_blank"
              >
                Open the verification link.
              </Link>
            </Text>
            <Text style={{ ...footerText, marginBottom: "0" }}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export { VerifyEmail }
