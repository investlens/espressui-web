"use client";

import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";

export default function SuiWallet() {
  const account = useCurrentAccount();

  return (
    <div className="espressui-wallet">
      <ConnectButton>
        <span>
          {account ? "Wallet Connected" : "Connect Wallet"}
        </span>
      </ConnectButton>
    </div>
  );
}
