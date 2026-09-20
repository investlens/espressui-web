import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "EspresSUI | Good Coffee. Greater Things.",
    template: "%s | EspresSUI",
  },
  description:
    "EspresSUI is brewing community, competition and utility on SUI. Brew. Build. Play. Repeat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}