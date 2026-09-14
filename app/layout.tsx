import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation, MobileNavigation } from "../components/Navigation";
import PWAProvider from "../components/PWAProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TOPIK 1 Vocabulary Learning",
  description: "Learn Korean TOPIK 1 vocabulary with interactive games and spaced repetition",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TOPIK Learn"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: "TOPIK 1 Learning",
    title: "Korean TOPIK 1 Vocabulary Learning",
    description: "Interactive Korean learning with flashcards and games"
  }
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <PWAProvider>
          {/* Nền gradient "game hoá" */}
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.25),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.18),transparent_55%)]" />
          <div className="min-h-screen bg-background">
            {/* Desktop Layout */}
            <div className="hidden md:flex">
              {/* Sidebar */}
              <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-border">
                    <h1 className="text-xl font-bold text-primary">
                      TOPIK 1 Vocab
                    </h1>
                  </div>
                  <div className="flex-1 px-3 py-4">
                    <Navigation />
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 ml-64">
                <div className="container mx-auto px-6 py-8">
                  {children}
                </div>
              </main>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              <main className="pb-20">
                <div className="container mx-auto px-4 py-6">
                  {children}
                </div>
              </main>
              <MobileNavigation />
            </div>
          </div>
        </PWAProvider>
      </body>
    </html>
  );
}
