"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Coffee,
  Copy,
  ExternalLink,
  Flame,
  Gamepad2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const CONTRACT =
  "0x7e09f912a7ca3759d2cdb5613583329208805b4781c3c28e26797db230a84fb9::suipump::SUIPUMP";

const BUY_URL =
  "https://suipump.org/token/0xe30b17d34aba058626b56fa94373d18305567275808760708d48b0a1dd045d6a";

export default function TokenPage() {
  const [copied, setCopied] = useState(false);

  async function copyContract() {
    await navigator.clipboard.writeText(CONTRACT);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <main className="inner-page token-page">
      <section className="page-hero">
        <div className="container narrow">
          <span className="section-kicker">$ESPRESSUI · LIVE ON SUI</span>

          <h1>
            The fuel of
            <br />
            <span>Coffeyville.</span>
          </h1>

          <p>
            EspresSUI started with coffee, memes and Sui. Now we&apos;re
            building experiences around the community — with $ESPRESSUI at
            the center of Coffeyville.
          </p>

          <div className="hero-actions">
            <a
              className="button primary-button"
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy $ESPRESSUI
              <ExternalLink size={17} />
            </a>

            <Link className="button secondary-button" href="/brew-battle">
              Enter Brew Battle
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">THE TOKEN</span>

            <h2>More than a ticker.</h2>

            <p>
              $ESPRESSUI is the token of the EspresSUI community. The goal
              isn&apos;t to bolt utility onto a meme — it&apos;s to build
              Coffeyville first and give the token meaningful places inside
              the experience as it grows.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <Coffee size={28} />

              <span className="section-kicker">IDENTITY</span>

              <h3>Welcome to Coffeyville.</h3>

              <p>
                $ESPRESSUI connects the token, mascot, community and future
                Coffeyville experiences under one identity.
              </p>
            </article>

            <article className="feature-card">
              <Gamepad2 size={28} />

              <span className="section-kicker">UTILITY BREWING</span>

              <h3>Built around participation.</h3>

              <p>
                We&apos;re exploring token-linked Arena access, community
                experiences, cosmetics and special competitions without
                making gameplay pay-to-win.
              </p>
            </article>

            <article className="feature-card">
              <Sparkles size={28} />

              <span className="section-kicker">ECOSYSTEM</span>

              <h3>Games. Culture. Community.</h3>

              <p>
                Brew Arena is the first major interactive direction, with
                more Coffeyville experiences planned as the project grows.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="token-contract-section">
        <div className="container">
          <div className="token-contract-panel">
            <div className="token-contract-copy">
              <span className="section-kicker">OFFICIAL CONTRACT</span>

              <h2>Verify before you brew.</h2>

              <p>
                Always confirm the full Sui coin type before interacting with
                a token.
              </p>

              <div className="contract-box">
                <code>{CONTRACT}</code>

                <button
                  className="contract-copy-button"
                  type="button"
                  onClick={copyContract}
                  aria-label="Copy EspresSUI contract"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="token-buy-card">
              <span className="token-live-badge">
                <span />
                LIVE
              </span>

              <h3>$ESPRESSUI</h3>

              <p>
                EspresSUI is live on Sui. Use the official link below to
                open its SUIPUMP token page.
              </p>

              <a
                className="button primary-button"
                href={BUY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy on SUIPUMP
                <ExternalLink size={17} />
              </a>

              <small>Always verify the contract before interacting.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="battle-section">
        <div className="container">
          <div className="battle-panel">
            <div>
              <span className="section-kicker">THE NEXT BREW</span>

              <h2>
                Utility should come
                <br />
                from something real.
              </h2>

              <p>
                We&apos;re building Brew Arena as a competitive layer for
                Coffeyville. The aim is to connect $ESPRESSUI to experiences
                people actually want to return to.
              </p>

              <Link className="button secondary-button" href="/roadmap">
                View the Roadmap
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="battle-points">
              <div>
                <strong>01</strong>
                <span>Play</span>
                <small>Short skill-based brewing challenges.</small>
              </div>

              <div>
                <strong>02</strong>
                <span>Compete</span>
                <small>Wallet-connected community leaderboards.</small>
              </div>

              <div>
                <strong>03</strong>
                <span>Utility</span>
                <small>Token-linked experiences without score boosts.</small>
              </div>

              <div>
                <strong>04</strong>
                <span>Expand</span>
                <small>More ways to use $ESPRESSUI across Coffeyville.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">BREWING NEXT</span>

            <h2>An economy around activity.</h2>

            <p>
              These mechanics are part of the product direction and are not
              live yet. We&apos;ll introduce them only as the Arena
              infrastructure is built and tested.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <Flame size={28} />

              <span className="section-kicker">PLANNED</span>

              <h3>Buy &amp; burn loop.</h3>

              <p>
                A future Arena model can route a defined share of activity
                toward buying $ESPRESSUI and removing those tokens from
                circulation, with transactions visible publicly.
              </p>
            </article>

            <article className="feature-card">
              <ShieldCheck size={28} />

              <span className="section-kicker">FAIR PLAY</span>

              <h3>Skill stays skill.</h3>

              <p>
                Holding more $ESPRESSUI will not increase a player&apos;s
                Brew Arena score. Competition should be decided by the game,
                not wallet size.
              </p>
            </article>

            <article className="feature-card">
              <Coffee size={28} />

              <span className="section-kicker">BUILD IN PUBLIC</span>

              <h3>No imaginary utility.</h3>

              <p>
                Live features will be labelled live. Features still being
                developed will stay clearly marked as brewing or planned.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container narrow">
          <span className="section-kicker">$ESPRESSUI</span>

          <h2>Good Coffee. Greater Things.</h2>

          <p>
            The token is live.
            <br />
            Coffeyville is still brewing.
          </p>

          <div className="hero-actions">
            <a
              className="button primary-button"
              href={BUY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy $ESPRESSUI
              <ExternalLink size={17} />
            </a>

            <Link className="button secondary-button" href="/community">
              Enter Coffeyville
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
