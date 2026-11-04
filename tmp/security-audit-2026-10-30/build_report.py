import json
from pathlib import Path
from datetime import datetime, timezone
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path('D:/Projects/Shyft')
WORK = ROOT / 'tmp/security-audit-2026-10-30'
OUT = ROOT / 'output/security-audit-2026-10-30'
OUT.mkdir(parents=True, exist_ok=True)
findings = json.loads((WORK / 'findings.json').read_text())
env = json.loads((WORK / 'environment-summary.json').read_text())
runtime = json.loads((WORK / 'runtime-summary.json').read_text())
audit = json.loads((WORK / 'npm-audit.json').read_text(encoding='utf-8-sig'))
doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Inches(8.27), Inches(11.69)
section.top_margin = section.bottom_margin = Inches(.72)
section.left_margin = section.right_margin = Inches(.78)
styles = doc.styles
for border in list(styles.element.iter(qn('w:pBdr'))):
    border.getparent().remove(border)
for name in ['Normal', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3']:
    styles[name].font.name = 'Calibri'
    styles[name].font.color.rgb = RGBColor(0, 0, 0)
styles['Normal'].font.size = Pt(10.5)
styles['Normal'].paragraph_format.space_after = Pt(6)
styles['Normal'].paragraph_format.line_spacing = 1.12
styles['Title'].font.size = Pt(27)
styles['Subtitle'].font.size = Pt(13)
styles['Heading 1'].font.size = Pt(16)
styles['Heading 1'].paragraph_format.space_before = Pt(16)
styles['Heading 2'].font.size = Pt(12.5)
styles['Heading 2'].paragraph_format.space_before = Pt(12)
for name in ['Heading 1', 'Heading 2', 'Heading 3']:
    styles[name].paragraph_format.keep_with_next = True
header = section.header.paragraphs[0]
header.text = 'RocketRota security audit'
header.style = 'Normal'
header.runs[0].font.size = Pt(8)
footer = section.footer.paragraphs[0]
footer.text = 'Internal report   |   30 October 2026   |   '
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)
for run in footer.runs:
    run.font.size = Pt(8)
md = []

def heading(text, level=1):
    doc.add_heading(text, level)
    md.append('#' * (level + 1) + ' ' + text + '\n')

def paragraph(text, label=None):
    p = doc.add_paragraph()
    if p._p.getprevious() is not None and p._p.getprevious().tag == qn('w:tbl'):
        p.paragraph_format.space_before = Pt(6)
    if label:
        p.add_run(label + ' ').bold = True
        if label == 'Assessment': p.paragraph_format.keep_with_next = True
    p.add_run(text)
    md.append(('**' + label + '** ' if label else '') + text + '\n')
    return p

def bullet(text):
    p = doc.add_paragraph(text, style='List Bullet')
    p.paragraph_format.space_after = Pt(4)
    md.append('- ' + text)

def table(headers, rows, widths):
    t = doc.add_table(rows=1, cols=len(headers))
    t.autofit = False
    tPr = t._tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for side in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        edge = OxmlElement('w:' + side)
        for key, value in [('val', 'single'), ('sz', '4'), ('color', 'D9D9D9')]:
            edge.set(qn('w:' + key), value)
        borders.append(edge)
    tPr.append(borders)
    for i, title in enumerate(headers):
        t.rows[0].cells[i].text = title
    repeat = OxmlElement('w:tblHeader')
    t.rows[0]._tr.get_or_add_trPr().append(repeat)
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = str(value)
    for ri, row in enumerate(t.rows):
        no_split = OxmlElement('w:cantSplit')
        row._tr.get_or_add_trPr().append(no_split)
        for ci, cell in enumerate(row.cells):
            cell.width = Inches(widths[ci])
            cell.vertical_alignment = 1
            tcPr = cell._tc.get_or_add_tcPr()
            margins = OxmlElement('w:tcMar')
            for side in ['top', 'left', 'bottom', 'right']:
                edge = OxmlElement('w:' + side)
                edge.set(qn('w:w'), '85')
                edge.set(qn('w:type'), 'dxa')
                margins.append(edge)
            tcPr.append(margins)
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'), 'E7EDF3' if ri == 0 else ('F5F7F9' if ri % 2 == 0 else 'FFFFFF'))
            tcPr.append(shading)
            for p in cell.paragraphs:
                if widths[ci] < .8: p.alignment = 1
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.05
                for run in p.runs:
                    run.font.size = Pt(9)
                    run.bold = ri == 0
    md.append('| ' + ' | '.join(headers) + ' |\n| ' + ' | '.join(['---'] * len(headers)) + ' |')
    md.extend('| ' + ' | '.join(map(str, row)) + ' |' for row in rows)
    md.append('')

