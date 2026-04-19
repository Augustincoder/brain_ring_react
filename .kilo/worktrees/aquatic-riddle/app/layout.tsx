import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'

// Providers and UI components
import { SocketProvider } from '@/components/providers/socket-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AppShell } from '@/components/layout/app-shell'

import './globals.css'

// Fontlarni Tailwind tushunadigan o'zgaruvchilar bilan sozlash
const geistMono = GeistMono({
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Aqliy O'yinlar - Brain Ring",
  description: "Brain Ring — yakka mashq, 1v1 va do'stlar bilan premium bilim bellashuvi",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SocketProvider>
            <AppShell>
              {children}
            </AppShell>
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </SocketProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
