import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to{' '}
            <span className="text-blue-600 dark:text-blue-400">AutoBlogger Pro</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform topics into SEO-optimized blog articles with AI technology.
            Compete with AutoBlogging.ai with our powerful content generation platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link href="/auth/register">
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                AI-Powered Generation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Transform any topic into high-quality, SEO-optimized blog content using advanced AI technology.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Bulk Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Process thousands of topics at once with our powerful bulk generation system.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Enterprise Ready
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Scalable solutions with advanced subscription management and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
