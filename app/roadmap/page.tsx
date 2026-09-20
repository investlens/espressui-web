import {
  Check,
  Coffee,
  Gamepad2,
  Globe2,
  Sparkles,
  Trophy,
} from "lucide-react";

const roadmap = [
  {
    number: "01",
    status: "LIVE",
    title: "The First Brew",
    subtitle: "Launch & Coffeyville",
    description:
      "EspresSUI comes to life on SUI. Establish the mascot, launch $ESPRESSUI and begin growing Coffeyville around coffee, memes and community.",
    icon: Coffee,
    items: [
      "$ESPRESSUI launch",
      "EspresSUI identity & mascot",
      "Coffeyville community",
      "Community content & collaborations",
    ],
  },
  {
    number: "02",
    status: "NOW",
    title: "Coffeyville Opens",
    subtitle: "Website & Project Home",
    description:
      "Build a permanent home for EspresSUI where the community can discover the project, verify official information and follow what is brewing.",
    icon: Globe2,
    items: [
      "Official EspresSUI website",
      "Token information",
      "Project roadmap",
      "Community hub",
    ],
  },
  {
    number: "03",
    status: "BREWING",
    title: "Brew Battle",
    subtitle: "Play. Score. Compete.",
    description:
      "Launch EspresSUI's first skill-based mini-game. Players attempt the perfect brew, earn a Brew Score and compete for leaderboard positions.",
    icon: Gamepad2,
    items: [
      "Perfect Brew mini-game",
      "SUI wallet connection",
      "$ESPRESSUI eligibility",
      "Verified scoring",
      "Leaderboard",
    ],
  },
  {
    number: "04",
    status: "NEXT",
    title: "Coffeyville Competition",
    subtitle: "Community Events & Rewards",
    description:
      "Turn Brew Battle into a recurring community competition with transparent eligibility and sustainable reward pools.",
    icon: Trophy,
    items: [
      "Competitive Brew sessions",
      "Leaderboard seasons",
      "Community competitions",
      "Reward experiments",
    ],
  },
  {
    number: "05",
    status: "FUTURE",
    title: "Bigger Brews",
    subtitle: "Expand the EspresSUI Universe",
    description:
      "Let real community participation guide what comes next — new games, collaborations and experiences built around EspresSUI.",
    icon: Sparkles,
    items: [
      "New game modes",
      "SUI ecosystem collaborations",
      "Community-led experiments",
      "More Coffeyville experiences",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="inner-page">
      <section className="page-hero">
        <div className="container narrow">
          <span className="section-kicker">THE ESPRESSUI ROADMAP</span>

          <h1>
            One cup at a time.
            <br />
            <span>Keep brewing.</span>
          </h1>

          <p>
            We would rather build than promise. This roadmap shows where
            EspresSUI is today, what is brewing now and where Coffeyville
            could go next.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container roadmap-list">
          {roadmap.map((phase) => {
            const Icon = phase.icon;

            return (
              <article className="roadmap-item" key={phase.number}>
                <div className="roadmap-number">{phase.number}</div>

                <div className="roadmap-content">
                  <div className="roadmap-status">
                    <Icon size={15} />
                    {phase.status}
                  </div>

                  <h2>{phase.title}</h2>
                  <h3>{phase.subtitle}</h3>

                  <p>{phase.description}</p>

                  <div className="roadmap-checks">
                    {phase.items.map((item) => (
                      <div key={item}>
                        <Check size={14} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <span className="section-kicker">CURRENT BREW</span>
          <h2>Brew Battle is next.</h2>

          <p>
            The website gives Coffeyville a home. Now we turn EspresSUI
            into something you can actually play.
          </p>
        </div>
      </section>
    </div>
  );
}