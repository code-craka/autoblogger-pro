<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OAuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/health', [HealthController::class, 'index'])->name('api.health');

// API v1 Routes
Route::prefix('v1')->name('v1.')->group(function () {

    // Public authentication routes (no auth required)
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login', [AuthController::class, 'login'])->name('login');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
        Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');

        // OAuth routes
        Route::get('/oauth/{provider}', [OAuthController::class, 'redirect'])->name('oauth.redirect');
        Route::get('/oauth/{provider}/callback', [OAuthController::class, 'callback'])->name('oauth.callback');
    });

    // Protected routes (authentication required)
    Route::middleware(['auth:api', 'throttle:api'])->group(function () {

        // Authentication management
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
            Route::get('/me', [AuthController::class, 'me'])->name('me');
        });

        // User profile management
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/profile', [UserController::class, 'profile'])->name('profile');
            Route::put('/profile', [UserController::class, 'updateProfile'])->name('profile.update');
            Route::post('/change-password', [UserController::class, 'changePassword'])->name('change-password');
        });

        // Content generation and management
        Route::prefix('content')->name('content.')->group(function () {
            Route::get('/', [ContentController::class, 'index'])->name('index');
            Route::post('/generate', [ContentController::class, 'generate'])->name('generate');
            Route::post('/bulk-generate', [ContentController::class, 'bulkGenerate'])->name('bulk-generate');
            Route::get('/stats', [ContentController::class, 'getStats'])->name('stats');
            Route::get('/models', [ContentController::class, 'getModels'])->name('models');
            Route::get('/{content}', [ContentController::class, 'show'])->name('show');
            Route::put('/{content}', [ContentController::class, 'update'])->name('update');
            Route::delete('/{content}', [ContentController::class, 'destroy'])->name('destroy');
            Route::post('/{content}/analyze-quality', [ContentController::class, 'analyzeQuality'])->name('analyze-quality');
        });
    });
});

// Email verification routes
Route::middleware(['auth:api'])->group(function () {
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent!']);
    })->middleware(['throttle:6,1'])->name('verification.send');
});

// Rate limiting middleware
Route::middleware('throttle:60,1')->group(function () {
    // Additional rate-limited routes can be added here
});
