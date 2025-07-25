<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global middleware - Use Laravel 11's native CORS handling
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Middleware aliases
        $middleware->alias([
            'api.rate_limit' => \App\Http\Middleware\ApiRateLimit::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        // Throttle middleware for API
        $middleware->throttleApi('api');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // API exception handling
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Authentication required',
                ], 401);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found',
                ], 404);
            }
        });
    })->create();
