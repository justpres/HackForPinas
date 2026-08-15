import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "@/components/ChatProvider";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Suspense } from "react";
import { LoadingBar } from "@/components/LoadingBar";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  });

export const metadata: Metadata = {
  metadataBase: new URL('https://hackforpinas.vercel.app'),
  title: {
    default: "HackForPinas | Philippine Hackathon Directory",
    template: "%s | HackForPinas",
  },
  description:
    "A free, public directory aggregating Philippine hackathon and tech competition events from government agencies, universities, and private organizers.",
  authors: [{ name: "justpres", url: "https://github.com/JustPres" }],
  creator: "justpres",
  publisher: "justpres",
  keywords: [
    "hackathon",
    "Philippines",
    "tech competition",
    "coding",
    "government hackathon",
    "university hackathon",
    "startup",
  ],
  icons: {
    icon: "/hackforpinastabico.ico",
    shortcut: "/hackforpinastabico.ico",
    apple: "/hackforpinastabico.ico",
  },
  openGraph: {
    title: "HackForPinas | Philippine Hackathon Directory",
    description:
      "Discover and join Philippine hackathons and tech competitions. Browse events from DICT, DOST, universities, and private organizers.",
    type: "website",
    locale: "en_PH",
    siteName: "HackForPinas",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "HackForPinas — Philippine Hackathon Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HackForPinas | Philippine Hackathon Directory",
    description:
      "Discover and join Philippine hackathons and tech competitions. Browse events from DICT, DOST, universities, and private organizers.",
    images: ["/og-banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://hackforpinas.vercel.app/#website',
        'url': 'https://hackforpinas.vercel.app',
        'name': 'HackForPinas',
        'description': 'A free, public directory aggregating Philippine hackathon and tech competition events.',
        'publisher': {
          '@id': 'https://hackforpinas.vercel.app/#organization'
        },
        'inLanguage': 'en-PH'
      },
      {
        '@type': 'Organization',
        '@id': 'https://hackforpinas.vercel.app/#organization',
        'name': 'HackForPinas',
        'url': 'https://hackforpinas.vercel.app',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://hackforpinas.vercel.app/hackforpinastabico.ico'
        },
        'description': 'A community-driven open source project indexing technology hackathons across the Philippines.'
      }
    ]
  };

  return (
    <html lang="en" className={cn("dark", inter.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <LoadingBar />
        </Suspense>
        <ChatProvider>
          {children}
          <ChatSidebar />
        </ChatProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

