'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Download, 
  Copy, 
  Eye, 
  EyeOff, 
  Type, 
  FileText, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contentApi, type Content } from '@/lib/api/content';

interface ContentEditorProps {
  content: Content;
  onUpdate?: (content: Content) => void;
  onSave?: (content: Content) => void;
  className?: string;
  readOnly?: boolean;
}

export function ContentEditor({ 
  content: initialContent, 
  onUpdate, 
  onSave, 
  className = '',
  readOnly = false 
}: ContentEditorProps) {
  const [content, setContent] = useState<Content>(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Calculate word count and reading time
  useEffect(() => {
    const text = content.content || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 225)); // Average reading speed: 225 words per minute
  }, [content.content]);

  const handleContentChange = (field: keyof Content, value: any) => {
    const updatedContent = { ...content, [field]: value };
    setContent(updatedContent);
    setIsEditing(true);
    if (onUpdate) {
      onUpdate(updatedContent);
    }
  };

  const handleSave = async () => {
    if (!isEditing) return;

    try {
      setIsSaving(true);
      // Here you would typically call an API to save the content
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      
      if (onSave) {
        onSave(content);
      }

      toast({
        title: 'Content Saved',
        description: 'Your content has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content.content || '');
      toast({
        title: 'Content Copied',
        description: 'Content has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy content to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content.content || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${content.slug || 'content'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatContent = (text: string) => {
    // Simple markdown-like formatting for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  return (
    <Card className={`w-full max-w-6xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Content Editor
            </CardTitle>
            <CardDescription>
              Edit and refine your AI-generated content
            </CardDescription>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            
            {!readOnly && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isEditing || isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>

        {/* Content Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Type className="h-3 w-3" />
            {wordCount} words
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} min read
          </div>
          {content.quality_score && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Quality: {(content.quality_score * 100).toFixed(0)}%
            </div>
          )}
          <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
            {content.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Title Editor */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="title"
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            placeholder="Enter content title..."
            readOnly={readOnly}
            className="text-lg font-semibold"
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor="meta_description" className="text-sm font-medium">
            Meta Description
          </Label>
          <Textarea
            id="meta_description"
            value={content.meta_description || ''}
            onChange={(e) => handleContentChange('meta_description', e.target.value)}
            placeholder="Enter SEO meta description..."
            readOnly={readOnly}
            className="min-h-[60px]"
            maxLength={160}
          />
          <div className="text-xs text-muted-foreground text-right">
            {(content.meta_description || '').length}/160 characters
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Keywords</Label>
          <div className="flex flex-wrap gap-2">
            {content.keywords && content.keywords.length > 0 ? (
              content.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No keywords</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Content Editor/Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Content</Label>
            {content.quality_score && (
              <div className="flex items-center gap-2">
                {content.quality_score >= 0.8 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : content.quality_score >= 0.6 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm text-muted-foreground">
                  Quality Score: {(content.quality_score * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {showPreview ? (
            <Card className="p-6">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: `<p>${formatContent(content.content || '')}</p>`
                }}
              />
            </Card>
          ) : (
            <Textarea
              ref={contentRef}
              value={content.content || ''}
              onChange={(e) => handleContentChange('content', e.target.value)}
              placeholder="Enter your content here..."
              readOnly={readOnly}
              className="min-h-[400px] font-mono text-sm leading-relaxed"
            />
          )}
        </div>

        {/* Generation Info */}
        {content.ai_model && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>AI Model:</strong> {content.ai_model}
                </div>
                <div>
                  <strong>Cost:</strong> ${content.generation_cost?.toFixed(4) || '0.0000'}
                </div>
                <div>
                  <strong>Generated:</strong> {new Date(content.created_at!).toLocaleDateString()}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Edit Status Indicator */}
        {isEditing && !readOnly && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Don't forget to save your work!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
