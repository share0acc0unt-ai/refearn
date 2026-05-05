import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import ChatSupport from "@/components/ChatSupport";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paypulse - Monetize Your Influence",
  description: "Earn commissions, complete tasks, and grow your earnings with Paypulse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body
        className={`${manrope.variable} antialiased font-display bg-background text-foreground`}
      >
        {children}
        <ChatSupport />
      </body>
    </html>
  );
}
