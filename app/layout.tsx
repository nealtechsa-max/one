import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Motive 8 Creative | Studio Booking',
  description: 'Book your creative space at Motive 8 Creative. Professional studios for photography, video production, podcasting, and events.',
  keywords: 'studio rental, photography studio, video production, podcast studio, event space, creative studio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
