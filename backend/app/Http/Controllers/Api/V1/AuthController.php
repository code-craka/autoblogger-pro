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
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
            'timezone' => ['required', 'string', 'timezone'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'timezone' => $request->timezone,
            'role' => User::ROLE_USER,
            'is_active' => true,
        ]);

        event(new Registered($user));

        $token = $user->createToken('auth_token')->accessToken;

        return response()->json([
            'message' => 'User registered successfully. Please check your email for verification.',
            'user' => $user->fresh(),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => now()->addDays(15)->toISOString(),
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required'],
            'remember_me' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();

        if (!$user->isActive()) {
            Auth::logout();
            return response()->json([
                'message' => 'Account is suspended'
            ], 403);
        }

        $user->updateLastLogin();

        $tokenResult = $user->createToken('auth_token');
        $token = $tokenResult->accessToken;

        if ($request->remember_me) {
            $token->expires_at = now()->addDays(30);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->fresh(),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $token->expires_at->toISOString(),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($request->logout_all_devices) {
            // Revoke all tokens for the user
            $tokenRepository = app(TokenRepository::class);
            $refreshTokenRepository = app(RefreshTokenRepository::class);

            $tokens = $tokenRepository->forUser($user->id);
            foreach ($tokens as $token) {
                $tokenRepository->revokeAccessToken($token->id);
                $refreshTokenRepository->revokeRefreshTokensByAccessTokenId($token->id);
            }
        } else {
            // Revoke current token only
            $request->user()->token()->revoke();
        }

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Revoke current token
        $request->user()->token()->revoke();

        // Create new token
        $token = $user->createToken('auth_token')->accessToken;

        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => now()->addDays(15)->toISOString(),
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'exists:users'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email'
            ]);
        }

        return response()->json([
            'message' => 'Unable to send reset link'
        ], 400);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password reset successful'
            ]);
        }

        return response()->json([
            'message' => 'Password reset failed'
        ], 400);
    }

    /**
     * Verify email
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $user = User::findOrFail($request->route('id'));

        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Invalid verification link'
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Email verified successfully'
        ]);
    }
}
