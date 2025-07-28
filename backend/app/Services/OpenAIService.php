<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * OpenAI Service for AutoBlogger Pro
 * Handles all AI content generation operations
 */
class OpenAIService
{
    private const DEFAULT_MODEL = 'gpt-4-turbo-preview';
    private const MAX_TOKENS = 4000;
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Generate blog content from a topic
     */
    public function generateBlogPost(string $topic, array $options = []): array
    {
        try {
            $prompt = $this->buildBlogPrompt($topic, $options);

            $response = OpenAI::chat()->create([
                'model' => $options['model'] ?? self::DEFAULT_MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert content writer and SEO specialist. Create high-quality, engaging, and SEO-optimized blog posts.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => $options['max_tokens'] ?? self::MAX_TOKENS,
                'temperature' => $options['temperature'] ?? 0.7,
                'top_p' => 1,
                'frequency_penalty' => 0.1,
                'presence_penalty' => 0.1,
            ]);

            $content = $response->choices[0]->message->content;

            return [
                'success' => true,
                'content' => $content,
                'tokens_used' => $response->usage->totalTokens,
                'model' => $response->model,
                'topic' => $topic,
                'generated_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('OpenAI content generation failed', [
                'topic' => $topic,
                'error' => $e->getMessage(),
                'options' => $options
            ]);

            return [
                'success' => false,
                'error' => 'Content generation failed: ' . $e->getMessage(),
                'topic' => $topic
            ];
        }
    }

    /**
     * Generate multiple blog posts in bulk
     */
    public function generateBulkContent(array $topics, array $options = []): array
    {
        $results = [];
        $totalTokens = 0;

        foreach ($topics as $index => $topic) {
            $result = $this->generateBlogPost($topic, $options);

            if ($result['success']) {
                $totalTokens += $result['tokens_used'];
            }

            $results[] = [
                'index' => $index,
                'topic' => $topic,
                'result' => $result
            ];

            // Add delay to avoid rate limiting
            if ($index < count($topics) - 1) {
                usleep(500000); // 0.5 second delay
            }
        }

        return [
            'success' => true,
            'results' => $results,
            'total_topics' => count($topics),
            'successful_generations' => count(array_filter($results, fn($r) => $r['result']['success'])),
            'total_tokens_used' => $totalTokens,
            'generated_at' => now()->toISOString()
        ];
    }

    /**
     * Generate SEO-optimized meta description
     */
    public function generateMetaDescription(string $content, int $maxLength = 155): array
    {
        try {
            $prompt = "Create an SEO-optimized meta description (max {$maxLength} characters) for the following content:\n\n{$content}";

            $response = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an SEO expert. Create compelling meta descriptions that include relevant keywords and encourage clicks.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 200,
                'temperature' => 0.7,
            ]);

            $metaDescription = trim($response->choices[0]->message->content);

            return [
                'success' => true,
                'meta_description' => $metaDescription,
                'length' => strlen($metaDescription),
                'tokens_used' => $response->usage->totalTokens
            ];

        } catch (\Exception $e) {
            Log::error('Meta description generation failed', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Meta description generation failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Extract keywords from content
     */
    public function extractKeywords(string $content, int $count = 10): array
    {
        try {
            $prompt = "Extract the {$count} most important SEO keywords/phrases from this content. Return them as a comma-separated list:\n\n{$content}";

            $response = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 200,
                'temperature' => 0.3,
            ]);

            $keywordsString = trim($response->choices[0]->message->content);
            $keywords = array_map('trim', explode(',', $keywordsString));

            return [
                'success' => true,
                'keywords' => $keywords,
                'count' => count($keywords),
                'tokens_used' => $response->usage->totalTokens
            ];

        } catch (\Exception $e) {
            Log::error('Keyword extraction failed', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Keyword extraction failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check content quality and provide suggestions
     */
    public function analyzeContentQuality(string $content): array
    {
        try {
            $prompt = "Analyze this blog post content and provide a quality score (1-10) and specific improvement suggestions:\n\n{$content}";

            $response = OpenAI::chat()->create([
                'model' => 'gpt-4-turbo-preview',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a content quality expert. Analyze content for readability, SEO, engagement, and structure. Provide actionable feedback.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 800,
                'temperature' => 0.3,
            ]);

            $analysis = $response->choices[0]->message->content;

            return [
                'success' => true,
                'analysis' => $analysis,
                'tokens_used' => $response->usage->totalTokens,
                'analyzed_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Content quality analysis failed', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Content quality analysis failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Build optimized prompt for blog content generation
     */
    private function buildBlogPrompt(string $topic, array $options): string
    {
        $wordCount = $options['word_count'] ?? 1000;
        $tone = $options['tone'] ?? 'professional';
        $targetAudience = $options['target_audience'] ?? 'general readers';
        $includeKeywords = $options['keywords'] ?? [];
        $contentType = $options['content_type'] ?? 'blog post';

        $prompt = "Create a comprehensive {$contentType} about '{$topic}' with the following specifications:\n\n";
        $prompt .= "- Word count: approximately {$wordCount} words\n";
        $prompt .= "- Tone: {$tone}\n";
        $prompt .= "- Target audience: {$targetAudience}\n";

        if (!empty($includeKeywords)) {
            $prompt .= "- Include these keywords naturally: " . implode(', ', $includeKeywords) . "\n";
        }

        $prompt .= "\nRequirements:\n";
        $prompt .= "1. Create an engaging, SEO-optimized title\n";
        $prompt .= "2. Include a compelling introduction\n";
        $prompt .= "3. Use clear headings and subheadings (H2, H3)\n";
        $prompt .= "4. Provide valuable, actionable information\n";
        $prompt .= "5. Include a strong conclusion with call-to-action\n";
        $prompt .= "6. Ensure proper keyword density and semantic SEO\n";
        $prompt .= "7. Make it readable and engaging\n";
        $prompt .= "8. Format with proper markdown for web publishing\n\n";
        $prompt .= "Please generate the complete content now.";

        return $prompt;
    }

    /**
     * Get available OpenAI models
     */
    public function getAvailableModels(): array
    {
        try {
            $cacheKey = 'openai_models';

            return Cache::remember($cacheKey, self::CACHE_TTL, function () {
                $response = OpenAI::models()->list();

                $models = collect($response->data)
                    ->filter(fn($model) => str_contains($model->id, 'gpt'))
                    ->map(fn($model) => [
                        'id' => $model->id,
                        'created' => $model->created,
                        'owned_by' => $model->ownedBy
                    ])
                    ->values()
                    ->toArray();

                return [
                    'success' => true,
                    'models' => $models,
                    'count' => count($models)
                ];
            });

        } catch (\Exception $e) {
            Log::error('Failed to fetch OpenAI models', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to fetch available models: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Estimate token usage for a given text
     */
    public function estimateTokens(string $text): int
    {
        // Rough estimation: 1 token ≈ 4 characters for English text
        return (int) ceil(strlen($text) / 4);
    }

    /**
     * Calculate cost estimation for content generation
     */
    public function estimateCost(int $tokens, string $model = self::DEFAULT_MODEL): array
    {
        // OpenAI pricing (as of 2024) - should be configurable
        $pricing = [
            'gpt-4-turbo-preview' => ['input' => 0.01, 'output' => 0.03], // per 1K tokens
            'gpt-4' => ['input' => 0.03, 'output' => 0.06],
            'gpt-3.5-turbo' => ['input' => 0.0015, 'output' => 0.002],
        ];

        $modelPricing = $pricing[$model] ?? $pricing['gpt-4-turbo-preview'];

        // Estimate input/output split (roughly 30% input, 70% output for content generation)
        $inputTokens = (int) ($tokens * 0.3);
        $outputTokens = (int) ($tokens * 0.7);

        $inputCost = ($inputTokens / 1000) * $modelPricing['input'];
        $outputCost = ($outputTokens / 1000) * $modelPricing['output'];
        $totalCost = $inputCost + $outputCost;

        return [
            'model' => $model,
            'total_tokens' => $tokens,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'input_cost' => round($inputCost, 4),
            'output_cost' => round($outputCost, 4),
            'total_cost' => round($totalCost, 4),
            'currency' => 'USD'
        ];
    }
}
