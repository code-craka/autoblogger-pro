/**
 * Content Generation API Client for AutoBlogger Pro
 * Handles all content generation and management API calls
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for content generation
export interface ContentGenerationRequest {
  topic: string;
  title?: string;
  content_type?: 'blog_post' | 'article' | 'custom';
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'conversational';
  target_audience?: string;
  word_count?: number;
  keywords?: string[];
  ai_model?: string;
  temperature?: number;
}

export interface BulkContentGenerationRequest {
  topics: string[];
  content_type?: 'blog_post' | 'article' | 'custom';
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'conversational';
  target_audience?: string;
  word_count?: number;
  keywords?: string[];
  ai_model?: string;
}

export interface Content {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  topic: string;
  content: string;
  meta_description?: string;
  keywords?: string[];
  seo_data?: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  content_type: 'blog_post' | 'article' | 'custom';
  tone: string;
  target_audience: string;
  word_count?: number;
  tokens_used?: number;
  generation_cost?: number;
  ai_model?: string;
  generation_options?: Record<string, any>;
  quality_analysis?: Record<string, any>;
  published_at?: string;
  created_at: string;
  updated_at: string;
  reading_time?: number;
  excerpt?: string;
  quality_score?: number;
}

export interface GenerationStats {
  tokens_used: number;
  model: string;
  cost_estimate: {
    total_cost: number;
    input_cost: number;
    output_cost: number;
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    currency: string;
  };
  word_count: number;
  reading_time: number;
}

export interface ContentResponse {
  message: string;
  content: Content;
  generation_stats: GenerationStats;
}

export interface BulkContentResponse {
  message: string;
  content: Content[];
  generation_stats: {
    total_topics: number;
    successful_generations: number;
    failed_generations: number;
    total_tokens_used: number;
    total_cost: number;
  };
}

export interface ContentListResponse {
  content: Content[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ContentStats {
  total_content: number;
  published_content: number;
  draft_content: number;
  total_words: number;
  total_tokens_used: number;
  total_cost: number;
  content_by_type: Record<string, number>;
  content_by_month: Record<string, number>;
}

export interface AIModel {
  id: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  success: boolean;
  models: AIModel[];
  count: number;
}

export interface QualityAnalysis {
  success: boolean;
  analysis: string;
  tokens_used: number;
  analyzed_at: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

class ContentApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 60000, // Longer timeout for content generation
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearStoredToken();
          window.location.href = '/auth/login';
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Generate new content from a topic
   */
  async generateContent(data: ContentGenerationRequest): Promise<ContentResponse> {
    const response: AxiosResponse<ContentResponse> = await this.api.post('/content/generate', data);
    return response.data;
  }

  /**
   * Generate bulk content from multiple topics
   */
  async generateBulkContent(data: BulkContentGenerationRequest): Promise<BulkContentResponse> {
    const response: AxiosResponse<BulkContentResponse> = await this.api.post('/content/bulk-generate', data);
    return response.data;
  }

  /**
   * Get user's content list with optional filters
   */
  async getContentList(params?: {
    status?: string;
    content_type?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ContentListResponse> {
    const response: AxiosResponse<ContentListResponse> = await this.api.get('/content', { params });
    return response.data;
  }

  /**
   * Get specific content by ID
   */
  async getContent(id: number): Promise<{ content: Content }> {
    const response: AxiosResponse<{ content: Content }> = await this.api.get(`/content/${id}`);
    return response.data;
  }

  /**
   * Update existing content
   */
  async updateContent(id: number, data: Partial<Content>): Promise<{ message: string; content: Content }> {
    const response: AxiosResponse<{ message: string; content: Content }> = await this.api.put(`/content/${id}`, data);
    return response.data;
  }

  /**
   * Delete content
   */
  async deleteContent(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/content/${id}`);
    return response.data;
  }

  /**
   * Analyze content quality
   */
  async analyzeContentQuality(id: number): Promise<{ message: string; analysis: QualityAnalysis }> {
    const response: AxiosResponse<{ message: string; analysis: QualityAnalysis }> = 
      await this.api.post(`/content/${id}/analyze-quality`);
    return response.data;
  }

  /**
   * Get available AI models
   */
  async getAvailableModels(): Promise<ModelsResponse> {
    const response: AxiosResponse<ModelsResponse> = await this.api.get('/content/models');
    return response.data;
  }

  /**
   * Get content generation statistics
   */
  async getContentStats(): Promise<{ stats: ContentStats }> {
    const response: AxiosResponse<{ stats: ContentStats }> = await this.api.get('/content/stats');
    return response.data;
  }

  /**
   * Publish content
   */
  async publishContent(id: number): Promise<{ message: string; content: Content }> {
    return this.updateContent(id, { status: 'published' });
  }

  /**
   * Unpublish content (set to draft)
   */
  async unpublishContent(id: number): Promise<{ message: string; content: Content }> {
    return this.updateContent(id, { status: 'draft' });
  }

  /**
   * Archive content
   */
  async archiveContent(id: number): Promise<{ message: string; content: Content }> {
    return this.updateContent(id, { status: 'archived' });
  }

  /**
   * Estimate generation cost
   */
  async estimateGenerationCost(topic: string, options?: Partial<ContentGenerationRequest>): Promise<{
    estimated_tokens: number;
    estimated_cost: number;
    model: string;
  }> {
    // This would be a helper endpoint to estimate costs before generation
    // For now, we'll calculate client-side based on topic length
    const estimatedTokens = Math.ceil(topic.length / 4) + (options?.word_count || 1000);
    const model = options?.ai_model || 'gpt-4-turbo-preview';
    
    // Rough cost estimation (should match backend pricing)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
    const inputTokens = Math.ceil(estimatedTokens * 0.3);
    const outputTokens = Math.ceil(estimatedTokens * 0.7);
    const estimatedCost = (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;

    return {
      estimated_tokens: estimatedTokens,
      estimated_cost: Math.round(estimatedCost * 10000) / 10000, // Round to 4 decimal places
      model,
    };
  }

  /**
   * Token management
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Format API errors
   */
  private formatError(error: any): ApiError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        error: error.response.data.error,
      };
    }

    if (error.request) {
      return {
        message: 'Network error. Please check your connection and try again.',
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
    };
  }
}

// Export singleton instance
export const contentApi = new ContentApiClient();
export default contentApi;
