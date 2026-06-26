import type { Metadata } from 'next'
import './globals.css'
import ModalProvider from '@/providers/modal-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/providers/auth-provider'
import { Preloader } from '@/components/global/preloader'
import { checkGeoBlock } from '@/lib/geo'

export const metadata: Metadata = {
  title: 'LoftCommunity - Employment & Hiring Platform',
  description: 'Find your dream job or hire top talent. Skill-first matching for transparent, efficient hiring.',
  openGraph: {
    title: 'LoftCommunity - Employment & Hiring Platform',
    description: 'Find your dream job or hire top talent. Skill-first matching for transparent, efficient hiring.',
    images: [{
      url: '/images/OG%20Image.png',
      width: 1200,
      height: 630,
      alt: 'LoftCommunity',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/OG%20Image.png'],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await checkGeoBlock()

  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#0a0a0a' }}>
      <body className="font-sans" style={{ backgroundColor: '#0a0a0a' }}>
        <ModalProvider>
          <AuthProvider>
            <Preloader>
              {children}
            </Preloader>
            <Toaster />
          </AuthProvider>
        </ModalProvider>
      </body>
    </html>
  )
}
