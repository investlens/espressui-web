import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

function validInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const challengeId = body?.challengeId;
    const walletAddress = body?.walletAddress;
    const grind = body?.scores?.grind;
    const pressure = body?.scores?.pressure;
    const pour = body?.scores?.pour;

    if (
      typeof challengeId !== "string" ||
      !validSuiAddress(walletAddress) ||
      !validInteger(grind) ||
      !validInteger(pressure) ||
      !validInteger(pour)
    ) {
      return NextResponse.json(
        { error: "Invalid competitive submission." },
        { status: 400 }
      );
    }

    /*
     * Cheap rejection before reaching the transaction.
     * The database function repeats these checks and remains authoritative.
     */
    if (
      grind < 0 ||
      grind > 300 ||
      pressure < 0 ||
      pressure > 350 ||
      pour < 0 ||
      pour > 350
    ) {
      return NextResponse.json(
        { error: "Invalid competitive score." },
        { status: 400 }
      );
    }

    const supabase = serverSupabase();

    const { data, error } = await supabase.rpc(
      "accept_competitive_attempt",
      {
        p_challenge_id: challengeId,
        p_wallet_address: walletAddress.toLowerCase(),
        p_grind_score: grind,
        p_pressure_score: pressure,
        p_pour_score: pour,
      }
    );

    if (error) {
      console.error("[competitive submit]", error);

      const message = error.message ?? "";

      if (message.includes("ATTEMPT_LIMIT_REACHED")) {
        return NextResponse.json(
          { error: "All 3 competitive attempts have been used." },
          { status: 429 }
        );
      }

      if (
        message.includes("CHALLENGE_NOT_AUTHENTICATED") ||
        message.includes("CHALLENGE_EXPIRED") ||
        message.includes("CHALLENGE_NOT_FOUND")
      ) {
        return NextResponse.json(
          { error: "Competitive session is no longer valid. Start a new one." },
          { status: 409 }
        );
      }

      if (message.includes("WALLET_MISMATCH")) {
        return NextResponse.json(
          { error: "Wallet verification failed." },
          { status: 403 }
        );
      }

      if (message.includes("BATTLE_NOT_ACTIVE")) {
        return NextResponse.json(
          { error: "This hourly battle has ended." },
          { status: 409 }
        );
      }

      if (
        message.includes("INVALID_GRIND_SCORE") ||
        message.includes("INVALID_PRESSURE_SCORE") ||
        message.includes("INVALID_POUR_SCORE") ||
        message.includes("INVALID_TOTAL_SCORE")
      ) {
        return NextResponse.json(
          { error: "Competitive score was rejected." },
          { status: 400 }
        );
      }

      /*
       * Do not leak raw database errors to users.
       */
      return NextResponse.json(
        { error: "Competitive submission could not be accepted." },
        { status: 500 }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
      return NextResponse.json(
        { error: "Competitive attempt was not recorded." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        accepted: true,
        attemptNumber: result.attempt_number,
        score: result.score,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[competitive submit] unexpected:", error);

    return NextResponse.json(
      { error: "Competitive submission failed." },
      { status: 500 }
    );
  }
}
