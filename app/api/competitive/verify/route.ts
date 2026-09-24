import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidPersonalMessageSignature } from "@mysten/sui/verify";

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

    const challengeId = body?.challengeId;
    const walletAddress = body?.walletAddress;
    const signature = body?.signature;

    if (
      typeof challengeId !== "string" ||
      !validSuiAddress(walletAddress) ||
      typeof signature !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid authentication request." },
        { status: 400 }
      );
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const supabase = serverSupabase();

    const { data: challenge, error } = await supabase
      .from("competitive_challenges")
      .select(
        "id, battle_id, wallet_address, nonce, signed_message, status, expires_at"
      )
      .eq("id", challengeId)
      .maybeSingle();

    if (error || !challenge) {
      return NextResponse.json(
        { error: "Challenge not found." },
        { status: 404 }
      );
    }

    if (challenge.status !== "issued") {
      return NextResponse.json(
        { error: "Challenge has already been used." },
        { status: 409 }
      );
    }

    if (
      challenge.wallet_address.toLowerCase() !== normalizedWallet
    ) {
      return NextResponse.json(
        { error: "Wallet does not match challenge." },
        { status: 403 }
      );
    }

    const now = new Date();

    if (new Date(challenge.expires_at).getTime() <= now.getTime()) {
      await supabase
        .from("competitive_challenges")
        .update({ status: "expired" })
        .eq("id", challenge.id)
        .eq("status", "issued");

      return NextResponse.json(
        { error: "Challenge expired. Please start again." },
        { status: 410 }
      );
    }

    const { data: battle } = await supabase
      .from("battle_rounds")
      .select("id, ends_at, status")
      .eq("id", challenge.battle_id)
      .maybeSingle();

    if (
      !battle ||
      battle.status !== "active" ||
      new Date(battle.ends_at).getTime() <= now.getTime()
    ) {
      return NextResponse.json(
        { error: "This battle has ended." },
        { status: 409 }
      );
    }

    if (
      typeof challenge.signed_message !== "string" ||
      !challenge.signed_message
    ) {
      return NextResponse.json(
        { error: "Challenge message is unavailable." },
        { status: 409 }
      );
    }

    let valid = false;

    try {
      valid = await isValidPersonalMessageSignature(
        new TextEncoder().encode(challenge.signed_message),
        signature,
        {
          address: normalizedWallet,
        }
      );
    } catch (signatureError) {
      console.error("[verify] signature environment error:", signatureError);

      return NextResponse.json(
        { error: "Unable to verify wallet signature right now." },
        { status: 503 }
      );
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Wallet signature verification failed." },
        { status: 401 }
      );
    }

    /*
     * Atomic state transition:
     * only an ISSUED challenge may become AUTHENTICATED.
     *
     * If two verification requests race, only one wins.
     */
    const { data: authenticated, error: updateError } =
      await supabase
        .from("competitive_challenges")
        .update({
          status: "authenticated",
          authenticated_at: now.toISOString(),
        })
        .eq("id", challenge.id)
        .eq("status", "issued")
        .select("id")
        .maybeSingle();

    if (updateError) {
      console.error("[verify] update:", updateError);

      return NextResponse.json(
        { error: "Unable to authenticate challenge." },
        { status: 500 }
      );
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: "Challenge has already been used." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        challengeId: challenge.id,
        battleId: challenge.battle_id,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[verify] unexpected:", error);

    return NextResponse.json(
      { error: "Wallet authentication failed." },
      { status: 500 }
    );
  }
}
