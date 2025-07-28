<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OpenAIService;
use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Content Generation Controller for AutoBlogger Pro
 * Handles AI-powered content generation operations
 */
class ContentController extends Controller
{
    private OpenAIService $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->middleware('auth:api');
        $this->openAIService = $openAIService;
    }

    /**
     * Generate new content from a topic
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'topic' => 'required|string|min:5|max:200',
            'title' => 'nullable|string|max:255',
            'content_type' => 'nullable|string|in:blog_post,article,custom',
            'tone' => 'nullable|string|in:professional,casual,friendly,formal,conversational',
            'target_audience' => 'nullable|string|max:100',
            'word_count' => 'nullable|integer|min:100|max:5000',
            'keywords' => 'nullable|array|max:10',
            'keywords.*' => 'string|max:50',
            'ai_model' => 'nullable|string',
            'temperature' => 'nullable|numeric|min:0|max:2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $data = $validator->validated();

            // Prepare generation options
            $options = [
                'content_type' => $data['content_type'] ?? 'blog_post',
                'tone' => $data['tone'] ?? 'professional',
                'target_audience' => $data['target_audience'] ?? 'general readers',
                'word_count' => $data['word_count'] ?? 1000,
                'keywords' => $data['keywords'] ?? [],
                'model' => $data['ai_model'] ?? 'gpt-4-turbo-preview',
                'temperature' => $data['temperature'] ?? 0.7,
            ];

            // Generate content using OpenAI
            $result = $this->openAIService->generateBlogPost($data['topic'], $options);

            if (!$result['success']) {
                return response()->json([
                    'message' => 'Content generation failed',
                    'error' => $result['error']
                ], 500);
            }

            // Extract title from generated content if not provided
            $title = $data['title'] ?? $this->extractTitleFromContent($result['content']);

            // Generate meta description
            $metaResult = $this->openAIService->generateMetaDescription($result['content']);
            $metaDescription = $metaResult['success'] ? $metaResult['meta_description'] : null;

            // Extract keywords if not provided
            $keywords = $data['keywords'] ?? [];
            if (empty($keywords)) {
                $keywordResult = $this->openAIService->extractKeywords($result['content']);
                $keywords = $keywordResult['success'] ? $keywordResult['keywords'] : [];
            }

            // Calculate cost
            $costEstimate = $this->openAIService->estimateCost($result['tokens_used'], $result['model']);

            // Save content to database
            $content = Content::create([
                'user_id' => $user->id,
                'title' => $title,
                'topic' => $data['topic'],
                'content' => $result['content'],
                'meta_description' => $metaDescription,
                'keywords' => $keywords,
                'content_type' => $options['content_type'],
                'tone' => $options['tone'],
                'target_audience' => $options['target_audience'],
                'word_count' => str_word_count(strip_tags($result['content'])),
                'tokens_used' => $result['tokens_used'],
                'generation_cost' => $costEstimate['total_cost'],
                'ai_model' => $result['model'],
                'generation_options' => $options,
                'status' => Content::STATUS_DRAFT,
            ]);

            Log::info('Content generated successfully', [
                'user_id' => $user->id,
                'content_id' => $content->id,
                'topic' => $data['topic'],
                'tokens_used' => $result['tokens_used'],
                'cost' => $costEstimate['total_cost']
            ]);

            return response()->json([
                'message' => 'Content generated successfully',
                'content' => $content->load('user'),
                'generation_stats' => [
                    'tokens_used' => $result['tokens_used'],
                    'model' => $result['model'],
                    'cost_estimate' => $costEstimate,
                    'word_count' => $content->word_count,
                    'reading_time' => $content->reading_time,
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Content generation failed', [
                'user_id' => Auth::id(),
                'topic' => $request->input('topic'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Content generation failed',
                'error' => 'An unexpected error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Generate bulk content from multiple topics
     */
    public function bulkGenerate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'topics' => 'required|array|min:1|max:10',
            'topics.*' => 'required|string|min:5|max:200',
            'content_type' => 'nullable|string|in:blog_post,article,custom',
            'tone' => 'nullable|string|in:professional,casual,friendly,formal,conversational',
            'target_audience' => 'nullable|string|max:100',
            'word_count' => 'nullable|integer|min:100|max:5000',
            'keywords' => 'nullable|array|max:10',
            'keywords.*' => 'string|max:50',
            'ai_model' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $data = $validator->validated();

            // Prepare generation options
            $options = [
                'content_type' => $data['content_type'] ?? 'blog_post',
                'tone' => $data['tone'] ?? 'professional',
                'target_audience' => $data['target_audience'] ?? 'general readers',
                'word_count' => $data['word_count'] ?? 1000,
                'keywords' => $data['keywords'] ?? [],
                'model' => $data['ai_model'] ?? 'gpt-4-turbo-preview',
            ];

            // Generate bulk content
            $bulkResult = $this->openAIService->generateBulkContent($data['topics'], $options);

            $createdContent = [];
            $totalCost = 0;

            DB::beginTransaction();

            foreach ($bulkResult['results'] as $result) {
                if ($result['result']['success']) {
                    $generationResult = $result['result'];

                    // Extract title from content
                    $title = $this->extractTitleFromContent($generationResult['content']);

                    // Generate meta description
                    $metaResult = $this->openAIService->generateMetaDescription($generationResult['content']);
                    $metaDescription = $metaResult['success'] ? $metaResult['meta_description'] : null;

                    // Calculate cost
                    $costEstimate = $this->openAIService->estimateCost($generationResult['tokens_used'], $generationResult['model']);
                    $totalCost += $costEstimate['total_cost'];

                    // Save content
                    $content = Content::create([
                        'user_id' => $user->id,
                        'title' => $title,
                        'topic' => $result['topic'],
                        'content' => $generationResult['content'],
                        'meta_description' => $metaDescription,
                        'keywords' => $data['keywords'] ?? [],
                        'content_type' => $options['content_type'],
                        'tone' => $options['tone'],
                        'target_audience' => $options['target_audience'],
                        'word_count' => str_word_count(strip_tags($generationResult['content'])),
                        'tokens_used' => $generationResult['tokens_used'],
                        'generation_cost' => $costEstimate['total_cost'],
                        'ai_model' => $generationResult['model'],
                        'generation_options' => $options,
                        'status' => Content::STATUS_DRAFT,
                    ]);

                    $createdContent[] = $content;
                }
            }

            DB::commit();

            Log::info('Bulk content generated successfully', [
                'user_id' => $user->id,
                'topics_count' => count($data['topics']),
                'successful_generations' => count($createdContent),
                'total_tokens_used' => $bulkResult['total_tokens_used'],
                'total_cost' => $totalCost
            ]);

            return response()->json([
                'message' => 'Bulk content generation completed',
                'content' => $createdContent,
                'generation_stats' => [
                    'total_topics' => $bulkResult['total_topics'],
                    'successful_generations' => count($createdContent),
                    'failed_generations' => $bulkResult['total_topics'] - count($createdContent),
                    'total_tokens_used' => $bulkResult['total_tokens_used'],
                    'total_cost' => $totalCost,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Bulk content generation failed', [
                'user_id' => Auth::id(),
                'topics_count' => count($request->input('topics', [])),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Bulk content generation failed',
                'error' => 'An unexpected error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Get user's content list
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Content::forUser($user->id)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('content_type')) {
            $query->ofType($request->input('content_type'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('topic', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = min($request->input('per_page', 15), 50);
        $content = $query->paginate($perPage);

        return response()->json([
            'content' => $content->items(),
            'pagination' => [
                'current_page' => $content->currentPage(),
                'last_page' => $content->lastPage(),
                'per_page' => $content->perPage(),
                'total' => $content->total(),
            ]
        ]);
    }

    /**
     * Get specific content
     */
    public function show(Content $content): JsonResponse
    {
        // Check authorization
        if ($content->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'content' => $content->load('user')
        ]);
    }

    /**
     * Update content
     */
    public function update(Request $request, Content $content): JsonResponse
    {
        // Check authorization
        if ($content->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'meta_description' => 'sometimes|string|max:160',
            'keywords' => 'sometimes|array|max:10',
            'keywords.*' => 'string|max:50',
            'status' => 'sometimes|string|in:draft,published,archived',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Update word count if content changed
        if (isset($data['content'])) {
            $data['word_count'] = str_word_count(strip_tags($data['content']));
        }

        // Set published_at if publishing
        if (isset($data['status']) && $data['status'] === Content::STATUS_PUBLISHED && $content->status !== Content::STATUS_PUBLISHED) {
            $data['published_at'] = now();
        }

        $content->update($data);

        return response()->json([
            'message' => 'Content updated successfully',
            'content' => $content->fresh()
        ]);
    }

    /**
     * Delete content
     */
    public function destroy(Content $content): JsonResponse
    {
        // Check authorization
        if ($content->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $content->delete();

        return response()->json([
            'message' => 'Content deleted successfully'
        ]);
    }

    /**
     * Analyze content quality
     */
    public function analyzeQuality(Content $content): JsonResponse
    {
        // Check authorization
        if ($content->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $analysis = $this->openAIService->analyzeContentQuality($content->content);

            if (!$analysis['success']) {
                return response()->json([
                    'message' => 'Content quality analysis failed',
                    'error' => $analysis['error']
                ], 500);
            }

            // Save analysis to content
            $content->update([
                'quality_analysis' => $analysis
            ]);

            return response()->json([
                'message' => 'Content quality analyzed successfully',
                'analysis' => $analysis
            ]);

        } catch (\Exception $e) {
            Log::error('Content quality analysis failed', [
                'content_id' => $content->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Content quality analysis failed',
                'error' => 'An unexpected error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Get available AI models
     */
    public function getModels(): JsonResponse
    {
        try {
            $models = $this->openAIService->getAvailableModels();

            return response()->json($models);

        } catch (\Exception $e) {
            Log::error('Failed to fetch AI models', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to fetch available models',
                'error' => 'An unexpected error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Get content generation statistics
     */
    public function getStats(): JsonResponse
    {
        $user = Auth::user();

        $stats = [
            'total_content' => Content::forUser($user->id)->count(),
            'published_content' => Content::forUser($user->id)->published()->count(),
            'draft_content' => Content::forUser($user->id)->draft()->count(),
            'total_words' => Content::forUser($user->id)->sum('word_count'),
            'total_tokens_used' => Content::forUser($user->id)->sum('tokens_used'),
            'total_cost' => Content::forUser($user->id)->sum('generation_cost'),
            'content_by_type' => Content::forUser($user->id)
                ->selectRaw('content_type, COUNT(*) as count')
                ->groupBy('content_type')
                ->pluck('count', 'content_type'),
            'content_by_month' => Content::forUser($user->id)
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('count', 'month'),
        ];

        return response()->json([
            'stats' => $stats
        ]);
    }

    /**
     * Extract title from generated content
     */
    private function extractTitleFromContent(string $content): string
    {
        // Look for the first heading (# Title) in markdown format
        if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
            return trim($matches[1]);
        }

        // Fallback: use first line or first 50 characters
        $lines = explode("\n", strip_tags($content));
        $firstLine = trim($lines[0] ?? '');

        if (strlen($firstLine) > 5 && strlen($firstLine) <= 100) {
            return $firstLine;
        }

        return substr(strip_tags($content), 0, 50) . '...';
    }
}
