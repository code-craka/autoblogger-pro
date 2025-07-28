<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OpenAI API Key and Organization
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI API Key and organization. This will be
    | used to authenticate with the OpenAI API. You can find your API key at
    | https://platform.openai.com/account/api-keys
    |
    */

    'api_key' => env('OPENAI_API_KEY', ''),
    'organization' => env('OPENAI_ORGANIZATION', null),

    /*
    |--------------------------------------------------------------------------
    | Default Model Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default model configuration for content
    | generation. These settings can be overridden per request.
    |
    */

    'default_model' => env('OPENAI_MODEL', 'gpt-4-turbo-preview'),
    'max_tokens' => env('OPENAI_MAX_TOKENS', 4000),
    'temperature' => env('OPENAI_TEMPERATURE', 0.7),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for OpenAI API calls to prevent exceeding
    | your rate limits and manage costs effectively.
    |
    */

    'rate_limit' => [
        'requests_per_minute' => env('OPENAI_REQUESTS_PER_MINUTE', 60),
        'tokens_per_minute' => env('OPENAI_TOKENS_PER_MINUTE', 90000),
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Generation Limits
    |--------------------------------------------------------------------------
    |
    | Set limits for content generation to control usage and costs.
    |
    */

    'limits' => [
        'max_content_generations_per_hour' => env('MAX_CONTENT_GENERATIONS_PER_HOUR', 50),
        'max_bulk_topics' => env('MAX_BULK_TOPICS', 10),
        'max_word_count' => env('MAX_WORD_COUNT', 5000),
        'min_word_count' => env('MIN_WORD_COUNT', 100),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cost Management
    |--------------------------------------------------------------------------
    |
    | Configure cost tracking and alerting for OpenAI usage.
    |
    */

    'cost_tracking' => [
        'enabled' => env('OPENAI_COST_TRACKING', true),
        'daily_limit' => env('OPENAI_DAILY_COST_LIMIT', 100.00),
        'monthly_limit' => env('OPENAI_MONTHLY_COST_LIMIT', 1000.00),
        'alert_threshold' => env('OPENAI_COST_ALERT_THRESHOLD', 0.8), // 80% of limit
    ],

    /*
    |--------------------------------------------------------------------------
    | Model Pricing (USD per 1K tokens)
    |--------------------------------------------------------------------------
    |
    | Current OpenAI pricing for different models. Update these values
    | when OpenAI changes their pricing.
    |
    */

    'pricing' => [
        'gpt-4-turbo-preview' => [
            'input' => 0.01,
            'output' => 0.03,
        ],
        'gpt-4' => [
            'input' => 0.03,
            'output' => 0.06,
        ],
        'gpt-3.5-turbo' => [
            'input' => 0.0015,
            'output' => 0.002,
        ],
        'gpt-3.5-turbo-16k' => [
            'input' => 0.003,
            'output' => 0.004,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Retry Configuration
    |--------------------------------------------------------------------------
    |
    | Configure retry behavior for failed API requests.
    |
    */

    'retry' => [
        'max_attempts' => env('OPENAI_MAX_RETRY_ATTEMPTS', 3),
        'delay_seconds' => env('OPENAI_RETRY_DELAY', 2),
        'backoff_multiplier' => env('OPENAI_BACKOFF_MULTIPLIER', 2),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configure caching for OpenAI responses to reduce API calls and costs.
    |
    */

    'cache' => [
        'enabled' => env('OPENAI_CACHE_ENABLED', true),
        'ttl' => env('OPENAI_CACHE_TTL', 3600), // 1 hour
        'key_prefix' => env('OPENAI_CACHE_PREFIX', 'openai'),
    ],
];
