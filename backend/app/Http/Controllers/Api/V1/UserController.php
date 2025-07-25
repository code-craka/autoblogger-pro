<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * Get user profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function profile(Request $request): JsonResponse
    {
        try {
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
                    'provider' => $user->provider,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve user profile',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update user profile
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'name' => ['sometimes', 'required', 'string', 'max:255'],
                'email' => ['sometimes', 'required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
                'timezone' => ['sometimes', 'nullable', 'string', 'max:50'],
                'avatar_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $updateData = $validator->validated();

            // If email is being updated, reset email verification
            if (isset($updateData['email']) && $updateData['email'] !== $user->email) {
                $updateData['email_verified_at'] = null;
                $emailChanged = true;
            } else {
                $emailChanged = false;
            }

            $user->update($updateData);

            // Send email verification if email was changed
            if ($emailChanged) {
                $user->sendEmailVerificationNotification();
            }

            return response()->json([
                'message' => 'Profile updated successfully' . ($emailChanged ? '. Please verify your new email address.' : ''),
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'timezone' => $user->timezone,
                    'avatar_url' => $user->avatar_url,
                    'updated_at' => $user->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Change user password
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'current_password' => ['required_if:has_password,true', 'string'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            // Check if user has a current password (not OAuth-only)
            $hasPassword = !is_null($user->password);
            $validator->sometimes('current_password', 'required', function () use ($hasPassword) {
                return $hasPassword;
            });

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Verify current password if user has one
            if ($hasPassword && !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect',
                ], 400);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            // Revoke all existing tokens to force re-login
            $user->tokens()->delete();

            return response()->json([
                'message' => 'Password changed successfully. Please log in again.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to change password',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Delete user account
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'password' => ['required_if:has_password,true', 'string'],
                'confirmation' => ['required', 'string', 'in:DELETE_MY_ACCOUNT'],
            ]);

            // Check if user has a password (not OAuth-only)
            $hasPassword = !is_null($user->password);
            if ($hasPassword) {
                $validator->sometimes('password', 'required', function () {
                    return true;
                });
            }

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Verify password if user has one
            if ($hasPassword && !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Password is incorrect',
                ], 400);
            }

            // Revoke all tokens
            $user->tokens()->delete();

            // Soft delete or anonymize user data (depending on requirements)
            // For GDPR compliance, you might want to anonymize instead of delete
            $user->update([
                'name' => 'Deleted User',
                'email' => 'deleted_' . $user->id . '@deleted.local',
                'password' => null,
                'is_active' => false,
                'provider' => null,
                'provider_id' => null,
                'provider_token' => null,
                'avatar_url' => null,
            ]);

            // Or use soft delete
            // $user->delete();

            return response()->json([
                'message' => 'Account deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete account',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get user statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // This would typically fetch from related models
            // For now, returning mock data structure
            $stats = [
                'content_generations' => [
                    'total' => 0,
                    'this_month' => 0,
                    'this_week' => 0,
                ],
                'subscription' => [
                    'plan' => 'free',
                    'status' => 'active',
                    'usage_percentage' => 0,
                ],
                'account' => [
                    'member_since' => $user->created_at,
                    'last_active' => $user->last_login_at,
                    'total_logins' => 1, // Would be tracked in a separate table
                ],
            ];

            return response()->json([
                'statistics' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve user statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
