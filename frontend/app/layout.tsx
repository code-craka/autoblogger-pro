import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AutoBlogger Pro - AI-Powered Content Generation',
  description: 'Transform topics into SEO-optimized blog articles with AI technology',
  keywords: ['AI content generation', 'blog writing', 'SEO optimization', 'content marketing'],
  authors: [{ name: 'AutoBlogger Pro Team' }],
  creator: 'AutoBlogger Pro',
  publisher: 'AutoBlogger Pro',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'AutoBlogger Pro - AI-Powered Content Generation',
    description: 'Transform topics into SEO-optimized blog articles with AI technology',
    siteName: 'AutoBlogger Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoBlogger Pro - AI-Powered Content Generation',
    description: 'Transform topics into SEO-optimized blog articles with AI technology',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <div className="flex min-h-screen">
              <Navigation />
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
