"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy, Timer, Wallet, Coffee } from "lucide-react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import BrewBattleGame, { type Scores } from "./brew-battle-game";
import TestnetEntry from "./testnet-entry";

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
  const dAppKit = useDAppKit();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [totalVerifiedEntries, setTotalVerifiedEntries] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [competitiveChallenge, setCompetitiveChallenge] = useState<string | null>(null);
  const [competitiveError, setCompetitiveError] = useState<string | null>(null);
  const [submittingCompetitive, setSubmittingCompetitive] = useState(false);
  const [competitiveSuccess, setCompetitiveSuccess] = useState<string | null>(null);
  const [testnetEntryDigest, setTestnetEntryDigest] = useState<string | null>(null);
  const [recoveringPaidEntry, setRecoveringPaidEntry] = useState(false);
  const paidBetaEnabled = process.env.NEXT_PUBLIC_BREW_TESTNET_PAYMENTS === "true";
  const paidEntryRequired = paidBetaEnabled && !testnetEntryDigest;

  function paidEntryStorageKey(wallet: string, battleId: string) {
    return `brew:testnet-entry:${battleId}:${wallet.toLowerCase()}`;
  }

  function rememberPaidEntry(digest: string) {
    if (!account?.address || !battle?.id) return;

    window.localStorage.setItem(
      paidEntryStorageKey(account.address, battle.id),
      digest
    );
    setTestnetEntryDigest(digest);
  }

  function forgetPaidEntry() {
    if (account?.address && battle?.id) {
      window.localStorage.removeItem(
        paidEntryStorageKey(account.address, battle.id)
      );
    }
    setTestnetEntryDigest(null);
  }

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
      setTotalVerifiedEntries(0);
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
      setTotalVerifiedEntries(json.totalVerifiedEntries ?? 0);
    } catch (error) {
      console.error("[BrewCompetition] leaderboard load failed:", error);
    }
  }, [battle?.id]);

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

  useEffect(() => {
    if (!paidBetaEnabled || !account?.address || !battle?.id) {
      return;
    }

    const walletAddressForRecovery = account.address;
    const battleIdForRecovery = battle.id;
    const storageKey = paidEntryStorageKey(walletAddressForRecovery, battleIdForRecovery);
    const savedDigest = window.localStorage.getItem(storageKey);

    if (!savedDigest) {
      return;
    }

    const digestToRecover = savedDigest;
    let cancelled = false;

    async function recoverPaidEntry() {
      setRecoveringPaidEntry(true);

      try {
        const response = await fetch("/api/competitive/entry/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: walletAddressForRecovery,
            digest: digestToRecover,
          }),
        });

        const verified = await response.json();

        if (!response.ok || !verified.verified) {
          window.localStorage.removeItem(storageKey);
          return;
        }

        if (!cancelled) {
          setTestnetEntryDigest(digestToRecover);
        }
      } catch (error) {
        console.error("[BrewCompetition] paid entry recovery failed:", error);
      } finally {
        if (!cancelled) {
          setRecoveringPaidEntry(false);
        }
      }
    }

    recoverPaidEntry();

    return () => {
      cancelled = true;
    };
  }, [paidBetaEnabled, account?.address, battle?.id]);

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

  async function startCompetitive() {
    if (!account?.address) {
      setCompetitiveError("Connect your Sui wallet first.");
      return;
    }

    setAuthenticating(true);
    setCompetitiveError(null);
    setCompetitiveSuccess(null);
    setCompetitiveChallenge(null);

    try {
      const challengeResponse = await fetch("/api/competitive/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account.address,
        }),
      });

      const challenge = await challengeResponse.json();

      if (!challengeResponse.ok) {
        throw new Error(
          challenge.error || "Unable to create competitive challenge."
        );
      }

      const signed = await dAppKit.signPersonalMessage({
        message: new TextEncoder().encode(challenge.message),
        account,
        network: "mainnet",
      });

      const verifyResponse = await fetch("/api/competitive/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: challenge.challengeId,
          walletAddress: account.address,
          signature: signed.signature,
        }),
      });

      const verified = await verifyResponse.json();

      if (!verifyResponse.ok || !verified.authenticated) {
        throw new Error(
          verified.error || "Wallet authentication failed."
        );
      }

      setCompetitiveChallenge(verified.challengeId);
    } catch (error) {
      console.error("[BrewCompetition] competitive auth:", error);

      setCompetitiveError(
        error instanceof Error
          ? error.message
          : "Unable to start competitive brew."
      );
    } finally {
      setAuthenticating(false);
    }
  }

  async function submitCompetitiveScore(scores: Scores) {
    if (!account?.address || !competitiveChallenge) {
      setCompetitiveError(
        "Competitive session is missing. Please authenticate again."
      );
      return;
    }

    if (submittingCompetitive) return;

    setSubmittingCompetitive(true);
    setCompetitiveError(null);
    setCompetitiveSuccess(null);

    try {
      const response = await fetch("/api/competitive/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: competitiveChallenge,
          walletAddress: account.address,
          scores,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.accepted) {
        throw new Error(
          json.error || "Competitive score was not accepted."
        );
      }

      setCompetitiveChallenge(null);
      if (paidBetaEnabled) {
        forgetPaidEntry();
      }

      setCompetitiveSuccess(
        `✓ SCORE ACCEPTED · ${json.score} PTS · ATTEMPT ${json.attemptNumber} / 3`
      );

      await loadLeaderboard();
    } catch (error) {
      console.error(
        "[BrewCompetition] competitive submission:",
        error
      );

      setCompetitiveError(
        error instanceof Error
          ? error.message
          : "Competitive submission failed."
      );

      setCompetitiveChallenge(null);
    } finally {
      setSubmittingCompetitive(false);
    }
  }

  const walletAddress = account?.address ?? null;

  const ownIndex = walletAddress
    ? leaders.findIndex(
        (leader) =>
          leader.wallet_address.toLowerCase() === walletAddress.toLowerCase()
      )
    : -1;

  const own = ownIndex >= 0 ? leaders[ownIndex] : null;
  const cutoff = leaders.length >= 10 ? leaders[9].best_score : null;

  const livePoolSui = totalVerifiedEntries * 0.1;
  const eligibleBrewers = leaders.length;

  const buybackBurnSui = livePoolSui * 0.025;
  const marketingSui = livePoolSui * 0.025;

  const firstPrizeSui =
    eligibleBrewers <= 1
      ? livePoolSui * 0.95
      : eligibleBrewers === 2
      ? livePoolSui * 0.525
      : livePoolSui * 0.4;

  const secondPrizeSui =
    eligibleBrewers === 2
      ? livePoolSui * 0.425
      : eligibleBrewers >= 3
      ? livePoolSui * 0.3
      : 0;

  const thirdPrizeSui = eligibleBrewers >= 3 ? livePoolSui * 0.25 : 0;

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

          <div className="grid min-w-[280px] grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[430px]">
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-sky-300">
                <Timer size={15} />
                ROUND ENDS IN
              </div>

              <div className="mt-2 text-4xl font-black tabular-nums text-white">
                {loading ? "--:--" : formatTime(remaining)}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4">
              <div className="text-xs font-bold tracking-widest text-emerald-300">
                LIVE PRIZE POOL
              </div>
              <div className="mt-2 text-4xl font-black tabular-nums text-white">
                {livePoolSui.toFixed(2)} SUI
              </div>
              <div className="mt-1 text-[11px] text-white/45">
                {totalVerifiedEntries} verified {totalVerifiedEntries === 1 ? "entry" : "entries"} this round
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="YOUR BEST" value={own ? String(own.best_score) : "—"} />
          <Stat label="YOUR RANK" value={ownIndex >= 0 ? `#${ownIndex + 1}` : "—"} />
          <Stat label="TOP 10 CUTOFF" value={cutoff !== null ? String(cutoff) : "OPEN"} />
          <Stat label="ATTEMPTS" value={own ? `${own.attempts_played} / 3` : "0 / 3"} />
        </div>


        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-black tracking-[0.18em] text-white/50">
                CURRENT ROUND PAYOUTS
              </div>
              <div className="mt-1 text-sm text-white/55">
                {eligibleBrewers <= 1
                  ? "1 eligible brewer · 95% to the winner"
                  : eligibleBrewers === 2
                  ? "2 eligible brewers · 95% split between 1st and 2nd"
                  : "95% to the top 3 · 5% supports the EspresSUI ecosystem"}
              </div>
            </div>
            <div className="text-xs font-bold text-sky-300">
              0.1 SUI PER COMPETITIVE ENTRY
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <PrizeStat
              label={
                eligibleBrewers <= 1
                  ? "🥇 WINNER · 95%"
                  : eligibleBrewers === 2
                  ? "🥇 1ST · 52.5%"
                  : "🥇 1ST · 40%"
              }
              value={firstPrizeSui}
            />

            {eligibleBrewers >= 2 ? (
              <PrizeStat
                label={eligibleBrewers === 2 ? "🥈 2ND · 42.5%" : "🥈 2ND · 30%"}
                value={secondPrizeSui}
              />
            ) : null}

            {eligibleBrewers >= 3 ? (
              <PrizeStat label="🥉 3RD · 25%" value={thirdPrizeSui} />
            ) : null}

            <PrizeStat label="🔥 BURN · 2.5%" value={buybackBurnSui} />
            <PrizeStat label="📣 MARKETING · 2.5%" value={marketingSui} />
          </div>

          <div className="mt-3 text-[11px] leading-5 text-white/35">
            Testnet beta: payouts adjust automatically to the number of unique eligible brewers in the current hourly round. The live pool currently updates from completed verified competitive entries.
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-white/55">
          <Wallet size={16} />
          {walletAddress
            ? `Connected: ${shortWallet(walletAddress)}`
            : "Connect your Sui wallet to enter competitive rounds."}
        </div>

        {paidBetaEnabled ? (
          <div className="mt-5">
            <TestnetEntry onPaid={rememberPaidEntry} />

            {recoveringPaidEntry ? (
              <div className="mt-2 text-xs text-sky-300/80">
                Checking your previous verified test payment...
              </div>
            ) : testnetEntryDigest ? (
              <div className="mt-2 text-xs font-bold text-emerald-300/80">
                ✓ Server verified the 0.1 test SUI payment. This payment unlocks one competitive attempt in this browser session.
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/40">
                Pay and verify 0.1 test SUI before starting a competitive attempt.
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-5">
          {!competitiveChallenge ? (
            <button
              type="button"
              onClick={startCompetitive}
              disabled={!walletAddress || authenticating || recoveringPaidEntry || paidEntryRequired || (own?.attempts_played ?? 0) >= 3}
              className="w-full rounded-2xl bg-sky-400 px-5 py-4 font-black text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {recoveringPaidEntry
                ? "RESTORING VERIFIED PAYMENT..."
                : authenticating
                ? "VERIFYING WALLET..."
                : !walletAddress
                ? "CONNECT WALLET TO COMPETE"
                : (own?.attempts_played ?? 0) >= 3
                ? "3 / 3 ATTEMPTS USED"
                : paidEntryRequired
                ? "PAY 0.1 TEST SUI TO UNLOCK"
                : `START COMPETITIVE BREW · ${3 - (own?.attempts_played ?? 0)} LEFT`}
            </button>
          ) : (
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-4">
              <div className="font-black text-emerald-300">✓ WALLET VERIFIED</div>
              <div className="mt-1 text-sm text-white/55">
                Secure competitive session ready. Complete the Competitive Arena below to submit this attempt.
              </div>
            </div>
          )}

          {competitiveError ? (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {competitiveError}
            </div>
          ) : null}

          {competitiveSuccess ? (
            <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm font-bold text-emerald-200">
              {competitiveSuccess}
            </div>
          ) : null}
        </div>
      </section>

      {competitiveChallenge ? (
        <section className="rounded-[28px] border border-sky-400/20 bg-sky-400/[0.035] p-5 md:p-8">
          <div className="mb-5">
            <div className="text-xs font-bold tracking-[0.2em] text-sky-300">
              VERIFIED COMPETITIVE RUN
            </div>

            <h3 className="mt-2 text-2xl font-black text-white">
              This one counts.
            </h3>

            <p className="mt-2 text-sm text-white/55">
              Complete all three stages. A successfully accepted result
              consumes one of your three hourly attempts.
            </p>
          </div>

          {submittingCompetitive ? (
            <div className="mb-4 rounded-xl border border-sky-400/20 bg-sky-400/[0.06] px-4 py-3 text-sm font-bold text-sky-200">
              VERIFYING &amp; SUBMITTING BREW...
            </div>
          ) : null}

          <BrewBattleGame
            mode="competitive"
            disabled={submittingCompetitive}
            onComplete={submitCompetitiveScore}
          />
        </section>
      ) : null}

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

function PrizeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
      <div className="text-[10px] font-bold tracking-[0.12em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-lg font-black tabular-nums text-white">
        {value.toFixed(2)} SUI
      </div>
    </div>
  );
}
