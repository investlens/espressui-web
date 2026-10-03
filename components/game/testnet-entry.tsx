"use client";

import { useState } from "react";
import { ShieldCheck, WalletCards } from "lucide-react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";

const ENTRY_MIST = 100_000_000;
const ENTRY_SUI = "0.1";

type Props = {
  onPaid?: (digest: string) => void;
};

function validSuiAddress(value: string | undefined) {
  return Boolean(value && /^0x[0-9a-fA-F]{64}$/.test(value));
}

export default function TestnetEntry({ onPaid }: Props) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const treasury = process.env.NEXT_PUBLIC_BREW_TESTNET_TREASURY;

  const [paying, setPaying] = useState(false);
  const [digest, setDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = validSuiAddress(treasury);

  async function payEntry() {
    if (!account?.address) {
      setError("Connect your Sui wallet first.");
      return;
    }

    if (!configured || !treasury) {
      setError("Testnet treasury is not configured yet.");
      return;
    }

    if (paying) return;

    setPaying(true);
    setError(null);
    setDigest(null);

    try {
      const tx = new Transaction();

      tx.transferObjects(
        [coinWithBalance({ balance: ENTRY_MIST })],
        treasury
      );

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
        network: "testnet",
      });

      if (result.FailedTransaction) {
        throw new Error(
          result.FailedTransaction.status.error?.message ||
            "Testnet entry transaction failed."
        );
      }

      const nextDigest = result.Transaction.digest;

      const verifyResponse = await fetch("/api/competitive/entry/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account.address,
          digest: nextDigest,
        }),
      });

      const verified = await verifyResponse.json();

      if (!verifyResponse.ok || !verified.verified) {
        throw new Error(
          verified.error || "Testnet payment could not be verified."
        );
      }

      setDigest(nextDigest);
      onPaid?.(nextDigest);
    } catch (cause) {
      console.error("[TestnetEntry] payment failed:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to complete testnet entry."
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.045] p-4 md:p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-amber-200" size={20} />

        <div className="min-w-0 flex-1">
          <div className="text-xs font-black tracking-[0.18em] text-amber-200">
            TESTNET PAYMENT BETA
          </div>

          <h3 className="mt-1 text-lg font-black text-white">
            {ENTRY_SUI} test SUI entry
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/60">
            This beta uses Sui testnet only. Test SUI has no real value.
            Your wallet approves one explicit {ENTRY_SUI} SUI transaction.
            EspresSUI never receives your private key and does not request
            unlimited spending approval.
          </p>

          {!configured ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/55">
              Payment is intentionally locked until the testnet treasury
              address is configured.
            </div>
          ) : digest ? (
            <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-200">
              ✓ Testnet entry sent · {digest.slice(0, 10)}...{digest.slice(-8)}
            </div>
          ) : (
            <button
              type="button"
              onClick={payEntry}
              disabled={!account?.address || paying}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <WalletCards size={17} />
              {paying
                ? "CONFIRMING TESTNET ENTRY..."
                : account?.address
                ? `PAY ${ENTRY_SUI} TEST SUI`
                : "CONNECT WALLET TO TEST"}
            </button>
          )}

          {error ? (
            <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
