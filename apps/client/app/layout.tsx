import { ColorSchemeScript, Container, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';
import type { Metadata } from "next";
import { Yusei_Magic } from "next/font/google";
import "./globals.css";
import { Providers } from './provider';

const yuseiMagic = Yusei_Magic({
  variable: "--font-yusei-magic",
  subsets: ["latin"],
  weight: "400"
});


export const metadata: Metadata = {
  title: {
    default: "Automate - Website Automation Platform",
    template: "%s | Automate"
  },
  description: "Platform otomasi website profesional untuk meningkatkan produktivitas. Solusi lengkap untuk scraping, browser automation, dan workflow scheduling tanpa kode.",
  keywords: [
    "website automation",
    "browser automation",
    "web scraping",
    "no-code automation",
    "workflow automation",
    "task scheduler",
    "nextjs automation",
    "business efficiency"
  ],
  authors: [{ name: "Automate Team", url: "https://automate.com/about" }],
  creator: "Automate Team",
  publisher: "Automate Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://automate.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "id-ID": "/id",
    },
  },
  openGraph: {
    title: "Automate - The Ultimate Website Automation Tool",
    description: "Hemat waktu dengan mengotomatiskan tugas website berulang. Coba platform otomasi kami untuk scraping dan testing yang lebih cepat.",
    url: "https://automate.com",
    siteName: "Automate",
    images: [
      {
        url: "/og-image-main.jpg",
        width: 1200,
        height: 630,
        alt: "Automate Dashboard Interface",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automate - Website Automation Platform",
    description: "Hemat waktu dengan mengotomatiskan tugas website berulang. Solusi scraping dan testing modern.",
    creator: "@automate_id",
    images: ["/twitter-image-main.jpg"],
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
  verification: {
    google: "google-site-verification-code",
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${yuseiMagic.variable} antialiased`}>
        <Providers>
          <Container
            size="xs"
            px={0}
            style={{
              height: "100dvh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column"
            }}
            className='container_utm'
          >
            {children}
          </Container>
        </Providers>
      </body>
    </html>
  );
}