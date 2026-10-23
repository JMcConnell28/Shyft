import { Link } from "@tanstack/react-router"

import { PreviewBrand } from "./preview-brand"

export function PreviewFooter() {
  return (
    <footer className="preview-footer preview-container">
      <PreviewBrand />
      <nav aria-label="Footer navigation">
        <a href="#features">Features</a>
        <Link to="/pricing">Pricing</Link>
        <Link to="/help">Help Centre</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </nav>
    </footer>
  )
}
