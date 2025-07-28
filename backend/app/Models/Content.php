<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Content Model for AutoBlogger Pro
 * Represents AI-generated content pieces
 */
class Content extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'topic',
        'content',
        'meta_description',
        'keywords',
        'seo_data',
        'status',
        'content_type',
        'tone',
        'target_audience',
        'word_count',
        'tokens_used',
        'generation_cost',
        'ai_model',
        'generation_options',
        'quality_analysis',
        'published_at',
    ];

    protected $casts = [
        'keywords' => 'array',
        'seo_data' => 'array',
        'generation_options' => 'array',
        'quality_analysis' => 'array',
        'published_at' => 'datetime',
        'generation_cost' => 'decimal:4',
    ];

    // Status constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    // Content type constants
    public const TYPE_BLOG_POST = 'blog_post';
    public const TYPE_ARTICLE = 'article';
    public const TYPE_CUSTOM = 'custom';

    // Tone constants
    public const TONE_PROFESSIONAL = 'professional';
    public const TONE_CASUAL = 'casual';
    public const TONE_FRIENDLY = 'friendly';
    public const TONE_FORMAL = 'formal';
    public const TONE_CONVERSATIONAL = 'conversational';

    /**
     * Get the user that owns the content
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($content) {
            if (empty($content->slug)) {
                $content->slug = Str::slug($content->title);

                // Ensure slug is unique
                $originalSlug = $content->slug;
                $counter = 1;

                while (static::where('slug', $content->slug)->exists()) {
                    $content->slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
            }
        });
    }

    /**
     * Scope for published content
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    /**
     * Scope for draft content
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Scope for specific content type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('content_type', $type);
    }

    /**
     * Get content by user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get word count
     */
    public function getWordCountAttribute($value): int
    {
        if ($value) {
            return $value;
        }

        // Calculate word count if not stored
        return str_word_count(strip_tags($this->content ?? ''));
    }

    /**
     * Get reading time estimate
     */
    public function getReadingTimeAttribute(): int
    {
        // Average reading speed: 200-250 words per minute
        return max(1, (int) ceil($this->word_count / 225));
    }

    /**
     * Get excerpt from content
     */
    public function getExcerptAttribute(): string
    {
        $content = strip_tags($this->content ?? '');
        return Str::limit($content, 160);
    }

    /**
     * Check if content is published
     */
    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }

    /**
     * Check if content is draft
     */
    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Publish the content
     */
    public function publish(): void
    {
        $this->update([
            'status' => self::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);
    }

    /**
     * Archive the content
     */
    public function archive(): void
    {
        $this->update([
            'status' => self::STATUS_ARCHIVED,
        ]);
    }

    /**
     * Get quality score from analysis
     */
    public function getQualityScoreAttribute(): ?int
    {
        if (!$this->quality_analysis || !isset($this->quality_analysis['score'])) {
            return null;
        }

        return (int) $this->quality_analysis['score'];
    }

    /**
     * Get available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PUBLISHED => 'Published',
            self::STATUS_ARCHIVED => 'Archived',
        ];
    }

    /**
     * Get available content types
     */
    public static function getContentTypes(): array
    {
        return [
            self::TYPE_BLOG_POST => 'Blog Post',
            self::TYPE_ARTICLE => 'Article',
            self::TYPE_CUSTOM => 'Custom',
        ];
    }

    /**
     * Get available tones
     */
    public static function getTones(): array
    {
        return [
            self::TONE_PROFESSIONAL => 'Professional',
            self::TONE_CASUAL => 'Casual',
            self::TONE_FRIENDLY => 'Friendly',
            self::TONE_FORMAL => 'Formal',
            self::TONE_CONVERSATIONAL => 'Conversational',
        ];
    }
}
