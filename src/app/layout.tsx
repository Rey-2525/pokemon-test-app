import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Pokédex (Next.js 15)",
  description: "PokéAPI sample with Next.js App Router",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-gray-50 text-gray-900">
        {/* ヘッダー */}
        <div className="bg-[#E53935] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-white text-xl">Pokédex</h1>
              <Search className="text-white w-6 h-6" />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
