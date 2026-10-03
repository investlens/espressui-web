"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Flame, Megaphone, Trophy } from "lucide-react";

type Payout = {
  place: 1 | 2 | 3;
  walletAddress: string;
  score: number;
  sharePct: number;
  amountSui: number;
  txDigest: string | null;
  payoutStatus: string;
};

type RoundResult = {
  battleId: string;
  startsAt: string;
  endsAt: string;
  totalEntries: number;
  uniqueBrewers: number;
  totalPoolSui: number;
  buybackBurnSui: number;
  marketingSui: number;
  payouts: Payout[];
};

function shortWallet(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortDigest(digest: string) {
  return `${digest.slice(0, 10)}...${digest.slice(-8)}`;
}

function placeLabel(place: number) {
  if (place === 1) return "🥇 1st";
  if (place === 2) return "🥈 2nd";
  return "🥉 3rd";
}

export default function BrewResults() {
  const [results, setResults] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/battle/results", { cache: "no-store" });
        const json = await response.json();

        if (!response.ok) throw new Error(json.error || "Unable to load results");
        if (!cancelled) setResults(json.results ?? []);
      } catch (error) {
        console.error("[BrewResults] load:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-white/10 p-8 text-white/50">Loading completed rounds...</div>;
  }

  if (results.length === 0) {
    return <div className="rounded-2xl border border-white/10 p-8 text-white/50">No completed Brew Battle rounds yet.</div>;
  }

  return (
    <div className="space-y-5">
      {results.map((round) => (
        <article key={round.battleId} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-black tracking-[0.18em] text-sky-300">COMPLETED ROUND</div>
              <h2 className="mt-2 text-2xl font-black text-white">
                {new Date(round.endsAt).toLocaleString()}
              </h2>
              <div className="mt-2 text-sm text-white/45">
                {round.uniqueBrewers} unique brewers · {round.totalEntries} paid attempts
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4">
              <div className="text-xs font-bold tracking-widest text-emerald-300">FINAL POOL</div>
              <div className="mt-1 text-3xl font-black text-white">{round.totalPoolSui.toFixed(2)} SUI</div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {round.payouts.map((payout) => (
              <div key={payout.place} className="grid gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-4 md:grid-cols-[90px_1fr_100px_120px_180px] md:items-center">
                <strong className="text-white">{placeLabel(payout.place)}</strong>
                <span className="font-mono text-sm text-white/60">{shortWallet(payout.walletAddress)}</span>
                <span className="text-sm text-white/55">Score {payout.score}</span>
                <strong className="text-white">{payout.amountSui.toFixed(4)} SUI</strong>

                {payout.txDigest ? (
                  <a
                    href={`https://suivision.xyz/txblock/${payout.txDigest}?network=testnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm font-bold text-sky-300 hover:text-sky-200"
                  >
                    {shortDigest(payout.txDigest)} <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="text-sm font-bold text-amber-200">PAYOUT PENDING</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-orange-300/10 bg-orange-300/[0.04] px-4 py-3 text-sm text-white/60">
              <Flame className="text-orange-300" size={18} />
              Buyback & Burn allocation: <strong className="text-white">{round.buybackBurnSui.toFixed(4)} SUI</strong>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-sky-300/10 bg-sky-300/[0.04] px-4 py-3 text-sm text-white/60">
              <Megaphone className="text-sky-300" size={18} />
              Marketing allocation: <strong className="text-white">{round.marketingSui.toFixed(4)} SUI</strong>
            </div>
          </div>
        </article>
      ))}

      <div className="flex justify-center">
        <Link href="/brew-battle" className="rounded-xl border border-sky-400/30 px-5 py-3 font-bold text-sky-300">
          ← Back to Brew Battle
        </Link>
      </div>
    </div>
  );
}
