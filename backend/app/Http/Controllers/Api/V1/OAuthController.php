<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    /**
     * Redirect to OAuth provider
     */
    public function redirect(string $provider): JsonResponse
    {
        if (!in_array($provider, ['google', 'github'])) {
            return response()->json([
                'message' => 'Invalid OAuth provider'
            ], 404);
        }

        try {
            $redirectUrl = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

            return response()->json([
                'redirect_url' => $redirectUrl,
                'provider' => $provider
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth provider configuration error'
            ], 500);
        }
    }

    /**
     * Handle OAuth callback
     */
    public function callback(string $provider, Request $request): JsonResponse
    {
        if (!in_array($provider, ['google', 'github'])) {
            return response()->json([
                'message' => 'Invalid OAuth provider'
            ], 404);
        }

        if (!$request->has('code')) {
            return response()->json([
                'message' => 'Authorization code is required'
            ], 400);
        }

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();

            // Check if user exists by email
            $user = User::where('email', $socialiteUser->getEmail())->first();
            $isNewUser = false;

            if ($user) {
                // Check if user is active
                if (!$user->isActive()) {
                    return response()->json([
                        'message' => 'Account is suspended'
                    ], 403);
                }

                // Update OAuth info for existing user
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialiteUser->getId(),
                    'avatar_url' => $socialiteUser->getAvatar(),
                    'last_login_at' => now(),
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $socialiteUser->getName(),
                    'email' => $socialiteUser->getEmail(),
                    'provider' => $provider,
                    'provider_id' => $socialiteUser->getId(),
                    'avatar_url' => $socialiteUser->getAvatar(),
                    'email_verified_at' => now(), // OAuth emails are considered verified
                    'password' => bcrypt(Str::random(32)), // Random password for OAuth users
                    'timezone' => 'UTC',
                    'role' => User::ROLE_USER,
                    'is_active' => true,
                    'last_login_at' => now(),
                ]);
                $isNewUser = true;
            }

            // Create token
            $token = $user->createToken('oauth_token')->accessToken;

            return response()->json([
                'message' => 'OAuth authentication successful',
                'user' => $user->fresh(),
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addDays(15)->toISOString(),
                'is_new_user' => $isNewUser,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'OAuth authentication failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Authentication error'
            ], 500);
        }
    }
}
