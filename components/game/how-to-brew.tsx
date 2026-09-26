"use client";

import { useState } from "react";
import {
  BookOpen,
  Coffee,
  Gauge,
  MousePointer2,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

export default function HowToBrew() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/[0.06] px-4 py-3 text-sm font-black text-sky-300 transition hover:bg-sky-400/[0.12]"
      >
        <BookOpen size={17} />
        HOW TO PLAY
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0b1016] p-5 shadow-2xl md:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close how to play"
              className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/[0.05] p-2 text-white/60 transition hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="pr-12">
              <div className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-sky-300">
                <Coffee size={17} />
                BREW ARENA GUIDE
              </div>

              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                Make the perfect brew.
              </h2>

              <p className="mt-3 max-w-2xl text-white/55">
                Three skill stages. One Brew Score. Master all three and climb
                Coffeyville&apos;s hourly leaderboard.
              </p>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <GuideCard
                number="01"
                icon={<Target size={23} />}
                title="LOCK THE GRIND"
                points="300 PTS"
              >
                Watch the moving grinder and hit <strong>LOCK</strong> when it
                reaches the blue sweet spot. The closer you land, the higher
                your score.
              </GuideCard>

              <GuideCard
                number="02"
                icon={<Gauge size={23} />}
                title="BUILD PRESSURE"
                points="350 PTS"
              >
                Press and hold to build pressure. <strong>Release</strong> in
                the target zone before the pressure goes too far.
              </GuideCard>

              <GuideCard
                number="03"
                icon={<MousePointer2 size={23} />}
                title="CONTROL THE POUR"
                points="350 PTS"
              >
                Move left and right to keep your stream aligned with the moving
                target. Better tracking means better accuracy.
              </GuideCard>
            </div>

            <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-5">
              <div className="flex items-start gap-3">
                <Trophy className="mt-0.5 shrink-0 text-sky-300" size={23} />
                <div>
                  <strong className="text-white">Competitive Brew</strong>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    You get <strong className="text-white">3 accepted attempts per hourly round</strong>.
                    Your best verified score becomes your leaderboard score.
                    Maximum Brew Score: <strong className="text-white">1,000 points</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 shrink-0 text-amber-300" size={22} />
                <div>
                  <strong className="text-white">New brewer?</strong>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Use <strong className="text-white">Practice · Unlimited</strong>{" "}
                    first. Practice runs do not use your competitive attempts.
                    When you&apos;re ready, connect your Sui wallet and start a
                    Competitive Brew.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-2xl bg-sky-400 px-5 py-4 font-black text-slate-950 transition hover:bg-sky-300"
            >
              GOT IT — LET&apos;S BREW ☕
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GuideCard({
  number,
  icon,
  title,
  points,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  points: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black tracking-widest text-sky-300">
          STAGE {number}
        </span>
        <span className="text-sky-300">{icon}</span>
      </div>

      <h3 className="mt-4 font-black text-white">{title}</h3>
      <div className="mt-1 text-xs font-bold text-sky-300">{points}</div>

      <p className="mt-3 text-sm leading-6 text-white/50">{children}</p>
    </div>
  );
}
