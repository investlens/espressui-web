import { SuiGrpcClient } from "@mysten/sui/grpc";

export const BREW_TESTNET_ENTRY_MIST = BigInt("100000000");
export const SUI_COIN_TYPE = "0x2::sui::SUI";

const TESTNET_RPC = "https://fullnode.testnet.sui.io:443";

function configuredTreasury() {
  const treasury = process.env.NEXT_PUBLIC_BREW_TESTNET_TREASURY;

  if (!treasury || !/^0x[0-9a-fA-F]{64}$/.test(treasury)) {
    throw new Error("BREW_TESTNET_TREASURY_NOT_CONFIGURED");
  }

  return treasury.toLowerCase();
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
        change.coinType === SUI_COIN_TYPE &&
        change.address.toLowerCase() === treasury &&
        BigInt(change.amount) > BigInt(0)
    )
    .reduce((sum, change) => sum + BigInt(change.amount), BigInt(0));

  if (treasuryCredit !== BREW_TESTNET_ENTRY_MIST) {
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
