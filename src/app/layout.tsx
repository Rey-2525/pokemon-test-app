import type { Metadata } from "next";
import "./globals.css";
import PokemonSearch from "@/components/PokemonSearch";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pokédex (Next.js 15)",
  description: "PokéAPI sample with Next.js App Router",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-gray-50 text-gray-900">
        <PokemonSearch />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
