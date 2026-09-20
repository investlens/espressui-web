import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div>
          <Link href="/" className="brand">
            ☕ <span>Espres<span>SUI</span></span>
          </Link>

          <p>
            Coffee. Community. Competition.
            <br />
            Built for the SUI ecosystem.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/about">About</Link>
          <Link href="/brew-battle">Brew Battle</Link>
          <Link href="/token">Token</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/community">Community</Link>
        </div>

        <div className="footer-bottom">
          <span>Good Coffee. Greater Things. ☕💧</span>
          <span>© 2026 EspresSUI</span>
        </div>
      </div>
    </footer>
  );
}