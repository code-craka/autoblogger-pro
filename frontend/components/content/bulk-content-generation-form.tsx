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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react';
import { contentApi, type BulkContentGenerationRequest, type Content } from '@/lib/api/content';
import { useToast } from '@/hooks/use-toast';

// Validation schema
const bulkGenerationSchema = z.object({
  topics: z.array(z.string().min(5, 'Topic must be at least 5 characters')).min(1, 'At least one topic is required').max(10, 'Maximum 10 topics allowed'),
  content_type: z.enum(['blog_post', 'article', 'custom']).optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal', 'conversational']).optional(),
  target_audience: z.string().max(100).optional(),
  word_count: z.number().min(100).max(5000).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  ai_model: z.string().optional(),
});

type BulkGenerationFormData = z.infer<typeof bulkGenerationSchema>;

interface GenerationResult {
  topic: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  content?: Content;
  error?: string;
}

interface BulkContentGenerationFormProps {
  onSuccess?: (contents: Content[]) => void;
  onCancel?: () => void;
  className?: string;
}

export function BulkContentGenerationForm({ 
  onSuccess, 
  onCancel, 
  className = '' 
}: BulkContentGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string>('');
  const [topicInput, setTopicInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<BulkGenerationFormData>({
    resolver: zodResolver(bulkGenerationSchema),
    defaultValues: {
      topics: [],
      content_type: 'blog_post',
      tone: 'professional',
      target_audience: 'general readers',
      word_count: 1000,
      keywords: [],
      ai_model: 'gpt-4-turbo-preview',
    },
  });

  const watchedValues = form.watch();

  // Calculate estimated cost
  React.useEffect(() => {
    const calculateTotalCost = async () => {
      if (watchedValues.topics && watchedValues.topics.length > 0) {
        try {
          let totalCost = 0;
          for (const topic of watchedValues.topics) {
            const estimate = await contentApi.estimateGenerationCost(topic, watchedValues);
            totalCost += estimate.estimated_cost;
          }
          setEstimatedCost(totalCost);
        } catch (error) {
          setEstimatedCost(null);
        }
      }
    };

    const debounceTimer = setTimeout(calculateTotalCost, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedValues.topics, watchedValues.word_count, watchedValues.ai_model]);

  const addTopic = () => {
    const topic = topicInput.trim();
    if (topic && !form.getValues('topics').includes(topic)) {
      const currentTopics = form.getValues('topics');
      if (currentTopics.length < 10) {
        form.setValue('topics', [...currentTopics, topic]);
        setTopicInput('');
      } else {
        toast({
          title: 'Maximum Topics Reached',
          description: 'You can add up to 10 topics for bulk generation.',
          variant: 'destructive',
        });
      }
    }
  };

  const removeTopic = (topic: string) => {
    const currentTopics = form.getValues('topics');
    form.setValue('topics', currentTopics.filter(t => t !== topic));
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !form.getValues('keywords')?.includes(keyword)) {
      const currentKeywords = form.getValues('keywords') || [];
      if (currentKeywords.length < 20) {
        form.setValue('keywords', [...currentKeywords, keyword]);
        setKeywordInput('');
      }
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    form.setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  const onSubmit = async (data: BulkGenerationFormData) => {
    try {
      setIsGenerating(true);
      setProgress(0);
      
      // Initialize results
      const initialResults: GenerationResult[] = data.topics.map(topic => ({
        topic,
        status: 'pending',
      }));
      setResults(initialResults);

      const requestData: BulkContentGenerationRequest = {
        ...data,
        keywords: data.keywords?.filter(Boolean) || [],
      };

      // For demonstration, we'll simulate individual generation
      // In a real implementation, this would be handled by the backend
      const successfulContents: Content[] = [];
      
      for (let i = 0; i < data.topics.length; i++) {
        const topic = data.topics[i];
        setCurrentlyProcessing(topic);
        
        // Update status to generating
        setResults(prev => prev.map(result => 
          result.topic === topic 
            ? { ...result, status: 'generating' }
            : result
        ));

        try {
          // Generate individual content
          const response = await contentApi.generateContent({
            topic,
            content_type: data.content_type,
            tone: data.tone,
            target_audience: data.target_audience,
            word_count: data.word_count,
            keywords: data.keywords,
            ai_model: data.ai_model,
          });

          // Update result with success
          setResults(prev => prev.map(result => 
            result.topic === topic 
              ? { ...result, status: 'success', content: response.content }
              : result
          ));

          successfulContents.push(response.content);
        } catch (error: any) {
          // Update result with error
          setResults(prev => prev.map(result => 
            result.topic === topic 
              ? { ...result, status: 'error', error: error.message }
              : result
          ));
        }

        // Update progress
        setProgress(((i + 1) / data.topics.length) * 100);
      }

      setCurrentlyProcessing('');

      toast({
        title: 'Bulk Generation Complete',
        description: `Generated ${successfulContents.length} out of ${data.topics.length} topics successfully.`,
      });

      if (onSuccess && successfulContents.length > 0) {
        onSuccess(successfulContents);
      }

    } catch (error: any) {
      toast({
        title: 'Bulk Generation Failed',
        description: error.message || 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentlyProcessing('');
    }
  };

  const exportResults = () => {
    const successfulResults = results.filter(r => r.status === 'success' && r.content);
    const csvContent = successfulResults.map(result => ({
      topic: result.topic,
      title: result.content?.title || '',
      content: result.content?.content || '',
      word_count: result.content?.word_count || 0,
      status: result.content?.status || '',
    }));

    const csvString = [
      ['Topic', 'Title', 'Content', 'Word Count', 'Status'],
      ...csvContent.map(row => [
        row.topic,
        row.title,
        row.content.replace(/"/g, '""'), // Escape quotes
        row.word_count.toString(),
        row.status,
      ])
    ].map(row => `"${row.join('","')}"`).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-content-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`w-full max-w-5xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Bulk Content Generation
        </CardTitle>
        <CardDescription>
          Generate multiple pieces of content simultaneously with consistent settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Topics Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Content Topics *</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter a topic and press Add (e.g., 'The benefits of renewable energy')"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="flex-1 min-h-[60px]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    addTopic();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTopic}
                disabled={!topicInput.trim() || form.getValues('topics').length >= 10}
                className="self-start"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Topic
              </Button>
            </div>
            
            {/* Display Topics */}
            {form.getValues('topics').length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {form.getValues('topics').length} topic(s) added (max 10)
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.getValues('topics').map((topic, index) => (
                    <Badge key={index} variant="secondary" className="max-w-xs">
                      <span className="truncate">{topic}</span>
                      <button
                        type="button"
                        className="ml-1 text-xs hover:text-destructive"
                        onClick={() => removeTopic(topic)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {form.formState.errors.topics && (
              <p className="text-sm text-destructive">{form.formState.errors.topics.message}</p>
            )}
          </div>

          <Separator />

          {/* Content Settings */}
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
                placeholder="e.g., small business owners"
                {...form.register('target_audience')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="word_count" className="text-sm font-medium">
                Word Count per Topic
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
            <Label className="text-sm font-medium">Global Keywords (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a keyword for all topics"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addKeyword}
                disabled={!keywordInput.trim() || (form.getValues('keywords')?.length || 0) >= 20}
              >
                Add
              </Button>
            </div>
            
            {form.getValues('keywords') && form.getValues('keywords')!.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.getValues('keywords')!.map((keyword, index) => (
                  <Badge key={index} variant="outline">
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

          {/* Advanced Settings */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">AI Model</Label>
            <Select
              value={form.watch('ai_model')}
              onValueChange={(value) => form.setValue('ai_model', value)}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost Estimation */}
          {estimatedCost !== null && form.getValues('topics').length > 0 && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4 text-sm">
                  <span>Estimated total cost: <strong>${estimatedCost.toFixed(4)}</strong></span>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {form.getValues('topics').length} topics
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{Math.ceil(((form.watch('word_count') || 1000) * form.getValues('topics').length) / 225)} min read total
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generation Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              
              {currentlyProcessing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Currently generating: <strong>{currentlyProcessing}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generation Results</h3>
                {results.some(r => r.status === 'success') && (
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Results
                  </Button>
                )}
              </div>
              
              <div className="grid gap-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {result.status === 'pending' && (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {result.status === 'generating' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {result.status === 'error' && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.topic}</div>
                      {result.status === 'success' && result.content && (
                        <div className="text-sm text-muted-foreground">
                          {result.content.word_count} words • {result.content.title}
                        </div>
                      )}
                      {result.status === 'error' && result.error && (
                        <div className="text-sm text-red-600">{result.error}</div>
                      )}
                    </div>
                    
                    <Badge variant={
                      result.status === 'success' ? 'default' :
                      result.status === 'error' ? 'destructive' :
                      result.status === 'generating' ? 'outline' : 'secondary'
                    }>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
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
              disabled={isGenerating || form.getValues('topics').length === 0}
              className="min-w-[160px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate All Content
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
