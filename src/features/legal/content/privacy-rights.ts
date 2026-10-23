import { legalBusinessDetails } from "@/features/legal/business-details"
import type { LegalDocumentSection } from "@/features/legal/types"

const privacyRightsSections: ReadonlyArray<LegalDocumentSection> = [
  {
    title: "How long information is kept",
    paragraphs: [
      "We determine retention for information we control by its purpose: whether an account or customer relationship remains active, whether a support issue is resolved, the need to investigate security incidents, applicable legal record-keeping duties and the period reasonably needed to establish or defend claims. We should not keep information simply because it might be useful later. Final operational retention and deletion schedules are being confirmed before launch.",
      "Your workplace determines retention instructions for its workforce records, subject to applicable law and our processing agreement. Ending a subscription or deactivating an employee does not automatically erase historical records. Account closure and deletion are separate from cancellation of renewal. Return and deletion of workplace information are covered by the processing terms; this notice does not promise a self-service download or export feature.",
      "Any backup copies must remain protected and beyond ordinary use until they expire or are deleted under the applicable retention arrangements. The actual backup arrangements and deletion period have not yet been confirmed; we do not claim automatic daily backups or a fixed backup-deletion deadline in this draft.",
    ],
  },
  {
    title: "Cookies and information stored on your device",
    paragraphs: [
      "Sign-in uses cookies to recognise your session and a short-lived session cache configured for five minutes. Signing out ends the current sign-in session; session lifetime and browser cookie settings also affect how long sign-in information remains. Necessary authentication and security storage supports the service you request.",
      "The interface can save a sidebar preference in a cookie called sidebar_state for up to seven days. Local storage can remember that a welcome message has been dismissed and can remain until cleared. Appearance settings may also be saved by your browser. The installed web app uses a service worker to cache assets such as icons, images, styles and an offline page; it is not designed to store your live rota or timesheet pages for offline access.",
      "The current application does not integrate advertising pixels or third-party advertising analytics. Internal operational records described above are separate from advertising tracking. Providers such as Stripe have their own storage practices on their services. We must assess and obtain consent before introducing any storage or tracking use that requires it.",
      "You can manage, block or clear cookies and site storage through your browser; doing so can sign you out or reset preferences, and blocking necessary storage can prevent features from working. Contact us if you want to object to optional preference storage. Push notifications can be turned off through app preferences where available and through browser or device settings.",
    ],
  },
  {
    title: "Automated processing and workplace decisions",
    paragraphs: [
      "RocketRota automatically performs calculations and applies configured rules, including cost estimates, usage totals, clocking flags and payable-time calculations. These assist workplace review; they do not determine what wages are legally due. Your workplace remains responsible for employment and payroll decisions and should check the underlying records and settings.",
      "RocketRota does not itself use these features to make solely automated hiring, dismissal or similar decisions with legal or comparably significant effects on individuals. Ask your workplace how it uses the information when making decisions about you.",
    ],
  },
  {
    title: "Your data-protection rights",
    paragraphs: [
      "Depending on the information, purpose and lawful basis, you can request access to your personal information, correction, erasure, restriction of processing and, in applicable cases, a portable copy. You can object to processing based on legitimate interests and to direct marketing. Where we rely on consent, you can withdraw it without affecting the lawfulness of earlier processing. These rights have legal conditions and exceptions.",
      `For information RocketRota controls, contact ${legalBusinessDetails.contactEmail} once the mailbox is active, or use in-app support. For employer-controlled records, contact your workplace first; we will help it handle requests under our processing obligations. We may need proportionate information to verify identity or authority and protect other people's information. A privacy-rights request does not depend on a self-service export feature.`,
      "We handle requests without undue delay and within the applicable legal time limit, normally one month. We will explain any lawful extension, verification requirement or refusal that applies. Requests are normally free; any fee or refusal must be permitted by law. Access and portability rights are not limited by a commercial account-closure request window.",
    ],
  },
  {
    title: "Concerns and complaints",
    paragraphs: [
      "Please raise privacy concerns through the contact routes above so we can investigate and respond. For workplace decisions or workforce records, your workplace is normally the first contact. You can also complain to the Information Commissioner's Office, the UK's data-protection regulator, or another competent supervisory authority where applicable. You do not have to obtain our permission to complain.",
    ],
    links: [
      {
        label: "Raise a concern with the ICO",
        href: "https://ico.org.uk/make-a-complaint/",
      },
    ],
  },
  {
    title: "Changes to this notice",
    paragraphs: [
      "We will update this notice when our practices, providers or legal requirements change. The date above identifies the latest version. We will bring material changes to affected users' attention through an appropriate channel, and seek consent where a new activity requires it rather than treating continued use as blanket privacy consent.",
    ],
  },
]

export { privacyRightsSections }
