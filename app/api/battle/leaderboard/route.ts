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
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase configuration missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("battle_leaderboard")
    .select("wallet_address, best_score, attempts_played")
    .eq("battle_id", battleId)
    .order("best_score", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[BrewBattle] leaderboard failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve leaderboard" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { leaderboard: data ?? [] },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
