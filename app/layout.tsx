import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUXE | 轻奢女装",
  description: "精致女装，轻奢生活",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-[#faf8f5] font-sans text-[#2d2a24] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
