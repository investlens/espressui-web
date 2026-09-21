import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    return NextResponse.json(
      { error: "Server Supabase configuration missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Server-only function:
  // ensures the current hourly battle exists.
  const { data: ensuredBattle, error: ensureError } =
    await supabase.rpc("ensure_current_battle");

  if (ensureError) {
    console.error("[BrewBattle] ensure_current_battle failed:", ensureError);

    return NextResponse.json(
      { error: "Unable to create or retrieve current battle" },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();

  // Read it again explicitly so the API response remains predictable.
  const { data: battle, error: battleError } = await supabase
    .from("battle_rounds")
    .select("id, starts_at, ends_at, status")
    .eq("status", "active")
    .lte("starts_at", now)
    .gt("ends_at", now)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (battleError) {
    console.error("[BrewBattle] battle read failed:", battleError);

    return NextResponse.json(
      { error: "Unable to retrieve current battle" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      battle: battle ?? ensuredBattle ?? null,
      serverTime: now,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
