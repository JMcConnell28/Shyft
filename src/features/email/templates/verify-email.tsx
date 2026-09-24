import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
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
  message,
  page,
} from "@/features/email/templates/verify-email-styles"

type VerifyEmailProps = {
  brandWordmarkUrl: string
  emailGraphicUrl: string
  fontUrl: string
  verificationUrl: string
}

const divider = {
  borderColor: "#e4edfb",
  margin: "0",
}

function VerifyEmail({
  brandWordmarkUrl,
  emailGraphicUrl,
  fontUrl,
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fallbackFontFamily={["Arial", "Helvetica"]}
          fontFamily="Manrope"
          fontStyle="normal"
          fontWeight={400}
          webFont={{ format: "woff2", url: fontUrl }}
        />
        <Font
          fallbackFontFamily={["Arial", "Helvetica"]}
          fontFamily="Manrope"
          fontStyle="normal"
          fontWeight={700}
          webFont={{ format: "woff2", url: fontUrl }}
        />
        <Font
          fallbackFontFamily={["Arial", "Helvetica"]}
          fontFamily="Manrope"
          fontStyle="normal"
          fontWeight={800}
          webFont={{ format: "woff2", url: fontUrl }}
        />
      </Head>
      <Preview>Verify your {appName} account</Preview>
      <Body style={page}>
        <Container style={card}>
          <Section style={header}>
            <Img
              alt="RocketRota"
              height="80"
              src={brandWordmarkUrl}
              style={{ display: "block" }}
              width="240"
            />
          </Section>

          <Hr style={divider} />

          <Section style={content}>
            <Img
              alt="An envelope with a verification checkmark"
              height="250"
              src={emailGraphicUrl}
              style={{ display: "block", margin: "0 auto" }}
              width="250"
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

            <Hr style={{ ...divider, margin: "38px 0 24px" }} />

            <Text style={footerText}>
              If you didn&apos;t create an account, you can ignore this email.
            </Text>
            <Text style={fallbackText}>
              Button not working? Open this link: <br />
              <Link
                href={verificationUrl}
                rel="noopener noreferrer"
                style={fallbackLink}
                target="_blank"
              >
                {verificationUrl}
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
