import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CORE_BASE_PRICE_GBP,
  EXTRA_EMPLOYEE_PRICE_GBP,
  INCLUDED_CORE_EMPLOYEES,
  TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP,
  formatGbp,
} from "../utils/pricing"

const questions = [
  {
    question: "How are employees counted?",
    answer:
      "We count distinct employees used in a billing period through published rotas or timesheet activity. Unused staff do not count. Core employee usage is counted across your whole organisation.",
  },
  {
    question: "What if I only have one small venue?",
    answer: `Your first ${INCLUDED_CORE_EMPLOYEES} used employees are included in the ${formatGbp(CORE_BASE_PRICE_GBP)} monthly Core plan. After that, each additional used employee is ${formatGbp(EXTRA_EMPLOYEE_PRICE_GBP)} per month, excluding VAT.`,
  },
  {
    question: "Do I pay extra for more locations?",
    answer:
      "No. Unlimited locations and zones are included. Your Core plan scales with used employees across your organisation, rather than charging a separate subscription per location.",
  },
  {
    question: "How does Time & Attendance pricing work?",
    answer: `Enable clocking for the locations that need it. The first ${INCLUDED_CORE_EMPLOYEES} used staff at each enabled location are included, then each extra clocking employee costs ${formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)} per month. One NFC stand is included per enabled location.`,
  },
  {
    question: "Can I try it before committing?",
    answer:
      "Yes. Start with a 14-day free trial, with no credit card required. You can explore RocketRota with your team and cancel anytime.",
  },
] as const

export function PricingFaq() {
  return (
    <section
      className="pricing-faq preview-container"
      aria-labelledby="pricing-faq-title"
    >
      <div>
        <p className="marketing-eyebrow">Good to know</p>
        <h2 id="pricing-faq-title">
          A little more
          <br /> <em>clarity.</em>
        </h2>
        <p>Simple answers to the questions that come before your first rota.</p>
      </div>
      <Accordion className="pricing-faq-list">
        {questions.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
