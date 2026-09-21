"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ClientAppShell = dynamic(
  () => import("./client-app-shell"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function ClientBoundary({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientAppShell>{children}</ClientAppShell>;
}
