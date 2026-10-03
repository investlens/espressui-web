import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  buybackBurnAmount,
  calculateBrewPayouts,
  marketingAmount,
} from "../../../../lib/brew-payouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serverSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = serverSupabase();
    const now = new Date().toISOString();

    const { data: rounds, error: roundsError } = await supabase
      .from("battle_rounds")
      .select("id, starts_at, ends_at, status")
      .lte("ends_at", now)
      .order("ends_at", { ascending: false })
      .limit(20);

    if (roundsError) {
      console.error("[BrewResults] rounds:", roundsError);
      return NextResponse.json(
        { error: "Unable to load completed rounds." },
        { status: 500 }
      );
    }

    const results = [];

    for (const round of rounds ?? []) {
      const { data: attempts, error: attemptsError } = await supabase
        .from("competitive_attempts")
        .select("wallet_address, score")
        .eq("battle_id", round.id)
        .eq("verified", true)
        .order("score", { ascending: false });

      if (attemptsError) {
        console.error("[BrewResults] attempts:", attemptsError);
        continue;
      }

      const byWallet = new Map<string, { wallet_address: string; best_score: number }>();

      for (const attempt of attempts ?? []) {
        const wallet = attempt.wallet_address.toLowerCase();
        const existing = byWallet.get(wallet);

        if (!existing || attempt.score > existing.best_score) {
          byWallet.set(wallet, {
            wallet_address: wallet,
            best_score: attempt.score,
          });
        }
      }

      const ranked = Array.from(byWallet.values()).sort(
        (a, b) => b.best_score - a.best_score
      );

      const totalEntries = (attempts ?? []).length;
      const totalPoolSui = Number((totalEntries * 0.1).toFixed(9));
      const payouts = calculateBrewPayouts(ranked, totalPoolSui);

      let payoutRecords: Array<{
        place: number;
        wallet_address: string;
        amount_sui: number;
        tx_digest: string | null;
        status: string;
      }> = [];

      const optionalPayouts = await supabase
        .from("brew_round_payouts")
        .select("place, wallet_address, amount_sui, tx_digest, status")
        .eq("battle_id", round.id)
        .order("place", { ascending: true });

      if (!optionalPayouts.error) {
        payoutRecords = optionalPayouts.data ?? [];
      }

      const enrichedPayouts = payouts.map((payout) => {
        const stored = payoutRecords.find(
          (record) =>
            record.place === payout.place &&
            record.wallet_address.toLowerCase() === payout.walletAddress.toLowerCase()
        );

        return {
          ...payout,
          txDigest: stored?.tx_digest ?? null,
          payoutStatus: stored?.status ?? "pending",
        };
      });

      results.push({
        battleId: round.id,
        startsAt: round.starts_at,
        endsAt: round.ends_at,
        status: round.status,
        totalEntries,
        uniqueBrewers: ranked.length,
        totalPoolSui,
        buybackBurnSui: buybackBurnAmount(totalPoolSui),
        marketingSui: marketingAmount(totalPoolSui),
        payouts: enrichedPayouts,
      });
    }

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("[BrewResults] unexpected:", error);
    return NextResponse.json(
      { error: "Unable to load Brew Battle results." },
      { status: 500 }
    );
  }
}
