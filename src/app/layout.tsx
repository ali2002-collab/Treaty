import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Treaty — AI Contract Analyzer",
  description: "Turn complex contracts into clear decisions. Upload an agreement and get instant plain-English insights, risk flags, and negotiation tips.",
  openGraph: {
    title: "Treaty — AI Contract Analyzer",
    description: "Turn complex contracts into clear decisions. Upload an agreement and get instant plain-English insights, risk flags, and negotiation tips.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Treaty — AI Contract Analyzer",
    description: "Turn complex contracts into clear decisions. Upload an agreement and get instant plain-English insights, risk flags, and negotiation tips.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
