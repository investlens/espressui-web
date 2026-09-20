import {
  Gamepad2,
  ShieldCheck,
  Trophy,
  Wallet,
} from "lucide-react";

import BrewBattleGame from "../../components/game/brew-battle-game";

export default function BrewBattlePage() {
  return (
    <div className="inner-page">
      <section className="page-hero battle-page-hero">
        <div className="container narrow">
          <span className="section-kicker">
            ESPRESSUI PRESENTS
          </span>

          <h1>
            Brew Battle.
            <br />
            <span>Can you brew?</span>
          </h1>

          <p>
            The Brew Battle demo is now live. Practice your timing,
            master the perfect brew and chase your highest score.
            Competitive wallet battles, leaderboards and rewards are
            brewing next.
          </p>

          <div className="coming-pill">
          <span className="live-dot" />
          DEMO LIVE · BATTLE MODE BREWING
        </div>
        </div>
      </section>

      <section className="page-section brew-game-section">
        <div className="container">
          <BrewBattleGame />

          <div className="content-grid battle-info-grid">
            <article className="content-card">
              <Gamepad2 />
              <h3>Skill Based</h3>
              <p>
                Your timing creates your score. Token
                holdings will never make the marker easier.
              </p>
            </article>

            <article className="content-card">
              <Wallet />
              <h3>Wallet Competition</h3>
              <p>
                SUI wallet authentication and $ESPRESSUI
                eligibility are coming to competitive mode.
              </p>
            </article>

            <article className="content-card">
              <Trophy />
              <h3>Leaderboard</h3>
              <p>
                Verified competitive scores will populate
                Coffeyville&apos;s leaderboard.
              </p>
            </article>
          </div>

          <div className="security-panel">
            <ShieldCheck size={24} />

            <div>
              <strong>Built for fair competition.</strong>
              <p>
                Practice scores run in your browser.
                Competitive scoring will use authenticated
                game sessions and server-side validation
                before rewards are enabled.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}