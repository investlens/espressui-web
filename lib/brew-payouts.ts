export type RankedBrewer = {
  wallet_address: string;
  best_score: number;
};

export type PayoutShare = {
  place: 1 | 2 | 3;
  walletAddress: string;
  score: number;
  sharePct: number;
  amountSui: number;
};

export function calculateBrewPayouts(
  rankedBrewers: RankedBrewer[],
  totalPoolSui: number
): PayoutShare[] {
  if (rankedBrewers.length === 0 || totalPoolSui <= 0) return [];

  const shares =
    rankedBrewers.length === 1
      ? [95]
      : rankedBrewers.length === 2
      ? [52.5, 42.5]
      : [40, 30, 25];

  return shares.map((sharePct, index) => ({
    place: (index + 1) as 1 | 2 | 3,
    walletAddress: rankedBrewers[index].wallet_address,
    score: rankedBrewers[index].best_score,
    sharePct,
    amountSui: Number(((totalPoolSui * sharePct) / 100).toFixed(9)),
  }));
}

export function buybackBurnAmount(totalPoolSui: number) {
  return Number((totalPoolSui * 0.025).toFixed(9));
}

export function marketingAmount(totalPoolSui: number) {
  return Number((totalPoolSui * 0.025).toFixed(9));
}
