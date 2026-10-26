import type { PersonalDataResponse } from "@rocketrota/shared/privacy"

const privacyFixture: PersonalDataResponse = {
  version: 1,
  requestId: "00000000-0000-4000-8000-000000000001",
  generatedAt: "2026-10-26T12:00:00.000Z",
  subject: {
    userId: "subject-user",
    name: "Test subject",
    email: "subject@example.com",
  },
  summary: "A reviewed response to your request.",
  processing: {
    purposes: "Providing and securing the service.",
    recipients: "The listed service providers.",
    retention: "The applicable retention criteria described in this response.",
    sources: "You and your workplace.",
    rights:
      "Contact us to correct information or exercise your rights; you can complain to the ICO.",
    internationalTransfers:
      "The transfer arrangements applicable to the listed providers.",
    automatedProcessing:
      "Scheduling and payable-time calculations assist human review.",
  },
  sections: [{ title: "Profile", records: [{ name: "Test subject" }] }],
  scopeAndRedactions:
    "Workplace authority and third-party information have been reviewed.",
}
export { privacyFixture }
