import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

function validSuiAddress(address: unknown): address is string {
  return (
    typeof address === "string" &&
    /^0x[0-9a-fA-F]{64}$/.test(address)
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const walletAddress = body?.walletAddress;

    if (!validSuiAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Sui wallet address." },
        { status: 400 }
      );
    }

    const supabase = serverSupabase();

    // Make sure the current hourly battle exists.
    const { error: ensureError } = await supabase.rpc(
      "ensure_current_battle"
    );

    if (ensureError) {
      console.error("[challenge] ensure battle:", ensureError);
      return NextResponse.json(
        { error: "Unable to initialize battle." },
        { status: 500 }
      );
    }

    const now = new Date();

    const { data: battle, error: battleError } = await supabase
      .from("battle_rounds")
      .select("id, starts_at, ends_at, status")
      .eq("status", "active")
      .lte("starts_at", now.toISOString())
      .gt("ends_at", now.toISOString())
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (battleError || !battle) {
      console.error("[challenge] battle:", battleError);
      return NextResponse.json(
        { error: "No active battle." },
        { status: 409 }
      );
    }

    // Attempts are enforced by the server, never by the browser.
    const { count, error: countError } = await supabase
      .from("competitive_attempts")
      .select("id", { count: "exact", head: true })
      .eq("battle_id", battle.id)
      .eq("wallet_address", walletAddress.toLowerCase());

    if (countError) {
      console.error("[challenge] attempt count:", countError);
      return NextResponse.json(
        { error: "Unable to check attempts." },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: "All 3 competitive attempts have been used for this round.",
          attemptsUsed: count ?? 0,
        },
        { status: 429 }
      );
    }

    // Remove stale unconsumed challenges for this wallet/battle.
    await supabase
      .from("competitive_challenges")
      .update({ status: "expired" })
      .eq("battle_id", battle.id)
      .eq("wallet_address", walletAddress.toLowerCase())
      .in("status", ["issued", "authenticated"])
      .lt("expires_at", now.toISOString());

    const nonce = crypto.randomBytes(32).toString("hex");

    // Authentication challenge is deliberately short lived.
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const challengeId = crypto.randomUUID();

    const message = [
      "EspresSUI Brew Arena",
      "Competitive wallet authentication",
      "",
      `Wallet: ${walletAddress.toLowerCase()}`,
      `Battle: ${battle.id}`,
      `Challenge: ${challengeId}`,
      `Nonce: ${nonce}`,
      `Expires: ${expiresAt.toISOString()}`,
      "",
      "This signature authenticates your Brew Arena session.",
      "It does not authorize a transaction or transfer.",
    ].join("\n");

    const { data: challenge, error: challengeError } =
      await supabase
        .from("competitive_challenges")
        .insert({
          id: challengeId,
          battle_id: battle.id,
          wallet_address: walletAddress.toLowerCase(),
          nonce,
          signed_message: message,
          status: "issued",
          expires_at: expiresAt.toISOString(),
        })
        .select("id")
        .single();

    if (challengeError || !challenge) {
      console.error("[challenge] create:", challengeError);
      return NextResponse.json(
        { error: "Unable to create secure challenge." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        challengeId: challenge.id,
        battleId: battle.id,
        message,
        expiresAt: expiresAt.toISOString(),
        attemptsUsed: count ?? 0,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[challenge] unexpected:", error);

    return NextResponse.json(
      { error: "Unable to create competitive challenge." },
      { status: 500 }
    );
  }
}
