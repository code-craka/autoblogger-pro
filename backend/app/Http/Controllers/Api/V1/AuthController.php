<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'timezone' => ['nullable', 'string', 'max:50'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'timezone' => $request->timezone ?? 'UTC',
                'role' => User::ROLE_USER,
                'is_active' => true,
            ]);

            // Send email verification notification
            event(new Registered($user));

            // Create API token
            $token = $user->createToken('AutoBlogger Pro API Token');

            return response()->json([
                'message' => 'User registered successfully. Please check your email for verification.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                ],
                'access_token' => $token->accessToken,
                'token_type' => 'Bearer',
                'expires_at' => $token->token->expires_at,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Login user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
                'remember_me' => ['boolean'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Rate limiting
            $key = 'login.' . $request->ip();
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                return response()->json([
                    'message' => 'Too many login attempts. Please try again later.',
                    'retry_after' => $seconds,
                ], 429);
            }

            $credentials = $request->only('email', 'password');

            if (!Auth::attempt($credentials)) {
                RateLimiter::hit($key, 300); // 5 minutes

                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401);
            }

            /** @var User $user */
            $user = Auth::user();

            // Check if user is active
            if (!$user->isActive()) {
                return response()->json([
                    'message' => 'Account is suspended. Please contact support.',
                ], 403);
            }

            // Clear rate limiting on successful login
            RateLimiter::clear($key);

            // Update last login
            $user->updateLastLogin();

            // Create API token
            $tokenName = 'AutoBlogger Pro API Token';
            if ($request->remember_me) {
                $token = $user->createToken($tokenName, ['*'], now()->addDays(30));
            } else {
                $token = $user->createToken($tokenName, ['*'], now()->addHours(8));
            }

            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'last_login_at' => $user->last_login_at,
                ],
                'access_token' => $token->accessToken,
                'token_type' => 'Bearer',
                'expires_at' => $token->token->expires_at,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Logout user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Revoke the current access token
            $request->user()->token()->revoke();

            // Optionally revoke all tokens
            if ($request->input('logout_all_devices', false)) {
                foreach ($user->tokens as $token) {
                    $token->revoke();
                }
            }

            return response()->json([
                'message' => 'Logout successful',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Refresh token
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $request->user();

            // Revoke current token
            $request->user()->token()->revoke();

            // Create new token
            $token = $user->createToken('AutoBlogger Pro API Token');

            return response()->json([
                'message' => 'Token refreshed successfully',
                'access_token' => $token->accessToken,
                'token_type' => 'Bearer',
                'expires_at' => $token->token->expires_at,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Token refresh failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $request->user();

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'last_login_at' => $user->last_login_at,
                    'timezone' => $user->timezone,
                    'avatar_url' => $user->avatar_url,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve user data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Send password reset link
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => ['required', 'email', 'exists:users,email'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Rate limiting for password reset requests
            $key = 'password-reset.' . $request->ip();
            if (RateLimiter::tooManyAttempts($key, 3)) {
                $seconds = RateLimiter::availableIn($key);
                return response()->json([
                    'message' => 'Too many password reset attempts. Please try again later.',
                    'retry_after' => $seconds,
                ], 429);
            }

            $status = Password::sendResetLink(
                $request->only('email')
            );

            RateLimiter::hit($key, 3600); // 1 hour

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'message' => 'Password reset link sent to your email',
                ]);
            }

            return response()->json([
                'message' => 'Failed to send password reset link',
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Password reset request failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Reset password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => ['required'],
                'email' => ['required', 'email'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function (User $user, string $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'message' => 'Password reset successful',
                ]);
            }

            return response()->json([
                'message' => 'Password reset failed',
                'error' => __($status),
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Password reset failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Verify email
     *
     * @param EmailVerificationRequest $request
     * @return JsonResponse
     */
    public function verifyEmail(EmailVerificationRequest $request): JsonResponse
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return response()->json([
                    'message' => 'Email already verified',
                ]);
            }

            if ($request->user()->markEmailAsVerified()) {
                event(new Verified($request->user()));
            }

            return response()->json([
                'message' => 'Email verified successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Email verification failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
