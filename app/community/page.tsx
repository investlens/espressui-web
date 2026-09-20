import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  Gamepad2,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export default function CommunityPage() {
  return (
    <main className="inner-page community-page">
      <section className="page-hero">
        <div className="container narrow">
          <span className="section-kicker">WELCOME TO COFFEYVILLE</span>

          <h1>
            Coffeyville is open.
            <br />
            <span>Pull up a cup.</span>
          </h1>

          <p>
            EspresSUI isn&apos;t built for spectators. Coffeyville is where
            the community meets, creates, plays and helps shape what we
            brew next.
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

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">THE COMMUNITY</span>

            <h2>More than holders.</h2>

            <p>
              The best communities give people something to do together.
              That&apos;s the direction for EspresSUI — less watching from
              the sidelines, more creating, playing and competing.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <MessageCircle size={28} />

              <span className="section-kicker">CONNECT</span>

              <h3>Join the conversation.</h3>

              <p>
                Follow the build, share ideas, react to new releases and
                meet the people brewing alongside us in Coffeyville.
              </p>
            </article>

            <article className="feature-card">
              <Sparkles size={28} />

              <span className="section-kicker">CREATE</span>

              <h3>Memes are part of the culture.</h3>

              <p>
                Make something funny. Remix the mascot. Start a Coffeyville
                joke. Community creativity is part of what gives EspresSUI
                its personality.
              </p>
            </article>

            <article className="feature-card">
              <Gamepad2 size={28} />

              <span className="section-kicker">PLAY</span>

              <h3>Don&apos;t just watch. Play.</h3>

              <p>
                Brew Battle is the beginning. We&apos;re building toward
                faster challenges, competitive leaderboards and more ways
                for the community to participate.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="battle-section">
        <div className="container">
          <div className="battle-panel">
            <div>
              <span className="section-kicker">BREW ARENA</span>

              <h2>
                Coffeyville is
                <br />
                getting competitive.
              </h2>

              <p>
                Brew Battle started as a simple playable experiment. The
                next evolution is Brew Arena — designed around short,
                repeatable skill challenges and community competition.
              </p>

              <p>
                One wallet. One leaderboard position. Your best performance
                matters.
              </p>

              <Link
                className="button primary-button"
                href="/brew-battle"
              >
                Practice Your Brew
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="battle-points">
              <div>
                <strong>01</strong>
                <span>Practice</span>
                <small>Learn the mechanics.</small>
              </div>

              <div>
                <strong>02</strong>
                <span>Master</span>
                <small>Improve your best score.</small>
              </div>

              <div>
                <strong>03</strong>
                <span>Compete</span>
                <small>Climb wallet-connected leaderboards.</small>
              </div>

              <div>
                <strong>04</strong>
                <span>Return</span>
                <small>New battles keep Coffeyville moving.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">HOW TO JOIN IN</span>

            <h2>There&apos;s always another brew.</h2>

            <p>
              You don&apos;t need a title to contribute. Participate in the
              way that fits you.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <Users size={28} />

              <span className="section-kicker">SHOW UP</span>

              <h3>Be part of Coffeyville.</h3>

              <p>
                Join conversations, welcome new people and help build a
                community worth coming back to.
              </p>
            </article>

            <article className="feature-card">
              <Trophy size={28} />

              <span className="section-kicker">COMPETE</span>

              <h3>Chase the perfect brew.</h3>

              <p>
                As Brew Arena evolves, competition becomes a bigger part of
                the EspresSUI experience.
              </p>
            </article>

            <article className="feature-card">
              <Coffee size={28} />

              <span className="section-kicker">CONTRIBUTE</span>

              <h3>Help shape what comes next.</h3>

              <p>
                Feedback from real players and community members helps us
                decide what deserves another cup — and what needs a better
                recipe.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container narrow">
          <span className="section-kicker">COFFEYVILLE</span>

          <h2>The next round is brewing.</h2>

          <p>
            Come for the coffee. Stay for the culture.
            <br />
            Play for the perfect brew.
          </p>

          <div className="hero-actions">
            <Link className="button primary-button" href="/brew-battle">
              Play Brew Battle
              <ArrowRight size={17} />
            </Link>

            <Link className="button secondary-button" href="/about">
              Discover EspresSUI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
