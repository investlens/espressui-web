import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  Gamepad2,
  Trophy,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              BREWING ON SUI
            </div>

            <h1>
              Good Coffee.
              <br />
              <span>Greater Things.</span>
            </h1>

            <p className="hero-description">
              EspresSUI is where coffee culture meets the SUI ecosystem —
              bringing community, competition, memes and utility together
              inside one very caffeinated universe.
            </p>

            <div className="hero-actions">
              <Link href="/brew-battle" className="button primary-button">
                Explore Brew Battle
                <ArrowRight size={18} />
              </Link>

              <Link href="/about" className="button secondary-button">
                Discover EspresSUI
              </Link>
            </div>

            <div className="hero-note">
              <span>☕ Brew.</span>
              <span>💧 Build.</span>
              <span>🎮 Play.</span>
              <span>🔁 Repeat.</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mascot-frame">
              <Image
                src="/images/espressui-mascot.png"
                alt="EspresSUI mascot"
                width={760}
                height={760}
                priority
                className="mascot-image"
              />

              <div className="floating-card float-one">
                <Coffee size={18} />
                <div>
                  <small>STATUS</small>
                  <strong>Machine ON</strong>
                </div>
              </div>

              <div className="floating-card float-two">
                <span>💧</span>
                <div>
                  <small>NETWORK</small>
                  <strong>SUI</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">WELCOME TO COFFEYVILLE</span>
            <h2>More than another cup of meme.</h2>
            <p>
              EspresSUI is being built as a community-first world around
              $ESPRESSUI — with culture at the front and useful experiences
              brewing behind it.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="icon-box">
                <Users />
              </div>
              <h3>Community</h3>
              <p>
                Coffeyville is the heart of EspresSUI — built around the
                people who show up, create, laugh and brew together.
              </p>
            </article>

            <article className="feature-card featured">
              <div className="icon-box">
                <Gamepad2 />
              </div>
              <h3>Brew Battle</h3>
              <p>
                A fast competitive mini-game where skill matters. Play,
                climb the leaderboard and prove who can brew.
              </p>

              <Link href="/brew-battle">
                See what&apos;s brewing <ArrowRight size={16} />
              </Link>
            </article>

            <article className="feature-card">
              <div className="icon-box">
                <Trophy />
              </div>
              <h3>Utility</h3>
              <p>
                $ESPRESSUI is planned to become part of competitions,
                community experiences and the growing Coffeyville universe.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="battle-preview">
        <div className="container">
          <div className="battle-panel">
            <div>
              <span className="section-kicker">COMING TO COFFEYVILLE</span>

              <h2>Can you brew?</h2>

              <p>
                Twenty seconds. One perfect zone. A leaderboard full of
                caffeinated competition.
              </p>

              <Link href="/brew-battle" className="text-link">
                Discover Brew Battle <ArrowRight size={17} />
              </Link>
            </div>

            <div className="battle-meter">
              <div className="meter-label">
                <span>BREW PRESSURE</span>
                <strong>PERFECT ZONE</strong>
              </div>

              <div className="meter-track">
                <div className="perfect-zone" />
                <div className="meter-marker" />
              </div>

              <div className="meter-scale">
                <span>Weak</span>
                <span>Perfect</span>
                <span>Burnt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <span className="section-kicker">THE MACHINE IS WARMING UP</span>
          <h2>The next brew starts here.</h2>

          <p>
            Follow the build, join Coffeyville and watch EspresSUI evolve.
          </p>

          <div className="hero-actions centered">
            <Link href="/roadmap" className="button primary-button">
              View Roadmap <ArrowRight size={18} />
            </Link>

            <Link href="/community" className="button secondary-button">
              Join Community
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}