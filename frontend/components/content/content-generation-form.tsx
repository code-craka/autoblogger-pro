'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Sparkles, Loader2, DollarSign, Clock, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { contentApi, type ContentGenerationRequest, type Content } from '@/lib/api/content';
import { useToast } from '@/hooks/use-toast';

// Validation schema
const contentGenerationSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters').max(200, 'Topic must be less than 200 characters'),
  title: z.string().optional(),
  content_type: z.enum(['blog_post', 'article', 'custom']).optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal', 'conversational']).optional(),
  target_audience: z.string().max(100, 'Target audience must be less than 100 characters').optional(),
  word_count: z.number().min(100).max(5000).optional(),
  keywords: z.array(z.string().max(50)).max(10, 'Maximum 10 keywords allowed').optional(),
  ai_model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

type ContentGenerationFormData = z.infer<typeof contentGenerationSchema>;

interface ContentGenerationFormProps {
  onSuccess?: (content: Content) => void;
  onCancel?: () => void;
  className?: string;
}

export function ContentGenerationForm({ onSuccess, onCancel, className = '' }: ContentGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ContentGenerationFormData>({
    resolver: zodResolver(contentGenerationSchema),
    defaultValues: {
      content_type: 'blog_post',
      tone: 'professional',
      target_audience: 'general readers',
      word_count: 1000,
      keywords: [],
      ai_model: 'gpt-4-turbo-preview',
      temperature: 0.7,
    },
  });

  const watchedValues = form.watch();

  // Calculate estimated cost when topic or options change
  React.useEffect(() => {
    const calculateCost = async () => {
      if (watchedValues.topic && watchedValues.topic.length > 5) {
        try {
          const estimate = await contentApi.estimateGenerationCost(watchedValues.topic, watchedValues);
          setEstimatedCost(estimate.estimated_cost);
        } catch (error) {
          // Silently fail for cost estimation
          setEstimatedCost(null);
        }
      }
    };

    const debounceTimer = setTimeout(calculateCost, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedValues.topic, watchedValues.word_count, watchedValues.ai_model]);

  const onSubmit = async (data: ContentGenerationFormData) => {
    try {
      setIsGenerating(true);

      const requestData: ContentGenerationRequest = {
        ...data,
        keywords: data.keywords?.filter(Boolean) || [],
      };

      const response = await contentApi.generateContent(requestData);

      toast({
        title: 'Content Generated Successfully!',
        description: `Generated ${response.generation_stats.word_count} words using ${response.generation_stats.tokens_used} tokens.`,
      });

      if (onSuccess) {
        onSuccess(response.content);
      }

      // Reset form
      form.reset();
      setKeywordInput('');

    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !form.getValues('keywords')?.includes(keyword)) {
      const currentKeywords = form.getValues('keywords') || [];
      if (currentKeywords.length < 10) {
        form.setValue('keywords', [...currentKeywords, keyword]);
        setKeywordInput('');
      } else {
        toast({
          title: 'Maximum Keywords Reached',
          description: 'You can add up to 10 keywords only.',
          variant: 'destructive',
        });
      }
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    form.setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Generate AI Content
        </CardTitle>
        <CardDescription>
          Create high-quality, SEO-optimized content using advanced AI technology
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium">
              Content Topic *
            </Label>
            <Textarea
              id="topic"
              placeholder="Enter your content topic (e.g., 'The future of artificial intelligence in healthcare')"
              className="min-h-[100px]"
              {...form.register('topic')}
            />
            {form.formState.errors.topic && (
              <p className="text-sm text-destructive">{form.formState.errors.topic.message}</p>
            )}
          </div>

          {/* Title Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Custom Title (Optional)
            </Label>
            <Input
              id="title"
              placeholder="Leave empty to auto-generate title"
              {...form.register('title')}
            />
          </div>

          <Separator />

          {/* Content Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Content Type</Label>
              <Select
                value={form.watch('content_type')}
                onValueChange={(value) => form.setValue('content_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tone</Label>
              <Select
                value={form.watch('tone')}
                onValueChange={(value) => form.setValue('tone', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience" className="text-sm font-medium">
                Target Audience
              </Label>
              <Input
                id="target_audience"
                placeholder="e.g., marketing professionals, small business owners"
                {...form.register('target_audience')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="word_count" className="text-sm font-medium">
                Word Count
              </Label>
              <Input
                id="word_count"
                type="number"
                min={100}
                max={5000}
                {...form.register('word_count', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Keywords Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">SEO Keywords (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a keyword and press Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordInputKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addKeyword}
                disabled={!keywordInput.trim() || (form.getValues('keywords')?.length || 0) >= 10}
              >
                Add
              </Button>
            </div>
            
            {/* Display Keywords */}
            {form.getValues('keywords') && form.getValues('keywords')!.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.getValues('keywords')!.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {keyword}
                    <button
                      type="button"
                      className="ml-1 text-xs hover:text-destructive"
                      onClick={() => removeKeyword(keyword)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">AI Model</Label>
              <Select
                value={form.watch('ai_model')}
                onValueChange={(value) => form.setValue('ai_model', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-sm font-medium">
                Creativity Level
              </Label>
              <Select
                value={form.watch('temperature')?.toString()}
                onValueChange={(value) => form.setValue('temperature', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.3">Conservative (0.3)</SelectItem>
                  <SelectItem value="0.7">Balanced (0.7)</SelectItem>
                  <SelectItem value="1.0">Creative (1.0)</SelectItem>
                  <SelectItem value="1.5">Very Creative (1.5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cost Estimation */}
          {estimatedCost !== null && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4 text-sm">
                  <span>Estimated cost: <strong>${estimatedCost.toFixed(4)}</strong></span>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    ~{form.watch('word_count')} words
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{Math.ceil((form.watch('word_count') || 1000) / 225)} min read
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isGenerating || !form.formState.isValid}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
