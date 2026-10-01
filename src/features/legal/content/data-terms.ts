import type { TermsSection } from "@/features/legal/types"

const dataTermsSections: ReadonlyArray<TermsSection> = [
  {
    title: "Intellectual property",
    paragraphs: [
      "RocketRota and its licensors retain their rights in the software, design, branding and documentation. Subject to these Terms and applicable fees, the Customer has a limited, non-exclusive, non-transferable right to use the Service for its internal business purposes, including access for its Authorised Users.",
      "The Customer retains its rights in Customer Data and permits us to host, process, display and transmit it as needed to provide and support the Service under the processing terms below. No ownership of either party's material is transferred. We may use voluntarily provided product feedback to improve the Service without payment, subject to confidentiality and data-protection obligations.",
    ],
  },
  {
    title: "Customer Data",
    paragraphs: [
      "The Customer must have the right and lawful basis to provide Customer Data. It is responsible for accuracy, informing workforce members how their information is used, managing access and exports, responding to employment-related questions, and determining appropriate workforce-record retention requirements.",
      "We process Customer Data to provide, secure, maintain and support the Service under documented instructions and the terms below. Account administration, billing and other processing for which we independently determine purposes are described in our Privacy Notice: [PRIVACY NOTICE URL].",
    ],
  },
  {
    title: "Data protection and processing terms",
    paragraphs: [
      "Each party must comply with applicable data-protection legislation, including the UK GDPR and the Data Protection Act 2018 as amended. For workforce personal data processed on the Customer's behalf, the Customer generally acts as controller and RocketRota as processor. We act as a separate controller where we independently determine purposes and means, such as for our own account administration, billing and legal obligations.",
      "This section and section 18 form the processing terms for Customer personal data processed on its behalf. They do not replace the separate Privacy Notice for processing where RocketRota is controller.",
    ],
    subsections: [
      {
        title: "Processing instructions",
        paragraphs: [
          "We will process Customer personal data only on documented instructions, including instructions about international transfers, unless UK law requires otherwise. These Terms, the Customer's configuration and use, and agreed written requests form those instructions. If law requires other processing, we will inform the Customer beforehand unless prohibited. We will immediately inform the Customer if, in our opinion, an instruction infringes applicable data-protection law.",
        ],
      },
      {
        title: "Confidentiality",
        paragraphs: [
          "We will ensure that persons authorised to process Customer personal data are committed to confidentiality or subject to an appropriate statutory duty of confidentiality.",
        ],
      },
      {
        title: "Security",
        paragraphs: [
          "We will implement appropriate technical and organisational measures required by Article 32 UK GDPR, accounting for the nature of processing and risks to individuals. Applicable measures: [SECURITY MEASURES OR SECURITY SCHEDULE URL]. The Customer must secure its own devices, credentials, permissions and exported files.",
        ],
      },
      {
        title: "Sub-processors",
        paragraphs: [
          "The Customer gives general written authorisation for sub-processors identified in [SUB-PROCESSOR LIST URL, INCLUDING PURPOSES AND PROCESSING LOCATIONS]. We will notify the Customer in advance of intended additions or replacements and allow a reasonable opportunity to object on data-protection grounds before the change. If an objection cannot be resolved, the parties will discuss an alternative or termination of the affected Service before the new processing begins.",
          "We will impose equivalent applicable data-protection obligations on sub-processors and remain responsible to the Customer for their performance. A provider acting as an independent controller is not a sub-processor for that processing.",
        ],
      },
      {
        title: "International transfers",
        paragraphs: [
          "We will make restricted international transfers only under documented instructions and applicable law, using an applicable adequacy regulation or appropriate safeguards where required. Processing locations and transfer safeguards: [INTERNATIONAL TRANSFER DETAILS OR URL].",
        ],
      },
      {
        title: "Individual rights",
        paragraphs: [
          "Taking account of the nature of processing, we will assist the Customer through appropriate technical and organisational measures, insofar as possible, in responding to individuals exercising data-protection rights. We will pass requests about Customer-controlled workforce data to the Customer and will not respond on its behalf unless instructed or legally required.",
        ],
      },
      {
        title: "Personal-data breaches",
        paragraphs: [
          "We will notify the Customer without undue delay after becoming aware of a personal-data breach affecting data processed on its behalf, and provide available information and updates to assist its assessment, regulatory notifications and communications to affected individuals.",
        ],
      },
      {
        title: "Compliance assistance",
        paragraphs: [
          "Taking account of the nature of processing and information available, we will assist the Customer with security, breach-notification, data-protection impact assessment and prior regulatory consultation obligations under Articles 32 to 36 UK GDPR.",
        ],
      },
      {
        title: "Information, audits and inspections",
        paragraphs: [
          "We will provide information necessary to demonstrate compliance with Article 28 and allow and contribute to audits and inspections by the Customer or its appointed auditor. Reasonable notice, confidentiality and proportionate arrangements may protect other customers and minimise disruption, but must not prevent an audit required by law or a regulator.",
        ],
      },
      {
        title: "End of processing",
        paragraphs: [
          "When processing services end, we will, at the Customer's choice, return or securely delete personal data processed on its behalf and delete existing copies unless UK law requires retention. Communicate this choice to [CONTACT EMAIL]. Data-return arrangements and post-termination retention: [DATA RETURN PROCESS AND RETENTION PERIOD].",
          "If no return instruction is given within that period, we will delete the data. Residual backups will be put beyond operational use, protected and removed under [BACKUP DELETION PERIOD]. Legally required retention is limited to that legal purpose. Cancelling billing alone is not an instruction to delete an otherwise continuing account.",
        ],
      },
    ],
  },
  {
    title: "Details of data processing",
    paragraphs: [
      "Subject matter: workforce management, rota scheduling, shift swaps, timesheets and optional time and attendance. Duration: while processing for the Customer continues and during the applicable return or deletion period afterwards.",
      "Nature and purpose: receiving, storing, organising, retrieving, displaying, calculating, correcting, exporting and transmitting workforce information to provide the configured Service. The Customer determines workforce purposes, information entered, authorised access and processing instructions, subject to these Terms and law.",
      "Categories of individuals: employees, workers, contractors, managers, workplace owners and other Authorised Users whose information is provided.",
      "Types of data: names and supplied contact details; workforce and payroll identifiers; roles, staff groups and location assignments; employment and pay-rate information; rota and shift records; swap requests and decisions; clock-in, clock-out, scheduled and payable times; attendance reasons and notes; station identifiers and clocking attempts; corrections and related activity records. Account identifiers and technical information may also associate records and secure access.",
      "Do not enter unnecessary personal data, medical details, other special-category data or criminal-offence data into free-text notes or other fields. Current features are not designed as a repository for these sensitive records. The Customer must inform workforce members about attendance recording and any monitoring it configures.",
    ],
  },
  {
    title: "Confidentiality",
    paragraphs: [
      "Each party must protect the other's confidential information with reasonable care, use it only for this agreement and disclose it only to people who need it for that purpose and are subject to appropriate confidentiality obligations.",
      "This does not cover information lawfully known already, independently developed, lawfully received elsewhere or public through no breach. Legally required disclosure is permitted, with advance notice where lawful. These obligations continue after termination while information remains confidential.",
    ],
  },
]

export { dataTermsSections }
