import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Survei Impresi Lukisan Budaya Indonesia',
  description:
    'Penelitian mengenai impresi masyarakat terhadap lukisan bertema budaya Indonesia.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/icon.png'],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f8f8f7', userScalable: true }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return (
  <html lang="id" className="bg-background">
    <body className="antialiased">
      {children}
      {process.env.NODE_ENV === "production" && <Analytics />}
    </body>
  </html>
); }
