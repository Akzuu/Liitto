import type { Metadata } from "next";
import localFont from "next/font/local";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Liitto",
  description: "Wedding invitation platform",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
};

export default RootLayout;
