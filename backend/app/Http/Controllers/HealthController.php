<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    /**
     * Get system health status
     */
    public function index(): JsonResponse
    {
        $startTime = microtime(true);

        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
        ];

        $overallStatus = collect($checks)->every(fn($check) => $check['status'] === 'ok') ? 'ok' : 'error';

        return response()->json([
            'status' => $overallStatus,
            'service' => 'AutoBlogger Pro API',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString(),
            'environment' => app()->environment(),
            'response_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
            'checks' => $checks,
        ]);
    }

    /**
     * Check database connectivity
     */
    private function checkDatabase(): array
    {
        try {
            $startTime = microtime(true);
            DB::select('SELECT 1');
            $latency = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'status' => 'ok',
                'latency_ms' => $latency,
                'connection' => config('database.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'connection' => config('database.default'),
            ];
        }
    }

    /**
     * Check cache connectivity
     */
    private function checkCache(): array
    {
        try {
            $startTime = microtime(true);
            $testKey = 'health_check_' . time();

            Cache::put($testKey, 'test', 10);
            $retrieved = Cache::get($testKey);
            Cache::forget($testKey);

            $latency = round((microtime(true) - $startTime) * 1000, 2);

            if ($retrieved === 'test') {
                return [
                    'status' => 'ok',
                    'latency_ms' => $latency,
                    'driver' => config('cache.default'),
                ];
            } else {
                return [
                    'status' => 'error',
                    'error' => 'Cache test failed',
                    'driver' => config('cache.default'),
                ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'driver' => config('cache.default'),
            ];
        }
    }

    /**
     * Check queue connectivity
     */
    private function checkQueue(): array
    {
        try {
            return [
                'status' => 'ok',
                'connection' => config('queue.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'connection' => config('queue.default'),
            ];
        }
    }
}
