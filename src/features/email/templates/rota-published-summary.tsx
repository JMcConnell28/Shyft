import { Column, Row, Section, Text } from "@react-email/components"

import {
  summary,
  summaryColumn,
  summaryLabel,
  summaryValue,
} from "@/features/email/templates/rota-published-styles"

type RotaPublishedSummaryProps = {
  locationName: string
  totalHours: string
  weekLabel: string
}

function RotaPublishedSummary({
  locationName,
  totalHours,
  weekLabel,
}: RotaPublishedSummaryProps) {
  return (
    <Section style={summary}>
      <Row>
        <Column style={{ ...summaryColumn, width: "34%" }}>
          <Text style={summaryLabel}>Location</Text>
          <Text style={summaryValue}>{locationName}</Text>
        </Column>
        <Column style={{ ...summaryColumn, width: "42%" }}>
          <Text style={summaryLabel}>Week</Text>
          <Text style={summaryValue}>{weekLabel}</Text>
        </Column>
        <Column style={{ ...summaryColumn, width: "24%" }}>
          <Text style={summaryLabel}>Total hours</Text>
          <Text style={summaryValue}>{totalHours} hours</Text>
        </Column>
      </Row>
    </Section>
  )
}

export { RotaPublishedSummary }