def source_locations(finding):
    refs = []
    for file, needle in finding['sources']:
        lines = (ROOT / file).read_text(encoding='utf-8-sig').splitlines()
        line = next((i + 1 for i, value in enumerate(lines) if needle in value), None)
        if line is None:
            raise ValueError(f'Missing source {file}: {needle}')
        refs.append((file, line))
    p = doc.add_paragraph('Evidence locations   ')
    for i, (file, line) in enumerate(refs):
        p.add_run(('  |  ' if i else '') + f'{file}:{line}').font.size = Pt(8)
    p.paragraph_format.line_spacing = 1
    md.append('Evidence locations: ' + '; '.join(f'[{file}:{line}]({(ROOT / file).as_posix()}:{line})' for file, line in refs) + '.\n')

doc.add_paragraph('RocketRota security audit', 'Title')
doc.add_paragraph('Code hosted Supabase authentication and payments', 'Subtitle')
md.extend(['# RocketRota security audit\n', 'Code hosted Supabase authentication and payments\n'])
paragraph('Prepared for Jack McConnell by Codex. Review date 30 October 2026. Internal report containing security-sensitive architecture details, but no credential values or customer records.')
paragraph('Baseline: D:/Projects/Shyft at commit 9a44dda6c5136b492c742672a8a03df2141841a8, including the existing uncommitted working changes. The local checkout and deployed sites were assessed separately; the exact deployed source revision was not attested.')
paragraph('Official documentation was checked on 30 October 2026. Installed source and the lockfile are authoritative for the reviewed versions: TanStack Start 1.169.3, Better Auth 1.7.12, Stripe Node 20.4.1 and application Zod 4.6.7. Source evidence references resolve to the reviewed working tree; future edits can move their line numbers.')
heading('Executive assessment')
paragraph('Hold public launch until the high-priority findings are resolved or explicitly bounded and retested. Four high findings have concrete code or configuration evidence: an unencrypted local connection to hosted Supabase, overly broad access to NFC AES keys, password resets that retain sessions, and arbitrary push endpoints reaching the server request layer. A fifth high finding is conditional on an unclaimed admin bootstrap address remaining enabled in production.')
paragraph('The review records 16 findings: 5 high including the conditional bootstrap issue, 9 medium and 2 low. No critical compromise was demonstrated. This is a broad evidence-based audit, not a claim that authentication, payments or the complete system is fully secure.')
paragraph(f'There is meaningful protection already in place. All 55 hosted public application tables have RLS; private schemas deny browser access; signed payment webhooks and server-side billing ownership checks exist; live main and admin responses have CSP and private caching. Fresh main and admin builds passed. Scans of {env["bundleFiles"]} browser artifact files found no configured private environment values, and selected main plus admin tests passed 93 cases.')
heading('First actions')
for text in [
    'Restrict browser access to NFC key material and retest workplace manager and supervisor access.',
    'Require verified database TLS, separate development from production credentials, and confirm the deployed connection behavior.',
    'Revoke sessions on password reset and require authoritative checks for sensitive operations.',
    'Restrict push destinations, set outbound timeouts and quotas, and close admin bootstrap after provisioning.'
]: bullet(text)

doc.add_page_break()
heading('Findings register')
paragraph('Confirmed means the stated code or configuration behavior was observed; it does not mean every consequence was exploited. Conditional and unverified deployment items are explicitly labelled in each finding. High findings should be resolved before exposing real workforce data to a wider launch.')
table(['ID', 'Severity', 'Finding'], [[f['id'], f['severity'], f['title']] for f in findings], [.48, .66, 5.5])
heading('Scope and method')
paragraph('The audit combined repository-wide searches, targeted manual data-flow tracing, dependency advisories, fresh production builds, secret-value scanning, mocked security tests, read-only hosted database metadata and small unauthenticated HTTP rejection checks. It covered main and admin TanStack Start entry points, Better Auth, role and workplace checks, billing and station purchases, NFC, push delivery, privacy exports, payroll CSVs, service-worker caching and deployment configuration visible from this workspace.')
paragraph('Hosted project: Shyft, txcleqsbnblbkuihndyc, eu-west-1, PostgreSQL 17.6.1.084. The connected organization reports the Free plan. All 83 local migration versions match the 83 hosted versions. No storage buckets or Edge Functions were listed. Customer records, real NFC keys and real session tokens were not retrieved. No production schema, application data, deployment, payment or secret was changed.')

