<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRule;

class UserController extends Controller
{
    /**
     * Get user profile
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'timezone' => ['required', 'string', 'timezone'],
            'avatar_url' => ['nullable', 'url', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $emailChanged = $user->email !== $request->email;

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'timezone' => $request->timezone,
            'avatar_url' => $request->avatar_url,
            // Reset email verification if email changed
            'email_verified_at' => $emailChanged ? null : $user->email_verified_at,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        // Add custom validation for current password
        $validator->after(function ($validator) use ($request, $user) {
            if (!Hash::check($request->current_password, $user->password)) {
                $validator->errors()->add('current_password', 'The current password is incorrect.');
            }

            if ($request->current_password === $request->password) {
                $validator->errors()->add('password', 'The new password must be different from the current password.');
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Revoke all tokens for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password changed successfully. Please log in again.'
        ]);
    }
}
