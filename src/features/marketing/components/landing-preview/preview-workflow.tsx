import { ArrowUpRightIcon } from "lucide-react"

import { landingPreviewWorkflow } from "@/features/marketing/constants/landing-preview-workflow"

export function PreviewWorkflow() {
  return (
    <section
      id="features"
      className="preview-workflow preview-container"
      aria-labelledby="preview-workflow-title"
    >
      <div className="preview-workflow-intro">
        <h2 id="preview-workflow-title">
          Your week,
          <br />
          <em>connected.</em>
        </h2>
        <p>
          From planning to clocking in, RocketRota brings your team, time and
          rotas together in one simple system.
        </p>
      </div>
      <ol className="preview-workflow-list">
        {landingPreviewWorkflow.map((step, index) => (
          <li key={step.title}>
            <a href={step.href} className="preview-workflow-step">
              <span className="preview-step-number" aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3>
                  {step.title}
                  <ArrowUpRightIcon size={18} aria-hidden="true" />
                </h3>
                <p>{step.description}</p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