heading('Detailed findings')
for f in findings:
    heading(f['id'] + ' ' + f['title'], 2)
    paragraph(f['severity'] + ' severity. ' + f['status'] + '.', 'Assessment')
    for key, label in [('evidence', 'Evidence'), ('impact', 'Impact'), ('fix', 'Recommended action'), ('verify', 'Closure check')]:
        paragraph(f[key], label)
    source_locations(f)

doc.add_page_break()
heading('Environment and TanStack boundary assessment')
paragraph('Private environment values belong on the server. Public configuration does not. The checked VITE_SUPABASE_KEY and VITE_SUPABASE_PUBLISHABLE_KEY are modern publishable keys, not privileged Supabase keys. A VAPID public key is also deliberately public. Keeping these public values does not violate the server-only secret boundary.')
table(['Configuration', 'Observed boundary and result'], [
    ['Database and auth secrets', 'Server-only env and pool/auth modules. No matching private values found in tracked files or fresh browser artifacts. TLS and environment isolation remain S01 and S11.'],
    ['Supabase privileged keys', 'SUPABASE_SECRET_KEY is read by a server-only client. Browser Supabase configuration uses publishable keys. Dynamic NFC AES key disclosure is separately covered by S02.'],
    ['Stripe and mail credentials', 'Private keys are read in server modules. No broad Vite define replacement or private VITE-prefixed variable was found. Live key permissions and actual hosting secret storage were not inspected.'],
    ['Push configuration', 'VAPID_PRIVATE_KEY is read server-side. Public VAPID configuration is returned intentionally to a verified user. Destination validation remains S04.'],
    ['Development switches', 'Verification bypass code is guarded by development mode. The local public bypass flag is true but its server flag is false; neither proves the deployed setting. Keep production bypasses disabled.']
], [1.42, 5.22])
paragraph(f'The exact-value scan examined {env["trackedFiles"]} tracked paths and {env["bundleFiles"]} browser JS, CSS, HTML, JSON or map files; no configured private values matched, and no browser source maps were found. Relevant .env files are ignored and no commits were returned for the inspected credential-file paths. These checks do not prove the absence of unknown historical secrets, transformed values, runtime serialization leaks or values present only in Coolify.')
paragraph('A raw identifier search did find BETTER_AUTH_SECRET strings in bundled Better Auth environment helper code. These were property names and getters, not the secret values. They are not reported as a credential leak. Admin loadEnv with an empty prefix loads variables into server-side process.env; it does not by itself expose all variables to the browser.')
paragraph('TanStack guidance requires protection at the data/API boundary, not only beforeLoad route checks. The traced billing, company, manager-dashboard, timesheet, support and privacy entry points generally validate input and perform server-side session and permission checks. Both apps preserve the server-function CSRF middleware when defining a custom Start instance. The findings identify exceptions and alternate surfaces that UI guards do not close.')
paragraph('Continue using server-only import markers for env, database, auth and payment modules. Audit returned DTOs as well as imports: a server-only module can still intentionally or accidentally return sensitive data. Prefer minimal session DTOs over serializing the complete auth session, especially where the raw token can be reused by the database API.')

heading('Hosted database evidence')
table(['Control', 'Observed result'], [
    ['Public tables', '55 of 55 have RLS enabled. No disabled-RLS public table was found.'],
    ['Private schema access', 'anon and authenticated lack USAGE on account_private, admin_private, billing_private, privacy_private and push_private.'],
    ['Sensitive base tables', 'Unauthenticated zero-row REST requests for user and employees returned 401. No customer rows were requested.'],
    ['Other zero-row checks', 'account and clock_tags returned 200 for limit=0; time_entries returned 401. A 200 empty query proves endpoint reachability, not disclosure.'],
    ['Identity and clock RPCs', 'A nonexistent synthetic session token returned null. claim_clock_scan_session EXECUTE is denied to anon and authenticated.'],
    ['Advisor interpretation', '20 RLS-without-policy notices; 49 GraphQL object notices for each browser role; 9 public definer-helper notices for each role. See S02 and S15.'],
    ['Default privileges', 'New public tables, sequences and functions inherit broad browser-role grants for postgres and supabase_admin. Reduce future grants through tested migrations.'],
    ['Schema version and products', '83 migration versions match. No storage buckets or deployed Edge Functions were listed. This is not an organization-wide storage audit.']
], [1.5, 5.14])
paragraph('The public definer helpers inspected resolve session identity and roles rather than accepting arbitrary SQL or arbitrary user identity. Search paths are fixed, and anon lacks CREATE on public. Their callable status is an unnecessary API surface to review, not proof of anonymous privilege escalation. RLS without policies intentionally denies ordinary browser roles and should not be fixed by adding permissive policies.')

