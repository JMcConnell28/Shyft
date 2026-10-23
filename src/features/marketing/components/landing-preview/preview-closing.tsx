import { PreviewTrialLink } from "./preview-trial-link"

export function PreviewClosing() {
  return (
    <section
      className="preview-closing"
      aria-labelledby="preview-closing-title"
    >
      <div>
        <h2 id="preview-closing-title">
          Ready for a calmer
          <br />
          working week?
        </h2>
        <p>Make scheduling simpler with RocketRota.</p>
      </div>
      <div className="preview-closing-action">
        <PreviewTrialLink />
        <p>14-day free trial. No credit card required.</p>
      </div>
    </section>
  )
}
