"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy, Timer, Wallet, Coffee } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import BrewBattleGame from "./brew-battle-game";

type Battle = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

type Leader = {
  wallet_address: string;
  best_score: number;
  attempts_played: number;
};

function shortWallet(address: string) {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function BrewCompetition() {
  const account = useCurrentAccount();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBattle = useCallback(async () => {
    try {
      const response = await fetch("/api/battle/current", {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to load battle");
      }

      setBattle(json.battle ?? null);
    } catch (error) {
      console.error("[BrewCompetition] battle load failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (!battle?.id) {
      setLeaders([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/battle/leaderboard?battleId=${encodeURIComponent(battle.id)}`,
        { cache: "no-store" }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to load leaderboard");
      }

      setLeaders(json.leaderboard ?? []);
    } catch (error) {
      console.error("[BrewCompetition] leaderboard load failed:", error);
    }
  }, [battle?.id]);

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

  useEffect(() => {
    if (!battle) return;

    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((new Date(battle.ends_at).getTime() - Date.now()) / 1000)
      );

      setRemaining(seconds);

      if (seconds === 0) {
        loadBattle();
      }
    };

    tick();

    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [battle, loadBattle]);

  useEffect(() => {
    loadLeaderboard();

    const timer = window.setInterval(loadLeaderboard, 10000);

    return () => window.clearInterval(timer);
  }, [loadLeaderboard]);

  const walletAddress = account?.address ?? null;

  const ownIndex = walletAddress
    ? leaders.findIndex(
        (leader) =>
          leader.wallet_address.toLowerCase() === walletAddress.toLowerCase()
      )
    : -1;

  const own = ownIndex >= 0 ? leaders[ownIndex] : null;
  const cutoff = leaders.length >= 10 ? leaders[9].best_score : null;

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-sky-300">
              <Trophy size={16} />
              HOURLY BREW BATTLE
            </div>

            <h2 className="text-3xl font-black text-white md:text-4xl">
              Coffeyville is competing.
            </h2>

            <p className="mt-3 max-w-2xl text-white/60">
              One wallet. One leaderboard position. Your best verified brew
              becomes your score for the hour.
            </p>
          </div>

          <div className="min-w-[190px] rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-sky-300">
              <Timer size={15} />
              ROUND ENDS IN
            </div>

            <div className="mt-2 text-4xl font-black tabular-nums text-white">
              {loading ? "--:--" : formatTime(remaining)}
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="YOUR BEST"
            value={own ? String(own.best_score) : "—"}
          />

          <Stat
            label="YOUR RANK"
            value={ownIndex >= 0 ? `#${ownIndex + 1}` : "—"}
          />

          <Stat
            label="TOP 10 CUTOFF"
            value={cutoff !== null ? String(cutoff) : "OPEN"}
          />

          <Stat
            label="ATTEMPTS"
            value={own ? `${own.attempts_played} / 3` : "0 / 3"}
          />
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-white/55">
          <Wallet size={16} />

          {walletAddress
            ? `Connected: ${shortWallet(walletAddress)}`
            : "Connect your Sui wallet to enter competitive rounds."}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3 text-sm text-white/60">
          Competitive submissions are being secured with wallet signatures and
          server validation before score entry is enabled.
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-black/20 p-5 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.2em] text-sky-300">
              LIVE · TOP 10
            </div>

            <h3 className="mt-2 text-2xl font-black text-white">
              Top Brewers
            </h3>
          </div>

          <Trophy className="text-sky-300" />
        </div>

        {leaders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
            <Coffee className="mx-auto mb-3 text-white/35" size={30} />
            <strong className="block text-white">
              Waiting for Coffeyville&apos;s first competitors...
            </strong>
            <span className="mt-1 block text-sm text-white/45">
              The first verified competitive brew will take the top spot.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.slice(0, 10).map((leader, index) => {
              const isYou =
                walletAddress &&
                leader.wallet_address.toLowerCase() ===
                  walletAddress.toLowerCase();

              return (
                <div
                  key={leader.wallet_address}
                  className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-xl border px-4 py-3 ${
                    isYou
                      ? "border-sky-400/40 bg-sky-400/[0.08]"
                      : "border-white/[0.06] bg-white/[0.025]"
                  }`}
                >
                  <strong className="text-white/70">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
                  </strong>

                  <span className="font-mono text-sm text-white/70">
                    {shortWallet(leader.wallet_address)}
                    {isYou ? " · YOU" : ""}
                  </span>

                  <strong className="text-lg text-white">
                    {leader.best_score}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <div className="text-xs font-bold tracking-[0.2em] text-white/40">
            PRACTICE · UNLIMITED
          </div>
        </div>

        <BrewBattleGame />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="text-[10px] font-bold tracking-[0.16em] text-white/40">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}
