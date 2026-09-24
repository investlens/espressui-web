import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const battleId = request.nextUrl.searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json(
      { error: "battleId is required" },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    return NextResponse.json(
      { error: "Supabase server configuration missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("competitive_attempts")
    .select("wallet_address, score, created_at")
    .eq("battle_id", battleId)
    .eq("verified", true)
    .order("score", { ascending: false });

  if (error) {
    console.error("[BrewBattle] leaderboard failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve leaderboard" },
      { status: 500 }
    );
  }

  const byWallet = new Map<
    string,
    {
      wallet_address: string;
      best_score: number;
      attempts_played: number;
    }
  >();

  for (const row of data ?? []) {
    const wallet = row.wallet_address.toLowerCase();

    const existing = byWallet.get(wallet);

    if (!existing) {
      byWallet.set(wallet, {
        wallet_address: wallet,
        best_score: row.score,
        attempts_played: 1,
      });
      continue;
    }

    existing.attempts_played += 1;

    if (row.score > existing.best_score) {
      existing.best_score = row.score;
    }
  }

  const leaderboard = Array.from(byWallet.values())
    .sort((a, b) => b.best_score - a.best_score)
    .slice(0, 100);

  return NextResponse.json(
    { leaderboard },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
