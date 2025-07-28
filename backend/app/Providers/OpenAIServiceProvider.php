<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use OpenAI\Laravel\Facades\OpenAI;

class OpenAIServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register OpenAI configuration
        $this->app->singleton('openai', function ($app) {
            return OpenAI::factory()
                ->withApiKey(config('openai.api_key'))
                ->withOrganization(config('openai.organization'))
                ->withHttpClient($app->make('Illuminate\Http\Client\Factory'))
                ->make();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish configuration if needed
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../../config/openai.php' => config_path('openai.php'),
            ], 'openai-config');
        }
    }
}
