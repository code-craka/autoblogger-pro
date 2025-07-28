'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentGenerationForm } from '@/components/content/content-generation-form';
import { ContentEditor } from '@/components/content/content-editor';
import { ContentDashboard } from '@/components/content/content-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  BarChart3, 
  Settings,
  Info
} from 'lucide-react';
import { type Content } from '@/lib/api/content';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'dashboard' | 'create' | 'edit' | 'view';

export default function ContentManagementPage() {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const { toast } = useToast();

  const handleCreateNew = () => {
    setSelectedContent(null);
    setActiveView('create');
  };

  const handleEditContent = (content: Content) => {
    setSelectedContent(content);
    setActiveView('edit');
  };

  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setActiveView('view');
  };

  const handleBackToDashboard = () => {
    setSelectedContent(null);
    setActiveView('dashboard');
  };

  const handleContentGenerated = (content: Content) => {
    setSelectedContent(content);
    setActiveView('edit');
  };

  const handleContentSaved = (content: Content) => {
    toast({
      title: 'Content Updated',
      description: 'Your content has been saved successfully.',
    });
    // Optionally update the content in state or refetch data
  };

  const renderHeader = () => {
    switch (activeView) {
      case 'create':
        return (
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Content</h1>
              <p className="text-muted-foreground">Generate AI-powered content for your blog or website</p>
            </div>
          </div>
        );
      case 'edit':
        return (
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Content</h1>
              <p className="text-muted-foreground">
                {selectedContent?.title || 'Refine and polish your content'}
              </p>
            </div>
          </div>
        );
      case 'view':
        return (
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">View Content</h1>
              <p className="text-muted-foreground">
                {selectedContent?.title || 'Preview your content'}
              </p>
            </div>
          </div>
        );
      default:
        return null; // Dashboard renders its own header
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {renderHeader()}

        {/* Content Views */}
        <div className="mt-8">
          {activeView === 'dashboard' && (
            <ContentDashboard
              onCreateNew={handleCreateNew}
              onEditContent={handleEditContent}
              onViewContent={handleViewContent}
            />
          )}

          {activeView === 'create' && (
            <div className="space-y-6">
              {/* Getting Started Guide */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Info className="h-5 w-5" />
                    Getting Started with AI Content Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 text-blue-600" />
                      <div>
                        <strong>1. Enter Your Topic</strong>
                        <p>Provide a clear, descriptive topic for your content. The more specific, the better the results.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Settings className="h-4 w-4 mt-0.5 text-blue-600" />
                      <div>
                        <strong>2. Customize Settings</strong>
                        <p>Adjust tone, word count, and target audience to match your needs.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
                      <div>
                        <strong>3. Generate & Edit</strong>
                        <p>Review the generated content and make any necessary adjustments.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ContentGenerationForm
                onSuccess={handleContentGenerated}
                onCancel={handleBackToDashboard}
              />
            </div>
          )}

          {activeView === 'edit' && selectedContent && (
            <ContentEditor
              content={selectedContent}
              onSave={handleContentSaved}
              readOnly={false}
            />
          )}

          {activeView === 'view' && selectedContent && (
            <ContentEditor
              content={selectedContent}
              readOnly={true}
            />
          )}
        </div>

        {/* Footer Info */}
        {activeView === 'dashboard' && (
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AutoBlogger Pro
                </CardTitle>
                <CardDescription>
                  Powered by advanced AI technology to help you create high-quality, 
                  SEO-optimized content in minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Multiple Content Types
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Quality Analysis
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Customizable Settings
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
