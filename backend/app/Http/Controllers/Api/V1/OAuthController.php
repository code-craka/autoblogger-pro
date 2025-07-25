<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

class OAuthController extends Controller
{
    /**
     * Supported OAuth providers
     */
    private const SUPPORTED_PROVIDERS = ['google', 'github'];

    /**
     * Redirect to OAuth provider
     *
     * @param string $provider
     * @param Request $request
     * @return JsonResponse
     */
    public function redirect(string $provider, Request $request): JsonResponse
    {
        try {
            if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
                return response()->json([
                    'message' => 'Unsupported OAuth provider',
                    'supported_providers' => self::SUPPORTED_PROVIDERS,
                ], 400);
            }

            $redirectUrl = Socialite::driver($provider)
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'redirect_url' => $redirectUrl,
                'provider' => $provider,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth redirect failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Handle OAuth provider callback
     *
     * @param string $provider
     * @param Request $request
     * @return JsonResponse
     */
    public function callback(string $provider, Request $request): JsonResponse
    {
        try {
            if (!in_array($provider, self::SUPPORTED_PROVIDERS)) {
                return response()->json([
                    'message' => 'Unsupported OAuth provider',
                    'supported_providers' => self::SUPPORTED_PROVIDERS,
                ], 400);
            }

            // Get user from OAuth provider
            $socialUser = Socialite::driver($provider)->stateless()->user();

            if (!$socialUser || !$socialUser->getEmail()) {
                return response()->json([
                    'message' => 'Failed to retrieve user information from OAuth provider',
                ], 400);
            }

            // Check if user exists with this email
            $existingUser = User::where('email', $socialUser->getEmail())->first();

            if ($existingUser) {
                // Update existing user with OAuth information if not already set
                if (!$existingUser->provider) {
                    $existingUser->update([
                        'provider' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'provider_token' => $socialUser->token,
                        'avatar_url' => $socialUser->getAvatar(),
                        'email_verified_at' => $existingUser->email_verified_at ?? now(),
                    ]);
                }

                $user = $existingUser;
            } else {
                // Create new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? 'User',
                    'email' => $socialUser->getEmail(),
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'provider_token' => $socialUser->token,
                    'avatar_url' => $socialUser->getAvatar(),
                    'email_verified_at' => now(), // OAuth emails are considered verified
                    'role' => User::ROLE_USER,
                    'is_active' => true,
                ]);
            }

            // Check if user is active
            if (!$user->isActive()) {
                return response()->json([
                    'message' => 'Account is suspended. Please contact support.',
                ], 403);
            }

            // Update last login
            $user->updateLastLogin();

            // Create API token
            $token = $user->createToken('AutoBlogger Pro OAuth Token');

            return response()->json([
                'message' => 'OAuth authentication successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'avatar_url' => $user->avatar_url,
                    'provider' => $user->provider,
                    'last_login_at' => $user->last_login_at,
                ],
                'access_token' => $token->accessToken,
                'token_type' => 'Bearer',
                'expires_at' => $token->token->expires_at,
                'is_new_user' => !$existingUser,
            ]);

        } catch (InvalidStateException $e) {
            return response()->json([
                'message' => 'Invalid OAuth state. Please try again.',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth authentication failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Unlink OAuth provider from user account
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function unlink(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Check if user has a password set (not OAuth-only account)
            if (!$user->password && $user->provider) {
                return response()->json([
                    'message' => 'Cannot unlink OAuth provider. Please set a password first.',
                ], 400);
            }

            // Unlink OAuth provider
            $user->update([
                'provider' => null,
                'provider_id' => null,
                'provider_token' => null,
            ]);

            return response()->json([
                'message' => 'OAuth provider unlinked successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to unlink OAuth provider',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get OAuth connection status
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            return response()->json([
                'oauth_connected' => !is_null($user->provider),
                'provider' => $user->provider,
                'has_password' => !is_null($user->password),
                'supported_providers' => self::SUPPORTED_PROVIDERS,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve OAuth status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
