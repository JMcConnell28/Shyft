import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

import {
  card,
  divider,
  header,
  page,
  wordmark,
} from "@/features/email/templates/branded-email-styles"

type BrandedEmailLayoutProps = {
  brandLogoUrl: string
  children: ReactNode
  preview: string
}

function BrandedEmailLayout({
  brandLogoUrl,
  children,
  preview,
}: BrandedEmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={page}>
        <Container style={card}>
          <Section style={header}>
            <Row>
              <Column style={{ width: "56px" }}>
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
                  <span style={{ color: "#102f69" }}>Rocket</span>
                  <span style={{ color: "#1768f6" }}>Rota</span>
                </Text>
              </Column>
            </Row>
          </Section>
          <Hr style={divider} />
          {children}
        </Container>
      </Body>
    </Html>
  )
}

export { BrandedEmailLayout }
