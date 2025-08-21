import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";
import HeaderWrapper from "@/components/HeaderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "youreview - 한 해의 취향을 Top 10으로",
    template: "%s - youreview",
  },
  description:
    "영화 · 음악 · 책을 검색하고 순위를 정해 나만의 Top 10 리스트를 만들어보세요. 연말엔 카드로 공유할 수 있습니다.",
  keywords: [
    "Top 10",
    "영화",
    "음악",
    "책",
    "연말결산",
    "취향",
    "리스트",
    "공유",
    "리뷰",
  ],
  authors: [{ name: "youreview" }],
  creator: "youreview",
  publisher: "youreview",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://youreview.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "youreview - 한 해의 취향을 Top 10으로",
    description:
      "영화 · 음악 · 책을 검색하고 순위를 정해 나만의 Top 10 리스트를 만들어보세요.",
    siteName: "youreview",
  },
  twitter: {
    card: "summary_large_image",
    title: "youreview - 한 해의 취향을 Top 10으로",
    description:
      "영화 · 음악 · 책을 검색하고 순위를 정해 나만의 Top 10 리스트를 만들어보세요.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-foreground text-background hover:bg-foreground/90",
          card: "bg-card border border-border",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "bg-background border border-border text-foreground hover:bg-accent",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background border border-border text-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
    >
      <html lang="ko" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          <Providers>
            <HeaderWrapper />
            <main>{children}</main>
          </Providers>
        </body>
      </html>
      <Analytics />
    </ClerkProvider>
  );
}
