"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import SuiWallet from "./sui-wallet";

const navigation = [
  { name: "About", href: "/about" },
  { name: "Brew Battle", href: "/brew-battle" },
  { name: "Token", href: "/token" },
  { name: "Roadmap", href: "/roadmap" },
  { name: "Community", href: "/community" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand">
          <span className="brand-cup">☕</span>
          <span>Espres<span>SUI</span></span>
        </Link>

        <nav className="desktop-nav">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="desktop-wallet">
          <SuiWallet />
        </div>

        <Link
          className="nav-cta desktop-cta"
          href="/brew-battle"
        >
          Enter Coffeyville
        </Link>

        <button
          className="mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="mobile-nav">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="mobile-wallet">
            <SuiWallet />
          </div>

          <Link
            href="/brew-battle"
            className="nav-cta"
            onClick={() => setOpen(false)}
          >
            Enter Coffeyville
          </Link>
        </nav>
      )}
    </header>
  );
}