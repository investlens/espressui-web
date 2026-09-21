"use client";

import { DAppKitProvider } from "@mysten/dapp-kit-react";
import type { ReactNode } from "react";

import { dAppKit } from "../lib/dapp-kit";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

export default function ClientAppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DAppKitProvider dAppKit={dAppKit}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </DAppKitProvider>
  );
}
