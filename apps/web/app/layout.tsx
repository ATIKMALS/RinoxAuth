import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { CursorEffect } from "@/components/ui/cursor-effect";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "RinoxAuth - Modern Licensing & Authentication Platform",
    template: "%s | RinoxAuth"
  },
  description: "Production-ready license and authentication platform for SaaS apps, APIs, and desktop products. Manage users, keys, activity logs, analytics, and security from one modern dashboard.",
  keywords: [
    "authentication",
    "licensing",
    "SaaS",
    "API security",
    "user management",
    "license management",
    "auth platform",
    "software licensing"
  ],
  authors: [{ name: "RinoxAuth Team" }],
  creator: "RinoxAuth",
  publisher: "RinoxAuth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://discerning-kindness-production-8967.up.railway.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://discerning-kindness-production-8967.up.railway.app",
    siteName: "RinoxAuth",
    title: "RinoxAuth - Modern Licensing & Authentication Platform",
    description: "Production-ready license and authentication platform for SaaS apps, APIs, and desktop products.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RinoxAuth Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "RinoxAuth - Modern Licensing & Authentication Platform",
    description: "Production-ready license and authentication platform for SaaS apps, APIs, and desktop products.",
    images: ["/og-image.png"],
    creator: "@rinoxauth"
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
    }
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ============================================
// ✅ RootLayout - পরিপূর্ণ কাজ করবে!
// ============================================
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AuthSessionProvider>
          <CursorEffect />

          <a
            href="#main-content"
            className="skip-to-main"
          >
            Skip to main content
          </a>

          <main id="main-content" className="relative">
            {children}
          </main>
        </AuthSessionProvider>

        <Toaster 
          richColors 
          position="top-right" 
          expand={false}
          closeButton
          duration={4000}
          visibleToasts={3}
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              backdropFilter: 'blur(16px)',
            },
            className: 'glass-panel',
          }}
        />

        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('load', () => {
                  const pageLoadTime = performance.now();
                  if (pageLoadTime > 3000) {
                    console.warn('Page load time is high:', pageLoadTime + 'ms');
                  }
                });
                if (performance.getEntriesByType) {
                  const navEntries = performance.getEntriesByType('navigation');
                  if (navEntries.length > 0) {
                    console.log('Navigation Type:', navEntries[0].type);
                  }
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
