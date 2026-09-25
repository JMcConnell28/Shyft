import {
  Button,
  Column,
  Heading,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components"

import { BrandedEmailLayout } from "@/features/email/templates/branded-email-layout"
import {
  button,
  divider,
  footerLink,
  footerText,
} from "@/features/email/templates/branded-email-styles"
import { appName } from "@/features/email/templates/email-styles"
import {
  content,
  graphic,
  heading,
  message,
  stepDescription,
  stepNumber,
  stepNumberColumn,
  stepRow,
  stepTitle,
  stepsBox,
} from "@/features/email/templates/organization-welcome-styles"

type OrganizationWelcomeEmailProps = {
  brandLogoUrl: string
  dashboardUrl: string
  helpUrl: string
  organizationName: string
  userName: string
  welcomeGraphicUrl: string
}

const nextSteps = [
  {
    title: "Invite your team",
    description: "Add managers and team members to your organisation.",
  },
  {
    title: "Build your first rota",
    description: "Create shifts, assign people, and get organised.",
  },
  {
    title: "Set up billing",
    description: "Review your plan and payment details when you are ready.",
  },
] as const

function OrganizationWelcomeEmail({
  brandLogoUrl,
  dashboardUrl,
  helpUrl,
  organizationName,
  userName,
  welcomeGraphicUrl,
}: OrganizationWelcomeEmailProps) {
  return (
    <BrandedEmailLayout
      brandLogoUrl={brandLogoUrl}
      preview={`${organizationName} is ready in ${appName}`}
    >
      <Section style={content}>
        <Img
          alt="RocketRota dashboard with a rota, calendar, and team"
          height="213"
          src={welcomeGraphicUrl}
          style={graphic}
          width="320"
        />
        <Heading as="h1" style={heading}>
          Welcome to {appName}
        </Heading>
        <Text style={message}>
          Hi {userName}, {organizationName} is ready to go. Your first location
          is set up, and you can start planning with your team.
        </Text>
        <Button href={dashboardUrl} style={button}>
          Open dashboard&nbsp;&nbsp;→
        </Button>

        <Section style={stepsBox}>
          {nextSteps.map((step, index) => (
            <Section
              key={step.title}
              style={{
                ...stepRow,
                borderTop: index === 0 ? "none" : "1px solid #dfe9f8",
              }}
            >
              <Row>
                <Column style={stepNumberColumn}>
                  <Text style={stepNumber}>{index + 1}</Text>
                </Column>
                <Column style={{ textAlign: "left" }}>
                  <Text style={stepTitle}>{step.title}</Text>
                  <Text style={stepDescription}>{step.description}</Text>
                </Column>
              </Row>
            </Section>
          ))}
        </Section>

        <Hr style={{ ...divider, margin: "26px 0 18px" }} />
        <Text style={footerText}>
          Need help?{" "}
          <Link href={helpUrl} style={footerLink}>
            Visit the Help Centre.
          </Link>
        </Text>
        <Text style={{ ...footerText, marginBottom: "0" }}>
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </Text>
      </Section>
    </BrandedEmailLayout>
  )
}

export { OrganizationWelcomeEmail }
