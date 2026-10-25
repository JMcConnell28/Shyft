import { Link } from "@tanstack/react-router"

import "../styles/marketing-footer.css"

function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <Link
        to="/"
        className="marketing-footer-brand"
        aria-label="RocketRota home"
      >
        <img src="/brand/rocketrota-logo-small.webp" alt="" width="35" height="25" />
        <span>RocketRota</span>
      </Link>
      <nav aria-label="Footer navigation">
        <Link to="/" hash="features">
          Features
        </Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/help">Help Centre</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </nav>
    </footer>
  )
}

export { MarketingFooter }
