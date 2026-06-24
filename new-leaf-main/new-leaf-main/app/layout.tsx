import type { Metadata } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import "../src/index.css";
import { Providers } from "./providers";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "New Leaf: Community Support, One Step at a Time",
    template: "%s | New Leaf",
  },
  description:
    "Feeling overwhelmed? New Leaf listens to your situation and connects you with the right community support services. Personalized, free, and instant.",
  authors: [{ name: "New Leaf" }],
  keywords: ["community support", "crisis help", "food assistance", "housing help", "mental health resources", "financial assistance"],
  openGraph: {
    title: "New Leaf: You Don't Have to Face This Alone",
    description:
      "Tell us your situation and get a personalized plan with local support resources.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Leaf",
    description: "Community support, one step at a time.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${dmSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
