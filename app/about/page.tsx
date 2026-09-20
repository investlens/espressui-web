import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  Gamepad2,
  Sparkles,
  Waves,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="inner-page">
      <section className="page-hero">
        <div className="container narrow">
          <span className="section-kicker">WELCOME TO COFFEYVILLE</span>

          <h1>
            More than a meme.
            <br />
            <span>We&apos;re brewing something.</span>
          </h1>

          <p>
            EspresSUI brings coffee culture, memes, games and the Sui
            community together — with one simple goal: build something
            people actually want to come back to.
          </p>

          <div className="hero-actions">
            <Link className="button primary-button" href="/brew-battle">
              Play Brew Battle
              <ArrowRight size={17} />
            </Link>

            <Link className="button secondary-button" href="/roadmap">
              View Roadmap
            </Link>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">THE STORY</span>
            <h2>A cup. A pair of shades. A bigger idea.</h2>
            <p>
              EspresSUI started as a simple community meme built around
              coffee and Sui. But Coffeyville was never meant to stop at
              the meme.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <Coffee size={28} />
              <span className="section-kicker">01 / CULTURE</span>
              <h3>Coffee with character.</h3>
              <p>
                A recognizable mascot, coffee-fuelled memes and a community
                identity built to feel unmistakably EspresSUI.
              </p>
            </article>

            <article className="feature-card">
              <Gamepad2 size={28} />
              <span className="section-kicker">02 / PLAY</span>
              <h3>Turn holders into players.</h3>
              <p>
                Brew Battle is our first playable experiment. Brew Arena
                takes the next step with skill-based competition,
                leaderboards and wallet-connected experiences.
              </p>
            </article>

            <article className="feature-card">
              <Waves size={28} />
              <span className="section-kicker">03 / SUI</span>
              <h3>Built around Sui.</h3>
              <p>
                We&apos;re building toward experiences where a Sui wallet
                becomes your identity across Coffeyville — simple,
                transparent and made for participation.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="battle-section">
        <div className="container">
          <div className="battle-panel">
            <div>
              <span className="section-kicker">WHAT WE&apos;RE BUILDING</span>

              <h2>
                From meme.
                <br />
                To game.
                <br />
                To Coffeyville.
              </h2>

              <p>
                The plan is not to bolt random utility onto a token.
                We&apos;re building the experience first — then giving
                $ESPRESSUI a meaningful place inside it.
              </p>

              <p>
                Brew Arena is the next major step: fast skill challenges,
                hourly competition, wallet-connected leaderboards and
                expanding community experiences.
              </p>
            </div>

            <div className="battle-points">
              <div>
                <strong>01</strong>
                <span>Build</span>
                <small>Ship real experiences.</small>
              </div>

              <div>
                <strong>02</strong>
                <span>Play</span>
                <small>Give the community something to master.</small>
              </div>

              <div>
                <strong>03</strong>
                <span>Compete</span>
                <small>Turn Coffeyville into an arena.</small>
              </div>

              <div>
                <strong>04</strong>
                <span>Expand</span>
                <small>Grow the EspresSUI universe carefully.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">OUR APPROACH</span>
            <h2>Build first. Talk second.</h2>
            <p>
              No giant promises and no pretend milestones. We release,
              test, listen to the community and improve what works.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <Sparkles size={28} />
              <span className="section-kicker">BUILD IN PUBLIC</span>
              <h3>Let people see the machine turn on.</h3>
              <p>
                New pages, game experiments and features are released as
                they become ready — so the community can follow the build,
                not just the announcements.
              </p>
            </article>

            <article className="feature-card">
              <Coffee size={28} />
              <span className="section-kicker">KEEP IT FUN</span>
              <h3>Crypto doesn&apos;t have to feel corporate.</h3>
              <p>
                Coffeyville should be somewhere people enjoy visiting,
                playing and sharing — even before they care about anything
                else.
              </p>
            </article>

            <article className="feature-card">
              <Waves size={28} />
              <span className="section-kicker">KEEP BREWING</span>
              <h3>One release at a time.</h3>
              <p>
                We&apos;re early. That gives us room to experiment, improve
                and build EspresSUI together with the people actually using
                it.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container narrow">
          <span className="section-kicker">THE MACHINE IS ON</span>

          <h2>Good Coffee. Greater Things.</h2>

          <p>
            Coffeyville is just getting started.
            <br />
            Brew. Build. Play. Repeat.
          </p>

          <div className="hero-actions">
            <Link className="button primary-button" href="/brew-battle">
              Enter Brew Battle
              <ArrowRight size={17} />
            </Link>

            <Link className="button secondary-button" href="/roadmap">
              See What&apos;s Brewing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
