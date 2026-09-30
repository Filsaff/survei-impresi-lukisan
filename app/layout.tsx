import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Survei Impresi Lukisan Budaya', description: 'Penelitian akademis tentang impresi masyarakat terhadap lukisan budaya Indonesia.' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f8f8f7', userScalable: true }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return (
  <html lang="id" className="bg-background">
    <body className="antialiased">
      {children}
      {process.env.NODE_ENV === "production" && <Analytics />}
    </body>
  </html>
); }
