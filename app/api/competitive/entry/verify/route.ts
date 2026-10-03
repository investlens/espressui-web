import { NextResponse } from "next/server";
import { verifyBrewTestnetEntry } from "../../../../../lib/brew-testnet-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validSuiAddress(address: unknown): address is string {
  return typeof address === "string" && /^0x[0-9a-fA-F]{64}$/.test(address);
}

function validDigest(digest: unknown): digest is string {
  return typeof digest === "string" && digest.length >= 32 && digest.length <= 128;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const walletAddress = body?.walletAddress;
    const digest = body?.digest;

    if (!validSuiAddress(walletAddress) || !validDigest(digest)) {
      return NextResponse.json(
        { error: "Invalid testnet entry verification request." },
        { status: 400 }
      );
    }

    const verified = await verifyBrewTestnetEntry({
      digest,
      walletAddress,
    });

    return NextResponse.json(verified, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "BREW_TESTNET_TREASURY_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Testnet entry is not configured yet." },
        { status: 503 }
      );
    }

    if (message === "ENTRY_TRANSACTION_FAILED") {
      console.warn("[BrewTestnetEntry] transaction failed or unavailable");
      return NextResponse.json(
        { error: "The testnet transaction was not successful or is not available yet." },
        { status: 400 }
      );
    }

    if (message === "ENTRY_WALLET_MISMATCH") {
      console.warn("[BrewTestnetEntry] connected wallet did not match transaction sender");
      return NextResponse.json(
        { error: "The transaction sender does not match the connected wallet." },
        { status: 400 }
      );
    }

    if (message === "ENTRY_AMOUNT_MISMATCH") {
      console.warn("[BrewTestnetEntry] treasury did not receive exactly 0.1 test SUI");
      return NextResponse.json(
        { error: "The treasury did not receive exactly 0.1 test SUI." },
        { status: 400 }
      );
    }

    console.error("[BrewTestnetEntry] verification failed:", error);

    return NextResponse.json(
      { error: "Unable to verify testnet entry right now." },
      { status: 500 }
    );
  }
}
