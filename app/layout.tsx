import type { Metadata } from 'next'

import { Toaster } from 'sonner'
import { GlobalLoader } from '@/components/global-loader'
import { GoogleAuthProvider } from '@/components/google-auth-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'CaratHope - Finest Jewelry',
  description: 'Discover timeless jewelry pieces inspired by life. Rings, necklaces, bracelets, and earrings for every occasion.',
  generator: 'v0.app',
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300..700;1,300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <GlobalLoader />
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
