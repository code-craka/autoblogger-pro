import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  BarChart3,
  ArrowRight,
  PlusCircle,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Mock data - in a real app, this would come from an API
  const stats = {
    totalContent: 24,
    contentThisMonth: 8,
    totalWords: 48750,
    averageWords: 2031,
    totalCost: 12.45,
    costThisMonth: 4.20,
    averageQuality: 0.87,
  };

  const recentContent = [
    {
      id: 1,
      title: "The Future of Artificial Intelligence in Healthcare",
      status: "published",
      wordCount: 1850,
      createdAt: "2024-01-15",
      qualityScore: 0.92,
    },
    {
      id: 2,
      title: "10 Essential Digital Marketing Strategies for 2024",
      status: "draft", 
      wordCount: 2200,
      createdAt: "2024-01-14",
      qualityScore: 0.88,
    },
    {
      id: 3,
      title: "Sustainable Business Practices That Drive Growth",
      status: "published",
      wordCount: 1950,
      createdAt: "2024-01-13",
      qualityScore: 0.85,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your AI-powered content generation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.contentThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats.averageWords} per content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generation Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.costThisMonth.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.averageQuality * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Content quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/content?tab=create">
              <Button className="w-full justify-start" size="lg">
                <PlusCircle className="h-4 w-4 mr-2" />
                Generate New Content
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            
            <Link href="/content">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Manage Content Library
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest content generation activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContent.map((content) => (
                <div key={content.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none line-clamp-1">
                      {content.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{content.wordCount} words</span>
                      <span>•</span>
                      <span>{(content.qualityScore * 100).toFixed(0)}% quality</span>
                      <span>•</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                      {content.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Guide */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Sparkles className="h-5 w-5" />
            Welcome to AutoBlogger Pro
          </CardTitle>
          <CardDescription className="text-blue-700">
            Transform your ideas into high-quality, SEO-optimized content with the power of AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Smart Generation</h4>
                <p className="text-blue-700">
                  Our AI understands context and creates relevant, engaging content tailored to your audience.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">SEO Optimized</h4>
                <p className="text-blue-700">
                  Every piece of content is optimized for search engines with proper meta tags and keywords.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Time Saving</h4>
                <p className="text-blue-700">
                  Generate comprehensive articles in minutes, not hours. Focus on strategy, not writing.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Link href="/content?tab=create">
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Creating
              </Button>
            </Link>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
