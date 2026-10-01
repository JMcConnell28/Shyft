import type { TermsSection } from "@/features/legal/types"

const generalTermsSections: ReadonlyArray<TermsSection> = [
  {
    title: "Availability and maintenance",
    paragraphs: [
      "We aim to provide a reliable Service and minimise disruption but do not guarantee uninterrupted or error-free access. Maintenance, security incidents, infrastructure failures, internet problems and third-party outages may interrupt access. We will give notice of planned material disruption where practicable. No specific uptime or support-response commitment applies unless separately agreed in writing.",
    ],
  },
  {
    title: "Beta and experimental features",
    paragraphs: [
      "If we explicitly label a feature as beta, preview or experimental, it may contain errors, change, have limited support or be withdrawn. The Customer should assess it before relying on it for critical processes. This applies only to features identified as such.",
    ],
  },
  {
    title: "Third-party services",
    paragraphs: [
      "The Service relies on third-party infrastructure, communications and payment services and may provide export formats for third-party software. Their independent operation can affect availability or compatibility. A Customer using a separate third-party product must comply with its applicable terms.",
      "We may change an integration when a provider changes or ends access. This does not remove our obligations to provide the Service with reasonable care and skill or our responsibility for sub-processors under section 17.",
    ],
  },
  {
    title: "Suspension",
    paragraphs: [
      "We may restrict or suspend access where reasonably necessary for non-payment, serious breach, suspected fraud or unlawful activity, security threats, harm to other customers or legal requirements. Restrictions will be proportionate where practicable. We will notify the Customer and provide an opportunity to resolve the issue where appropriate; urgent risks may require immediate action.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "Either party may terminate for a material breach not corrected within a reasonable period after written notice, where correction is possible. We may terminate or suspend immediately for serious fraud, unlawful activity, deliberate security abuse or where continued provision would be unlawful. The Customer may cancel under section 8 and request account closure through [CONTACT EMAIL].",
      "Termination does not affect accrued rights, fees or liabilities. Provisions intended to continue, including confidentiality, data return and deletion, intellectual property, payment, liability and dispute provisions, survive as applicable.",
    ],
  },
  {
    title: "Data following termination",
    paragraphs: [
      "Download available exports and request any further required records before access ends. Available exports do not necessarily include every record held. We do not promise continued self-service export access after termination; return and deletion of personal data remain governed by section 17.10. We are not required to keep Customer Data indefinitely after processing ends.",
    ],
  },
  {
    title: "Warranties",
    paragraphs: [
      "We will provide the Service with reasonable care and skill. Except for express commitments and rights that cannot lawfully be excluded, we give no additional warranties of uninterrupted availability, compatibility with every device or third-party product, or suitability for every particular business purpose.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "Nothing excludes or limits liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any liability that cannot lawfully be excluded or limited. Nothing restricts an individual's statutory data-protection rights.",
      "Subject to the above and to the extent permitted by law, neither party is liable to the other for indirect or consequential losses, including loss of profits, revenue, anticipated savings, business opportunities or goodwill where those losses are indirect or consequential.",
      "Subject to the above, and only to the extent permitted by law, RocketRota's total aggregate liability arising out of or in connection with the Service during any twelve-month period will not exceed subscription fees paid or payable by the Customer during the twelve months immediately preceding the event giving rise to the claim. This does not limit the Customer's obligation to pay fees properly due.",
    ],
  },
  {
    title: "Customer indemnity",
    paragraphs: [
      "The Customer is responsible for third-party claims, losses and reasonable costs suffered by RocketRota to the extent caused by the Customer's unlawful use, deliberate infringement of rights, unlawful processing of personal data or material breach of section 14, excluding any part caused by RocketRota.",
      "We will notify the Customer promptly of a claim, provide reasonable cooperation and take reasonable steps to reduce loss. We will not agree a settlement creating an obligation for the Customer without its consent, which must not be unreasonably withheld.",
    ],
  },
  {
    title: "Events outside reasonable control",
    paragraphs: [
      "Neither party is responsible for delay or failure to the extent caused by events outside its reasonable control, provided it takes reasonable steps to limit impact and resume performance. Examples include widespread telecommunications or power failures, natural disasters, government restrictions and major infrastructure failures. This does not excuse fees already due or obligations that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Changes to these Terms",
    paragraphs: [
      "We may update these Terms for changes to the Service, law, security requirements or business operations. We will give reasonable advance notice of material changes affecting existing Customers, unless urgent legal or security requirements prevent it. Updated Terms identify their effective date. Where required, we will seek fresh agreement.",
      "The Customer may cancel before a material change takes effect. Continued use afterwards constitutes acceptance where permitted by law and clearly explained in the notice. Changes do not remove rights accrued before they take effect.",
    ],
  },
  {
    title: "Notices",
    paragraphs: [
      "We may send contractual and operational notices to the Customer's registered email address or through the Service. The Customer must maintain current contact details and check these communications. Notices to RocketRota should be sent to [CONTACT EMAIL].",
    ],
  },
  {
    title: "Assignment",
    paragraphs: [
      "The Customer may not transfer this agreement without our prior written consent, which will not be unreasonably withheld. We may transfer it as part of a restructuring, sale, merger or transfer of the relevant business or assets, provided this does not materially reduce the Customer's rights, and will notify the Customer.",
    ],
  },
  {
    title: "Severability",
    paragraphs: [
      "If a provision is invalid or unenforceable, the remaining provisions continue. Any necessary modification must be limited to what is required to make the provision enforceable, where permitted by law.",
    ],
  },
  {
    title: "Waiver",
    paragraphs: [
      "A failure or delay to enforce a right does not waive it or prevent later enforcement.",
    ],
  },
  {
    title: "Third-party rights",
    paragraphs: [
      "Unless expressly stated otherwise, a person who is not a party has no right to enforce these Terms under the Contracts (Rights of Third Parties) Act 1999. This does not affect rights available independently under law, including individuals' data-protection rights.",
    ],
  },
  {
    title: "Entire agreement",
    paragraphs: [
      "These Terms, including sections 17 and 18 and schedules expressly referenced there, agreed checkout or activation details and any written order expressly agreed by both parties form the agreement for the Service. The Privacy Notice explains processing as controller; it does not replace processing terms for Customer-controlled data.",
      "For conflicts concerning personal-data processing, applicable processing terms take priority to the extent needed to comply with law. Nothing in this section excludes liability for fraud or fraudulent misrepresentation.",
    ],
  },
  {
    title: "Governing law and jurisdiction",
    paragraphs: [
      "These Terms and disputes or claims arising from them, including non-contractual disputes or claims, are governed by Northern Ireland law. The courts of Northern Ireland have exclusive jurisdiction, except where applicable law requires otherwise.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Send questions about these Terms, account closure or data return to [LEGAL BUSINESS NAME], trading as RocketRota. Email: [CONTACT EMAIL]. Address: [BUSINESS ADDRESS]. Website: rocketrota.com. The Help Centre provides product guidance but does not replace these contact details for legal notices.",
    ],
  },
]

export { generalTermsSections }