heading('Authentication and payment controls that passed review')
for text in [
    'Main and admin use separate auth models and secrets in the inspected local configuration. Admin role and disabledAt are not accepted as generic profile input, and dedicated admin requests recheck active membership and permissions.',
    'Main workspace operations derive the user from the server session and check current organization/location permissions in the traced paths. Billing initiation and portal access are restricted to the owner. Privacy requests bypass the cookie cache and require verified email.',
    'Better Auth supplies password hashing, secure-cookie behavior and origin protections. Current configuration does not disable CSRF protections. Runtime cookie attributes and authenticated cross-origin rejection still require an actual controlled login test.',
    'The custom Stripe webhook verifies the raw request signature. An unsigned live request returned 400. Local code records processed event IDs and implements subscription, invoice, failed-payment and recovery paths.',
    'Extra-station fulfillment checks immutable order identity, customer, exact price, quantity, currency, amount and a settled PaymentIntent. Refund/dispute holds exist for those one-off orders. Test and zero-value invoices do not release included hardware.',
    'The main and admin sites return per-request nonce CSP, DENY framing, nosniff, referrer policy and private no-store caching on sampled HTML/auth responses. The public .env probe returned 404. No production .env content was printed.',
    'Service-worker code uses the network for private document navigation and limits ordinary caching to assets. Privacy HTML export escapes record values and delivers attachments; preserve its stricter CSP as S16 describes.'
]: bullet(text)
paragraph('Payment configuration still needs account-level verification: live webhook event subscriptions, endpoint version and signing secret, restricted key permissions, recovery settings, risk alerts and tax registrations where applicable. Checkout enables automatic tax, but code alone cannot establish the account registration or correct tax treatment. No live charge or refund was created for this audit.')

heading('Verification record')
table(['Check', 'Result'], [
    ['Selected main security tests', '8 files and 44 tests passed. Auth, signup gate, station payments, station alerts, security headers and privacy server functions included.'],
    ['Admin test suite', '12 files and 49 tests passed using the bundle config loader and a single thread worker.'],
    ['Additional focused rerun', '6 main files and 34 tests passed; these overlap the earlier 44 and are not counted twice.'],
    ['Database integration tests', '2 files and 9 tests skipped because DATABASE_URL was not supplied to Vitest. No rollback fixtures were run against production.'],
    ['Main production build', 'Passed on retry outside the sandbox. The first attempt failed with a sandbox EPERM on the PDF worker realpath, not a demonstrated code compilation error.'],
    ['Admin production build', 'Passed. Both fresh public outputs were included in the private-value scan.'],
    ['Full npm audit', '34 affected package entries: 11 high, 19 moderate, 4 low, 0 critical. No dependencies were changed.'],
    ['Production npm audit', '6 affected package entries: 2 high and 4 low. Nested tooling reachability needs review; application Zod 4.6.7 is not the flagged copy.'],
    ['Local safe reproductions', 'Loopback push request preparation accepted; harmless CSV formula preserved. No internal request or real spreadsheet formula execution occurred.'],
    ['Live rejection checks', 'Both unauthenticated update-user probes returned 401; unsigned webhook 400; reconciliation without bearer token 500. The 401 results do not prove authenticated CSRF behavior.']
], [1.5, 5.14])
paragraph('Useful saved evidence is in tmp/security-audit-2026-10-30: environment-summary.json, runtime-summary.json, hosted-key-grants.json, database-functions.json, database-policies.json, hosted-migrations.json, npm-audit.json, npm-audit-production.json, reproductions.json, rejection-checks.json and build logs. All local private values remained in memory during scans and are omitted from these summaries. The report does not rely on the older audit claiming zero dependency advisories.')

