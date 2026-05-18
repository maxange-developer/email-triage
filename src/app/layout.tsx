import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://email-triage.massimilianoangelone.com'),
  title: {
    default: 'Email Triage Tool — Gmail Copilot · by Massimiliano Angelone',
    template: '%s · Email Triage',
  },
  description: 'A Gmail copilot that classifies, prioritizes, and drafts replies across multiple inboxes — with localized analytics in three languages (IT, EN, ES).',
  keywords: ['Gmail', 'email triage', 'AI copilot', 'inbox automation', 'multi-account', 'i18n', 'Next.js'],
  authors: [{ name: 'Massimiliano Angelone', url: 'https://massimilianoangelone.com' }],
  creator: 'Massimiliano Angelone',
  publisher: 'Massimiliano Angelone',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: 'Email Triage Tool — Gmail Copilot',
    description: 'A Gmail copilot that classifies, prioritizes, and drafts replies across multiple inboxes — with localized analytics in three languages.',
    url: 'https://email-triage.massimilianoangelone.com',
    siteName: 'Email Triage Tool',
    images: [
      {
        url: '/og/email-triage-og.webp',
        width: 1200,
        height: 630,
        alt: 'Email Triage Tool — Gmail Copilot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Email Triage Tool — Gmail Copilot',
    description: 'A Gmail copilot that classifies, prioritizes, and drafts replies across multiple inboxes — with localized analytics in three languages.',
    images: ['/og/email-triage-og.webp'],
    creator: '@massiangelone',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#1F8BFF' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
