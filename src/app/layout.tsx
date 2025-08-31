import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/auth/auth-context"
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary"

import "./globals.css"

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
    default: "Treaty - Contract Analysis Platform",
    template: "%s | Treaty",
  },
  description: "AI-powered contract analysis and risk assessment platform",
  keywords: ["contracts", "legal", "AI", "analysis", "risk assessment"],
  authors: [{ name: "Treaty Team" }],
  creator: "Treaty",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://treaty.app",
    title: "Treaty - Contract Analysis Platform",
    description: "AI-powered contract analysis and risk assessment platform",
    siteName: "Treaty",
  },
  twitter: {
    card: "summary_large_image",
    title: "Treaty - Contract Analysis Platform",
    description: "AI-powered contract analysis and risk assessment platform",
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
          <AuthErrorBoundary>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </AuthErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
