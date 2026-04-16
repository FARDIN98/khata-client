import type { Metadata } from "next";
import { Hind_Siliguri, Fraunces } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khata — your shop's customer ledger",
  description:
    "Khata is a loyalty-and-events platform for small shops. Keep a ledger of every customer relationship and reward loyalty with tier-gated events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hindSiliguri.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-khata-bg text-khata-text font-sans">
        {children}
      </body>
    </html>
  );
}
