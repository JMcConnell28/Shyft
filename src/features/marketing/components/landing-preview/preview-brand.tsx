import { Link } from "@tanstack/react-router"

export function PreviewBrand() {
  return (
    <Link to="/" className="preview-brand" aria-label="RocketRota home">
      <img src="/brand/rocketrota-logo.png" alt="" width="48" height="34" />
      <span>RocketRota</span>
    </Link>
  )
}
