'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  FileText, 
  TrendingUp, 
  Clock, 
  Eye, 
  Edit3, 
  Trash2,
  Filter,
  Download,
  MoreHorizontal,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contentApi, type Content, type ContentListResponse } from '@/lib/api/content';

interface ContentDashboardProps {
  onCreateNew?: () => void;
  onEditContent?: (content: Content) => void;
  onViewContent?: (content: Content) => void;
  className?: string;
}

export function ContentDashboard({ 
  onCreateNew, 
  onEditContent, 
  onViewContent, 
  className = '' 
}: ContentDashboardProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // Load content list
  const loadContents = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        per_page: 12,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        content_type: typeFilter !== 'all' ? typeFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const response = await contentApi.getContentList(params);
      setContents(response.content);
      setCurrentPage(response.pagination.current_page);
      setTotalPages(response.pagination.last_page);
    } catch (error: any) {
      toast({
        title: 'Failed to Load Content',
        description: error.message || 'Unable to load content list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load dashboard stats
  const loadStats = async () => {
    try {
      const statsResponse = await contentApi.getContentStats();
      setStats(statsResponse.stats);
    } catch (error) {
      // Silently fail for stats
    }
  };

  useEffect(() => {
    loadContents();
    loadStats();
  }, [currentPage, searchQuery, statusFilter, typeFilter, sortBy, sortOrder]);

  const handleDelete = async (content: Content) => {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) {
      return;
    }

    try {
      await contentApi.deleteContent(content.id);
      await loadContents();
      toast({
        title: 'Content Deleted',
        description: 'The content has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete content.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your AI-generated content and track performance
          </p>
        </div>
        
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_content}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.content_this_month || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_words?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Math.round(stats.average_words || 0)} per content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generation Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.total_cost || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                This month: ${(stats.cost_this_month || 0).toFixed(2)}
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
                {((stats.average_quality || 0) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Content quality score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="word_count-desc">Most Words</SelectItem>
                  <SelectItem value="quality_score-desc">Best Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No content found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first piece of content.'}
              </p>
              {onCreateNew && (
                <Button onClick={onCreateNew} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Content
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content) => (
                <Card key={content.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {content.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(content.status)}>
                            {content.status}
                          </Badge>
                          {content.content_type && (
                            <Badge variant="outline" className="text-xs">
                              {content.content_type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {content.meta_description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {truncateText(content.meta_description, 120)}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>{content.word_count || 0} words</span>
                          {content.quality_score && (
                            <span>
                              {(content.quality_score * 100).toFixed(0)}% quality
                            </span>
                          )}
                        </div>
                        <span>{formatDate(content.created_at!)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewContent?.(content)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditContent?.(content)}
                          className="h-8 px-2"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(content)}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
