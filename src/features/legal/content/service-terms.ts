import type { TermsSection } from "@/features/legal/types"

const serviceTermsSections: ReadonlyArray<TermsSection> = [
  {
    title: "About RocketRota",
    paragraphs: [
      "These Terms and Conditions govern access to and use of RocketRota, a workforce scheduling, rota management and time and attendance service for businesses employing shift-based workers (the Service).",
      "The Service is provided by [LEGAL BUSINESS NAME], trading as RocketRota, at [BUSINESS ADDRESS]. Email: [CONTACT EMAIL]. Company registration number, if applicable: [COMPANY NUMBER]. Website: rocketrota.com. RocketRota, we, us and our mean this service provider.",
      "Customer means the organisation or business using or purchasing the Service. Authorised Users means owners, administrators, managers, employees and other workforce members permitted to access it. Customer Data means information and records submitted by the Customer or its Authorised Users.",
    ],
  },
  {
    title: "Business use and agreement",
    paragraphs: [
      "RocketRota is provided for business use. By creating a workplace, purchasing a subscription or accepting these Terms for a business, you confirm that you are authorised to enter into this agreement on its behalf. The Customer is responsible for ensuring that its Authorised Users comply with these Terms.",
      "A workforce member joining a workplace agrees to the provisions governing their own use. Joining does not by itself authorise that person to enter into a subscription or other commercial commitment for the Customer. The Customer controls workplace access and permissions.",
    ],
  },
  {
    title: "The Service",
    paragraphs: [
      "Depending on enabled features and permissions, RocketRota provides staff and staff-group management; organisation, location and zone management; draft and published rotas; shift assignments, templates and rota copying; rota notifications; optional shift-swap requests and approvals; labour-cost and budget estimates; rota PDF exports; timesheets comparing scheduled, recorded and payable hours; optional NFC clock-in and clock-out recording; manager corrections and review of time records; and Sage timesheet CSV exports.",
      "Time & Attendance is an optional add-on enabled by location. Shift swaps must be enabled by the workplace. Functions also depend on user permissions and billing status. These Terms do not promise standalone availability or leave-management tools, automated legal compliance, a full payroll service or a direct connection to every payroll provider.",
      "Features may be added, modified or improved. We will not materially reduce the core functionality of a paid subscription during its current paid period without reasonable justification. Where practicable, we will give advance notice of a material reduction and explain the Customer's options.",
    ],
  },
  {
    title: "Accounts and security",
    paragraphs: [
      "Provide accurate account and workplace information and keep it current. Each user must keep their sign-in credentials secure and must not share their account. Tell us promptly if you suspect unauthorised access.",
      "The Customer must assign appropriate permissions, maintain accurate employee details and remove access when no longer needed. It is responsible for use it authorises and activity through its accounts, except to the extent caused by a security failure for which RocketRota is responsible.",
    ],
  },
  {
    title: "Trials, subscriptions and fees",
    paragraphs: [
      "The trial duration and limits are shown in the Service. The standard trial currently lasts 14 days and permits up to three rotas across the workplace. Creating an account does not require a payment method. Without an active paid subscription after the trial, paid actions may become unavailable.",
      "Saving a payment method through the trial checkout sets up a subscription that starts charging when the remaining trial ends unless cancelled beforehand. It does not restart or extend the trial. If the trial has ended, completing paid checkout starts a paid subscription. Subscriptions automatically renew for the billing period shown at checkout until cancelled.",
      "The current standard plan has one monthly base charge per organisation, including its first 10 used employees. A used employee is a distinct employee assigned to a published shift dated within the billing period or with a qualifying time entry in that period. Each employee is counted once across the organisation, even when working at multiple locations. Merely adding an employee profile does not make that employee billable.",
      "Employees above the included allowance incur the displayed per-employee charge. Time & Attendance incurs a separate charge for each distinct used employee with qualifying usage at a location where the add-on is enabled, including published shift assignments even if the employee does not clock in. Deactivating an employee does not erase usage already recorded for the period. Disabling the add-on does not remove charges already incurred.",
      "Prices, billing periods, allowances, add-on charges and applicable taxes are shown on the pricing page and during checkout or activation. Fixed subscription charges are generally billed in advance; metered employee and Time & Attendance usage is billed in arrears after the relevant period. Estimates may change as usage increases. The Customer authorises collection of fees properly due through its saved payment method and must keep payment details current.",
    ],
  },
  {
    title: "Price changes",
    paragraphs: [
      "We may change pricing. For an existing paid subscription, a price increase will take effect no earlier than the next renewal after reasonable advance notice. The Customer may cancel before the new pricing takes effect. An increase in recorded usage under existing rates is not a price change.",
    ],
  },
  {
    title: "Failed payments",
    paragraphs: [
      "If payment fails, we may retry collection and contact the Customer. The Service currently provides a five-day grace period for past-due subscriptions before paid actions are restricted. Unpaid or otherwise inactive subscriptions may also have restricted access. Resolving outstanding billing restores access subject to the subscription's status.",
      "We may suspend or terminate a subscription if payment remains outstanding, normally after notice and a reasonable opportunity to resolve the issue. Restriction or suspension does not cancel fees already properly incurred.",
    ],
  },
  {
    title: "Cancellation",
    paragraphs: [
      "An authorised billing administrator can manage or cancel the subscription through Manage billing. Contact [CONTACT EMAIL] if these controls are unavailable. Cancellation normally stops renewal at the end of the current subscription period; check the effective date shown. To prevent a trial subscription becoming paid, cancel before the displayed trial end.",
      "Time & Attendance can be cancelled separately for a location through its add-on controls and remains enabled until the cancellation date shown. Cancelling an add-on does not cancel the core subscription. Cancelling a subscription does not itself delete the workplace or its records.",
      "Unless otherwise agreed or required by law, fees already paid are non-refundable and unused portions of a billing period are not credited. Cancellation does not waive outstanding fees or final metered usage charges, which may be invoiced afterwards. This does not remove remedies for our breach or rights that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Customer responsibilities",
    paragraphs: [
      "The Customer remains responsible for its staffing decisions, business operations, employment contracts, payroll, taxation, record keeping, employee privacy, health and safety, and compliance with employment, working-time, rest-period and minimum-wage rules.",
      "Cost estimates, rates, warnings, budgets and calculated hours depend on entered information and settings. The Customer must verify them before making employment or payment decisions. RocketRota does not provide legal, employment, payroll, tax or accounting advice or determine whether a workplace is legally compliant.",
    ],
  },
  {
    title: "Rotas, shift swaps and notifications",
    paragraphs: [
      "The Customer must check rotas before and after publication, including assignments, times, locations, coverage and subsequent changes. Draft changes should not be treated as communicated to staff until published. Where swaps are enabled, requests and approvals follow the available workflow and permissions; a request alone does not change an assigned shift.",
      "Email, push and in-app notifications depend on contact details, user settings, device permissions, connectivity and delivery providers. Delivery or viewing is not guaranteed. The Customer should use an additional communication method for urgent or legally important changes, and Authorised Users should check their published schedules.",
    ],
  },
  {
    title: "Time and attendance",
    paragraphs: [
      "When Time & Attendance and clocking are enabled for a location, employees can clock in and out using a supported device to tap a configured secure NFC station and complete the authenticated clocking flow. Records may include scheduled times, actual clock times, separately calculated payable times, shift segments, clocking source and station, reasons, failed attempts and manager adjustments.",
      "Actual and payable times can differ because of configured grace periods, scheduled-time rules, early-start choices or manager corrections. Flags and payable hours assist review; they do not decide what wages are legally due. The Customer must check settings and resolve missing, open, disputed or review-flagged records before payroll. The Service does not currently provide a separate break-start and break-end clocking workflow.",
      "Device compatibility, internet access, incomplete clocking actions, incorrect station setup and technical issues can affect records. A secure NFC tap is not conclusive proof of identity, physical presence throughout a shift or hours actually worked. Employees should report errors to their workplace; authorised managers can make corrections using available controls.",
    ],
  },
  {
    title: "Clock-in stations",
    paragraphs: [
      "A location activating Time & Attendance may be eligible to request an included NFC station, as shown in the activation flow. Fulfilment is currently limited to supported delivery addresses in postcode areas BT47 and BT48. Do not assume hardware is available in every region or that activating the add-on means a station has been delivered.",
      "The Customer is responsible for placement, protection and day-to-day management and for contacting support when a station needs moving, replacement or reconfiguration. Do not tamper with security features, duplicate secure identifiers or bypass clocking protections. Each station must be used for its configured location.",
      "Additional hardware charges, delivery estimates, ownership or return requirements, replacement arrangements and warranty terms must be disclosed and agreed when hardware is supplied or separately ordered. These Terms do not promise a delivery deadline or unlimited free replacements.",
    ],
  },
  {
    title: "Payroll and exports",
    paragraphs: [
      "RocketRota provides rota PDF exports and a Sage timesheet CSV export for completed, published rota weeks. Sage export requires employee payroll IDs and resolution of open or review-flagged entries. These are files for the Customer to review and use; they do not automatically submit payroll, pay employees or make tax filings.",
      "The Customer must verify identifiers, hours, rates, mappings and payroll-system import settings before processing payroll. Compatibility depends on the supported format and receiving system; third-party changes may affect it. RocketRota does not guarantee compatibility with every Sage product or other payroll provider.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "Customers and Authorised Users must not use the Service unlawfully or fraudulently, infringe others' rights, upload malicious material, access accounts or data without authorisation, test security controls without permission, deliberately disrupt the Service, circumvent subscription or usage restrictions, or copy or reverse engineer the software except as permitted by law.",
      "Do not scrape or automatically extract substantial amounts of information without permission, except through available exports or as permitted by law. We may restrict access where reasonably necessary to address a security, legal or operational risk.",
    ],
  },
]

export { serviceTermsSections }
