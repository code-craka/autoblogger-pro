<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear all caches and rate limiters before each test
        Cache::flush();
        RateLimiter::clear('api');
        RateLimiter::clear('auth');

        // Clear IP-based rate limiting
        $ip = request()->ip() ?? '127.0.0.1';
        RateLimiter::clear('login.' . $ip);
        RateLimiter::clear('api.' . $ip);

        // Set up Passport keys for testing (only once)
        $this->setUpPassport();
    }

    protected function tearDown(): void
    {
        // Clean up after each test
        Cache::flush();
        RateLimiter::clear('api');
        RateLimiter::clear('auth');

        parent::tearDown();
    }

    /**
     * Set up Passport keys for testing
     */
    protected function setUpPassport(): void
    {
        // Check if we're in testing environment and keys don't exist
        if (app()->environment('testing')) {
            $privateKeyPath = storage_path('oauth-private.key');
            $publicKeyPath = storage_path('oauth-public.key');

            if (!file_exists($privateKeyPath) || !file_exists($publicKeyPath)) {
                Artisan::call('passport:keys', ['--force' => true]);
            }
        }
    }

    /**
     * Configure testing database
     */
    protected function defineDatabaseTransactions()
    {
        return [
            'testing'
        ];
    }

    /**
     * Setup the test environment.
     */
    protected function refreshTestDatabase()
    {
        if (! RefreshDatabase::$migrated) {
            $this->artisan('migrate:fresh', [
                '--drop-views' => true,
                '--drop-types' => true,
                '--seed' => $this->shouldSeed(),
            ]);

            RefreshDatabase::$migrated = true;
        }

        $this->beginDatabaseTransaction();
    }
}
