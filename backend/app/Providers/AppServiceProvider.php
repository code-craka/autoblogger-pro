<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure Passport
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));

        // Configure rate limiters
        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip())
                        ->response(function (Request $request, array $headers) {
                            return response()->json([
                                'message' => 'Too many requests. Please try again later.',
                                'retry_after' => $headers['Retry-After'] ?? 60
                            ], 429, $headers);
                        });
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip())
                        ->response(function (Request $request, array $headers) {
                            return response()->json([
                                'message' => 'Too many authentication attempts. Please try again later.',
                                'retry_after' => $headers['Retry-After'] ?? 60
                            ], 429, $headers);
                        });
        });
    }
}
