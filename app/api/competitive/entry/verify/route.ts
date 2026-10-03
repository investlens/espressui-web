import { NextResponse } from "next/server";
import { verifyBrewTestnetEntry } from "../../../../lib/brew-testnet-server";

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

    if (
      message === "ENTRY_TRANSACTION_FAILED" ||
      message === "ENTRY_WALLET_MISMATCH" ||
      message === "ENTRY_AMOUNT_MISMATCH"
    ) {
      return NextResponse.json(
        { error: "Testnet entry transaction could not be verified." },
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
