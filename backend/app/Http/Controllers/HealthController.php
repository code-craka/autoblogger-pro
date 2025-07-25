<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    /**
     * Get application health status.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $health = [
            'status' => 'ok',
            'service' => 'AutoBlogger Pro API',
            'version' => config('app.version', '1.0.0'),
            'timestamp' => now()->toISOString(),
            'environment' => app()->environment(),
            'checks' => [
                'database' => $this->checkDatabase(),
                'redis' => $this->checkRedis(),
                'cache' => $this->checkCache(),
                'queue' => $this->checkQueue(),
            ],
        ];

        $overallStatus = collect($health['checks'])
            ->every(fn($check) => $check['status'] === 'ok') ? 'ok' : 'error';

        $health['status'] = $overallStatus;

        return response()->json($health, $overallStatus === 'ok' ? 200 : 503);
    }

    /**
     * Check database connection.
     *
     * @return array
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $latency = $this->measureLatency(fn() => DB::select('SELECT 1'));

            return [
                'status' => 'ok',
                'latency_ms' => $latency,
                'connection' => DB::connection()->getName(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check Redis connection.
     *
     * @return array
     */
    private function checkRedis(): array
    {
        try {
            $latency = $this->measureLatency(fn() => Redis::ping());

            return [
                'status' => 'ok',
                'latency_ms' => $latency,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check cache functionality.
     *
     * @return array
     */
    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . now()->timestamp;
            $value = 'test_value';

            $latency = $this->measureLatency(function() use ($key, $value) {
                Cache::put($key, $value, 10);
                $retrieved = Cache::get($key);
                Cache::forget($key);

                if ($retrieved !== $value) {
                    throw new \Exception('Cache value mismatch');
                }
            });

            return [
                'status' => 'ok',
                'latency_ms' => $latency,
                'driver' => config('cache.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check queue functionality.
     *
     * @return array
     */
    private function checkQueue(): array
    {
        try {
            $connection = config('queue.default');

            // For Redis queues, check the connection
            if ($connection === 'redis') {
                Redis::connection('queues')->ping();
            }

            return [
                'status' => 'ok',
                'connection' => $connection,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Measure execution latency in milliseconds.
     *
     * @param callable $callback
     * @return float
     */
    private function measureLatency(callable $callback): float
    {
        $start = microtime(true);
        $callback();
        return round((microtime(true) - $start) * 1000, 2);
    }
}
