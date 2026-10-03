import { SuiGrpcClient } from "@mysten/sui/grpc";

export const BREW_TESTNET_ENTRY_MIST = BigInt("100000000");

const TESTNET_RPC = "https://fullnode.testnet.sui.io:443";

function configuredTreasury() {
  const treasury = process.env.NEXT_PUBLIC_BREW_TESTNET_TREASURY;

  if (!treasury || !/^0x[0-9a-fA-F]{64}$/.test(treasury)) {
    throw new Error("BREW_TESTNET_TREASURY_NOT_CONFIGURED");
  }

  return treasury.toLowerCase();
}

function isSuiCoinType(coinType: string) {
  const match = /^0x([0-9a-fA-F]+)::sui::SUI$/.exec(coinType);
  if (!match) return false;

  const packageHex = match[1].replace(/^0+/, "") || "0";
  return packageHex.toLowerCase() === "2";
}

export async function verifyBrewTestnetEntry({
  digest,
  walletAddress,
}: {
  digest: string;
  walletAddress: string;
}) {
  const treasury = configuredTreasury();
  const wallet = walletAddress.toLowerCase();

  const client = new SuiGrpcClient({
    network: "testnet",
    baseUrl: TESTNET_RPC,
  });

  // A wallet can return a digest before indexed reads are ready.
  await client.waitForTransaction({
    digest,
    timeout: 15_000,
  });

  const result = await client.getTransaction({
    digest,
    include: {
      transaction: true,
      balanceChanges: true,
      effects: true,
    },
  });

  if (!result.Transaction) {
    throw new Error("ENTRY_TRANSACTION_FAILED");
  }

  const transaction = result.Transaction;
  const sender = transaction.transaction?.sender;

  if (!sender || sender.toLowerCase() !== wallet) {
    throw new Error("ENTRY_WALLET_MISMATCH");
  }

  const treasuryCredit = (transaction.balanceChanges ?? [])
    .filter(
      (change) =>
        isSuiCoinType(change.coinType) &&
        change.address.toLowerCase() === treasury &&
        BigInt(change.amount) > BigInt(0)
    )
    .reduce((sum, change) => sum + BigInt(change.amount), BigInt(0));

  if (treasuryCredit !== BREW_TESTNET_ENTRY_MIST) {
    console.warn("[BrewTestnetEntry] amount mismatch", {
      expected: BREW_TESTNET_ENTRY_MIST.toString(),
      observedTreasuryCredit: treasuryCredit.toString(),
      balanceChanges: (transaction.balanceChanges ?? []).map((change) => ({
        address: change.address,
        coinType: change.coinType,
        amount: change.amount,
      })),
    });
    throw new Error("ENTRY_AMOUNT_MISMATCH");
  }

  return {
    verified: true as const,
    digest: transaction.digest,
    wallet,
    treasury,
    amountMist: BREW_TESTNET_ENTRY_MIST.toString(),
  };
}
