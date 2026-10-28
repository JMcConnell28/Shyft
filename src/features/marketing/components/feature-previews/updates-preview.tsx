import { useState } from "react"
import { BellRingIcon, CheckIcon } from "lucide-react"

import { previewUpdates } from "../../data/preview-updates"
import { PreviewFrame, PreviewStatus } from "./preview-frame"

export function UpdatesPreview() {
  const [selectedId, setSelectedId] = useState<string>(previewUpdates[0].id)
  const [readIds, setReadIds] = useState<ReadonlyArray<string>>([])
  const selected =
    previewUpdates.find((item) => item.id === selectedId) ?? previewUpdates[0]
  const isRead = readIds.includes(selected.id)
  return (
    <PreviewFrame title="Staff updates" icon={BellRingIcon}>
      <div className="feature-preview-heading">
        <div>
          <p className="feature-preview-overline">
            One place to stay in the loop
          </p>
          <h2>For your team</h2>
        </div>
        <PreviewStatus>
          {previewUpdates.length - readIds.length} unread
        </PreviewStatus>
      </div>
      <div className="feature-preview-updates-grid">
        <nav
          className="feature-preview-updates-list"
          aria-label="Example staff updates"
        >
          {previewUpdates.map((update) => (
            <button
              type="button"
              key={update.id}
              aria-pressed={selectedId === update.id}
              onClick={() => setSelectedId(update.id)}
            >
              <span className="feature-preview-overline">
                {update.category}
                {readIds.includes(update.id) && (
                  <CheckIcon size={12} aria-label="Read" />
                )}
              </span>
              <strong>{update.title}</strong>
              <small>{update.time}</small>
            </button>
          ))}
        </nav>
        <article className="feature-preview-update-detail" aria-live="polite">
          <span className="feature-preview-overline">{selected.category}</span>
          <h3>{selected.title}</h3>
          <p className="feature-preview-update-author">
            {selected.author} · {selected.time}
          </p>
          <p>{selected.body}</p>
          <p className="feature-preview-update-note">{selected.note}</p>
          <button
            type="button"
            className="preview-button preview-button-secondary"
            disabled={isRead}
            onClick={() =>
              setReadIds((current) =>
                current.includes(selected.id)
                  ? current
                  : [...current, selected.id]
              )
            }
          >
            <CheckIcon size={14} aria-hidden="true" />
            {isRead ? "Marked as read" : "Mark as read"}
          </button>
        </article>
      </div>
    </PreviewFrame>
  )
}