heading('Operational checks not established by this audit')
paragraph('These are verification gaps, not confirmed absent controls. Close them with concrete evidence before launch; passing functional workbook scenarios alone does not establish each infrastructure control.')
for text in [
    'Backup and restore: document retention, access, off-site recovery and acceptable data loss, then restore into an isolated database. The hosted organization is currently Free; do not assume paid-plan accessible daily backups. Include any future object-storage files separately.',
    'Hosting and operator access: inspect Coolify/VPS secrets, database network restrictions, deployed TLS settings, proxy IP handling, operator MFA, patching, SSH access and account recovery. These control panels were not accessed.',
    'Jobs and alerts: verify clock processing, privacy purge/email and station recovery schedules survive restart; verify general billing reconciliation and actionable failure notifications. Source task declarations do not prove execution.',
    'Authorization testing: use two disposable workplaces and all roles to test direct requests, role changes, offboarding, stale sessions, exports and privileged tag tools. No authenticated cross-tenant penetration test or real user session manipulation was performed.',
    'Abuse and availability: establish proxy/request body limits, shared rate limits, timeouts and resource quotas. Test them in staging rather than load-testing the employee database or production email service.',
    'Release controls: verify the deployed revision, rerun clean builds and scans in CI, retain a known-good artifact and migration recovery plan, and verify full regression coverage. This audit did not run every application test or certify the live Stripe account.'
]: bullet(text)
paragraph('Additional hardening: restrict production trustedOrigins to intended HTTPS origins rather than keeping localhost entries; minimize auth-session DTOs; review password policy and breached-password screening; and define protected operational-log retention. These should be prioritized after the concrete high findings, without replacing the existing protections.')

heading('Remediation and retest order')
table(['Order', 'Work', 'Required closure evidence'], [
    ['1', 'S02 and S07 NFC permissions', 'Manager and supervisor direct key reads denied; dedicated operator setup works; disabling an operator closes every privileged path.'],
    ['2', 'S01 and S11 transport and secrets', 'Verified TLS from each client/app, independent environment credentials and tested least-privilege access.'],
    ['3', 'S03 S05 S06 S08 auth', 'Recovery revokes sessions; sensitive actions reject old sessions; bootstrap closed; shared abuse limits and strong admin authentication tested.'],
    ['4', 'S04 S09 S10 untrusted inputs', 'Push private destinations blocked, safe login destinations enforced, and safe spreadsheet export demonstrated.'],
    ['5', 'S12 S13 S14 release and billing', 'Risk/replay fixtures pass, dependency exceptions documented, authorized reconciliation and failure alerts verified.'],
    ['6', 'S15 S16 defense in depth', 'Least necessary API grants, tested defaults and private-schema protections, and final privacy-download CSP confirmed.']
], [.45, 1.85, 4.34])
paragraph('This engagement produced findings and evidence only. Fixes should be implemented as focused changes with regression tests and an isolated retest before production configuration or schema changes. Re-run this audit against the release candidate after remediation.')

heading('Primary references')
references = [
    ('TanStack Start environment variables', 'https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables'),
    ('TanStack Start import protection', 'https://tanstack.com/start/latest/docs/framework/react/guide/import-protection'),
    ('TanStack Start server functions', 'https://tanstack.com/start/latest/docs/framework/react/guide/server-functions'),
    ('TanStack Start authentication', 'https://tanstack.com/start/latest/docs/framework/react/guide/authentication'),
    ('Better Auth security', 'https://better-auth.com/docs/reference/security'),
    ('Better Auth session management', 'https://better-auth.com/docs/concepts/session-management'),
    ('Better Auth email and password', 'https://better-auth.com/docs/authentication/email-password'),
    ('Supabase securing the Data API', 'https://supabase.com/docs/guides/api/securing-your-api'),
    ('Supabase SSL enforcement', 'https://supabase.com/docs/guides/platform/ssl-enforcement'),
    ('Supabase database backups', 'https://supabase.com/docs/guides/platform/backups'),
    ('Stripe subscription webhooks and risk events', 'https://docs.stripe.com/billing/subscriptions/webhooks'),
    ('Zod constrained collections advisory', 'https://github.com/advisories/GHSA-mrhx-c7xc-m3w5'),
    ('deepmerge prototype poisoning advisory', 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4')
]
for title, url in references:
    p = doc.add_paragraph(title + '\n' + url)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1
    for run in p.runs: run.font.size = Pt(8.5)
    md.append(f'- [{title}]({url})')
doc.core_properties.title = 'RocketRota security audit'
doc.core_properties.subject = 'Code hosted Supabase authentication and payments'
doc.core_properties.author = 'Codex'
doc.core_properties.keywords = 'RocketRota security audit October 2026'
doc.save(OUT / 'RocketRota_Security_Audit_2026-10-30.docx')
report_md = ROOT / 'docs/security-audit-2026-10-30.md'
report_md.write_text('\n'.join(md), encoding='utf-8')
print(json.dumps({'docx': str(OUT / 'RocketRota_Security_Audit_2026-10-30.docx'), 'markdown': str(report_md), 'findings': len(findings), 'generatedAt': datetime.now(timezone.utc).isoformat()}))
