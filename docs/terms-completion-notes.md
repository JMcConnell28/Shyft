# Terms completion notes

Internal drafting notes, 23 October 2026. These notes are not part of the customer contract. The terms remain a draft while the items below are unresolved.

## Confirmed details

- Provider: Jack McConnell trading as RocketRota, a sole trader. Company-registration wording has been removed.
- Intended contact: RocketRota@gmail.com. Jack still needs to create and monitor this mailbox.
- Effective date and terms version: 23 October 2026 / 2026-10-23.
- Privacy-notice URL: https://rocketrota.com/privacy. A pre-launch draft page now exists with footer and sign-up links. It identifies unresolved business contact, provider, retention and backup details, and does not promise a self-service export feature.
- Cancellation stops renewal; access continues until the paid period ends, subject to the existing suspension and termination provisions.
- No routine cancellation, non-use or unused-period refunds. Remedies for breach and mandatory legal rights remain preserved. Final metered charges remain payable.
- Customers have 30 days after account closure or the end of processing services to request data return. Cancelling renewal alone does not start that window.
- Application hosting: netcup VPS in Germany, deployed using Coolify Cloud (confirmed by Jack).
- Supabase: the project referenced by both local and hosted environment files is in eu-west-1 (Ireland). Its organisation reports the Free plan, verified through the connected Supabase service on 23 October 2026.
- Transactional email: Resend. Its published DPA identifies Plus Five Five, Inc. and primary US processing.
- Hosted deployment management: Coolify Cloud, provided by coolLabs Solutions Kft. Its public privacy policy describes EU storage for account email addresses; this does not verify all locations or contractual arrangements for deployment data, server access, secrets or application logs.

## Required before publication

1. Choose and supply the geographic business address. The provider has not chosen one yet; sole-trader status does not remove the address requirement.
2. Create and test the contact mailbox. Check suitable data-protection arrangements before using a mailbox to process customer-controlled workforce information; do not send workforce exports as ordinary email attachments by default.
3. Complete the remaining facts in the privacy draft before launch. Review the necessity and purpose of mandatory date-of-birth collection, the precise controller retention schedule, provider agreements, optional storage handling and applicable transfer safeguards. Do not remove the draft notice until these are settled.
4. Confirm Coolify Cloud's relevant processing locations and processor agreement, and any CDN, support, monitoring or backup providers processing customer data. Germany is confirmed for the VPS; the exact city is not necessary for the country-level disclosure. Coolify Cloud must be assessed separately from the VPS because it manages deployment/server access.
5. Verify production HTTPS, database transport protection, server/admin access controls, patching, and incident handling before completing the infrastructure security schedule. The schedule currently describes application controls found in the repository; it is not a security certification and does not close findings in security_best_practices_report.md.
6. Establish an actual backup and recovery process, destination, access protection, maximum retention and successful restore test. The Supabase Free plan does not establish customer-accessible daily backups. A VPS snapshot does not automatically back up the external Supabase database. Do not promise a backup-deletion deadline until all backup copies and provider retention are understood.
7. Confirm the provider agreements applicable to the actual accounts, including netcup's processing agreement and the UK transfer safeguards and any required transfer assessments. Database hosting in Ireland alone does not establish all provider processing locations.
8. Confirm a practicable return/deletion completion deadline and implement the manual process. Suggested target for Jack to consider: fulfil return requests and delete live copies within 30 days after the request window ends, or earlier following an agreed deletion instruction. Jack has confirmed the 30-day request window, not this completion deadline. Account closure, subscription cancellation, and retention of legally required billing records are distinct.

Existing Northern Ireland jurisdiction, liability-cap wording and reasonable advance notice for price changes have been retained. Jack has not yet separately confirmed changes to those provisions.

## References checked

- [Sole-trader setup and registration](https://www.gov.uk/become-sole-trader)
- [Business website disclosures](https://www.nibusinessinfo.co.uk/content/business-websites-legal-requirements)
- [ICO processor-contract requirements](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/what-needs-to-be-included-in-the-contract/)
- [Supabase backup availability and retention](https://supabase.com/docs/guides/platform/backups)
- [Supabase regions](https://supabase.com/docs/guides/platform/regions)
- [Supabase DPA](https://supabase.com/legal/customer-resources/data-processing-addendum)
- [Resend DPA](https://resend.com/legal/dpa)
- [netcup server locations](https://www.netcup.com/en/about-netcup/server-locations)
- [Coolify self-hosted and Cloud responsibilities](https://coolify.io/docs/choose-your-path)
- [coolLabs privacy policy](https://coollabs.io/privacy-policy)
- [coolLabs terms and provider identity](https://coollabs.io/terms-of-service)
