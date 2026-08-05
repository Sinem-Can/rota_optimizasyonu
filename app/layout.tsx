import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'RotaPlan — Rota Optimizasyon Merkezi',
  description:
    'Filo ve teslimat operasyonları için kurumsal rota optimizasyon ve sevkiyat yönetim paneli.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="bg-background" suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        
        {/* Canlı Bildirimler (Sonner) Sadece bu eklendi, fazla fonksiyonlar silindi */}
        <Toaster richColors position="bottom-right" /> 
      </body>
    </html>
  )
}
