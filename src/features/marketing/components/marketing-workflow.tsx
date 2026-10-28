import type { MarketingWorkflowItem } from "../types"

type MarketingWorkflowProps = {
  title: string
  description: string
  items: ReadonlyArray<MarketingWorkflowItem>
}

export function MarketingWorkflow({
  title,
  description,
  items,
}: MarketingWorkflowProps) {
  return (
    <section
      className="preview-workflow preview-container marketing-workflow"
      aria-labelledby="feature-workflow-title"
    >
      <div className="preview-workflow-intro">
        <p className="marketing-eyebrow">How it works</p>
        <h2 id="feature-workflow-title">{title}</h2>
        <p>{description}</p>
      </div>
      <ol className="preview-workflow-list">
        {items.map((item, index) => (
          <li key={item.title} className="preview-workflow-step">
            <span className="preview-step-number" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
