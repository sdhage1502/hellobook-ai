import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hellobooks.ai'),
  title: {
    default: 'Default Title - HelloBooks.ai  - AI-Powered Bookkeeping Software',
    template: '%s | HelloBooks.ai',
  },
  description: 'Automate your accounting with AI. Invoicing, payments, reports – all smarter and faster.',
  keywords: ['AI bookkeeping', 'accounting software', 'financial automation', 'invoicing', 'AI reports'],
  authors: [{ name: 'HelloBooks Team' }],
  creator: 'HelloBooks.ai',
  publisher: 'HelloBooks.ai',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'HelloBooks.ai',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'HelloBooks.ai - AI Bookkeeping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hellobooksai',
    creator: '@hellobooksai',
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}