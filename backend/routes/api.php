<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OAuthController;
use App\Http\Controllers\Api\V1\UserController;
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

        // OAuth management (authenticated)
        Route::prefix('oauth')->name('oauth.')->group(function () {
            Route::delete('/unlink', [OAuthController::class, 'unlink'])->name('unlink');
            Route::get('/status', [OAuthController::class, 'status'])->name('status');
        });

        // User profile management
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/profile', [UserController::class, 'profile'])->name('profile');
            Route::put('/profile', [UserController::class, 'updateProfile'])->name('update-profile');
            Route::post('/change-password', [UserController::class, 'changePassword'])->name('change-password');
            Route::delete('/account', [UserController::class, 'deleteAccount'])->name('delete-account');
            Route::get('/statistics', [UserController::class, 'statistics'])->name('statistics');
        });

        // Content generation
        Route::prefix('content')->name('content.')->group(function () {
            Route::post('/generate', 'ContentController@generate')->name('generate');
            Route::get('/', 'ContentController@index')->name('index');
            Route::get('/{content}', 'ContentController@show')->name('show');
            Route::put('/{content}', 'ContentController@update')->name('update');
            Route::delete('/{content}', 'ContentController@destroy')->name('destroy');
            Route::get('/{content}/history', 'ContentController@history')->name('history');
        });

        // Bulk processing
        Route::prefix('bulk')->name('bulk.')->group(function () {
            Route::post('/upload', 'BulkController@upload')->name('upload');
            Route::get('/batches', 'BulkController@batches')->name('batches');
            Route::get('/batches/{batch}', 'BulkController@batchStatus')->name('batch-status');
            Route::post('/batches/{batch}/cancel', 'BulkController@cancelBatch')->name('cancel-batch');
            Route::get('/batches/{batch}/download', 'BulkController@downloadResults')->name('download-results');
        });

        // Subscription management
        Route::prefix('subscription')->name('subscription.')->group(function () {
            Route::get('/', 'SubscriptionController@current')->name('current');
            Route::post('/create', 'SubscriptionController@create')->name('create');
            Route::post('/upgrade', 'SubscriptionController@upgrade')->name('upgrade');
            Route::post('/downgrade', 'SubscriptionController@downgrade')->name('downgrade');
            Route::post('/cancel', 'SubscriptionController@cancel')->name('cancel');
            Route::post('/resume', 'SubscriptionController@resume')->name('resume');
            Route::get('/usage', 'SubscriptionController@usage')->name('usage');
            Route::get('/invoices', 'SubscriptionController@invoices')->name('invoices');
        });

        // Usage analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/dashboard', 'AnalyticsController@dashboard')->name('dashboard');
            Route::get('/usage', 'AnalyticsController@usage')->name('usage');
            Route::get('/content-performance', 'AnalyticsController@contentPerformance')->name('content-performance');
        });

        // Admin routes (admin role required)
        Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('/users', 'AdminController@users')->name('users');
            Route::get('/system-stats', 'AdminController@systemStats')->name('system-stats');
            Route::get('/content-stats', 'AdminController@contentStats')->name('content-stats');
            Route::post('/users/{user}/suspend', 'AdminController@suspendUser')->name('suspend-user');
            Route::post('/users/{user}/unsuspend', 'AdminController@unsuspendUser')->name('unsuspend-user');
        });
    });

    // Webhook routes (no auth, but with signature verification)
    Route::prefix('webhooks')->name('webhooks.')->group(function () {
        Route::post('/stripe', 'WebhookController@stripe')->name('stripe');
        Route::post('/openai', 'WebhookController@openai')->name('openai');
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
