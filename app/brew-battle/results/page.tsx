import BrewResults from "../../../components/game/brew-results";

export default function BrewBattleResultsPage() {
  return (
    <div className="inner-page">
      <section className="page-hero battle-page-hero">
        <div className="container narrow">
          <span className="section-kicker">BREW BATTLE TRANSPARENCY</span>
          <h1>
            Winners &amp;
            <br />
            <span>On-chain Proof.</span>
          </h1>
          <p>
            Completed Brew Battle rounds, final prize pools, winners and payout
            transaction hashes. Anyone can independently verify paid rewards on Sui.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <BrewResults />
        </div>
      </section>
    </div>
  );
}
