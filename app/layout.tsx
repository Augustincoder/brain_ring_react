import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'

// Providers and UI components
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AppShell } from '@/components/layout/app-shell'

import './globals.css'

export const metadata: Metadata = {
  title: "Aqliy O'yinlar - Brain Ring",
  description: "Brain Ring",
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
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppShell>
            {children}
          </AppShell>
          {process.env.NODE_ENV === 'production' && <Analytics />}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}