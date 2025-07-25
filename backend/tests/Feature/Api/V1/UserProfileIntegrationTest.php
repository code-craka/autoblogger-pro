<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Passport;

class UserProfileIntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('passport:keys', ['--force' => true]);
    }

    /** @test */
    public function authenticated_user_can_get_profile()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'timezone' => 'America/New_York',
            'avatar_url' => 'https://example.com/avatar.jpg'
        ]);

        Passport::actingAs($user);

        $response = $this->getJson('/api/v1/user/profile');

        $response->assertStatus(200)
                ->assertJson([
                    'user' => [
                        'id' => $user->id,
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                        'timezone' => 'America/New_York',
                        'avatar_url' => 'https://example.com/avatar.jpg',
                        'role' => 'user',
                        'is_active' => true
                    ]
                ]);
    }

    /** @test */
    public function authenticated_user_can_update_profile()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $updateData = [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'timezone' => 'Europe/London',
            'avatar_url' => 'https://example.com/new-avatar.jpg'
        ];

        $response = $this->putJson('/api/v1/user/profile', $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'timezone', 'avatar_url', 'updated_at'
                    ]
                ])
                ->assertJson([
                    'message' => 'Profile updated successfully',
                    'user' => [
                        'name' => 'Jane Smith',
                        'email' => 'jane@example.com',
                        'timezone' => 'Europe/London',
                        'avatar_url' => 'https://example.com/new-avatar.jpg'
                    ]
                ]);

        // Verify database was updated
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'timezone' => 'Europe/London',
            'avatar_url' => 'https://example.com/new-avatar.jpg'
        ]);
    }

    /** @test */
    public function profile_update_validates_input()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $invalidData = [
            'name' => '', // Required
            'email' => 'invalid-email', // Invalid format
            'timezone' => 'Invalid/Timezone', // Invalid timezone
            'avatar_url' => 'not-a-url' // Invalid URL
        ];

        $response = $this->putJson('/api/v1/user/profile', $invalidData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'timezone', 'avatar_url']);
    }

    /** @test */
    public function user_cannot_update_profile_with_existing_email()
    {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);
        $user = User::factory()->create(['email' => 'user@example.com']);

        Passport::actingAs($user);

        $response = $this->putJson('/api/v1/user/profile', [
            'name' => 'Updated Name',
            'email' => 'existing@example.com', // Email already exists
            'timezone' => 'UTC'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function authenticated_user_can_change_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!')
        ]);

        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/user/change-password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!'
        ]);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Password changed successfully. Please log in again.']);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
        $this->assertFalse(Hash::check('OldPassword123!', $user->password));
    }

    /** @test */
    public function password_change_validates_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!')
        ]);

        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/user/change-password', [
            'current_password' => 'WrongPassword',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['current_password']);
    }

    /** @test */
    public function password_change_validates_new_password_requirements()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!')
        ]);

        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/user/change-password', [
            'current_password' => 'OldPassword123!',
            'password' => '123', // Too weak
            'password_confirmation' => '123'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function password_change_requires_confirmation_match()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!')
        ]);

        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/user/change-password', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'DifferentPassword123!'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function password_change_prevents_same_as_current()
    {
        $user = User::factory()->create([
            'password' => Hash::make('SamePassword123!')
        ]);

        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/user/change-password', [
            'current_password' => 'SamePassword123!',
            'password' => 'SamePassword123!', // Same as current
            'password_confirmation' => 'SamePassword123!'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_profile_endpoints()
    {
        // Test profile retrieval
        $response = $this->getJson('/api/v1/user/profile');
        $response->assertStatus(401);

        // Test profile update
        $response = $this->putJson('/api/v1/user/profile', []);
        $response->assertStatus(401);

        // Test password change
        $response = $this->postJson('/api/v1/user/change-password', []);
        $response->assertStatus(401);
    }

    /** @test */
    public function profile_endpoints_respect_rate_limiting()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        // Make multiple requests to trigger rate limiting
        for ($i = 0; $i < 65; $i++) {
            $response = $this->getJson('/api/v1/user/profile');

            if ($i < 60) {
                $response->assertStatus(200);
            } else {
                // Should be rate limited after 60 requests per minute
                $response->assertStatus(429);
                break;
            }
        }
    }

    /** @test */
    public function email_verification_status_is_properly_handled()
    {
        // Test with unverified email
        $unverifiedUser = User::factory()->create(['email_verified_at' => null]);
        Passport::actingAs($unverifiedUser);

        $response = $this->getJson('/api/v1/user/profile');
        $response->assertStatus(200)
                ->assertJson([
                    'user' => [
                        'email_verified_at' => null
                    ]
                ]);

        // Test with verified email
        $verifiedUser = User::factory()->create(['email_verified_at' => now()]);
        Passport::actingAs($verifiedUser);

        $response = $this->getJson('/api/v1/user/profile');
        $response->assertStatus(200)
                ->assertJsonPath('user.email_verified_at', function ($value) {
                    return !is_null($value);
                });
    }

    /** @test */
    public function profile_update_with_email_change_resets_verification()
    {
        $user = User::factory()->create([
            'email' => 'old@example.com',
            'email_verified_at' => now()
        ]);

        Passport::actingAs($user);

        $response = $this->putJson('/api/v1/user/profile', [
            'name' => $user->name,
            'email' => 'new@example.com',
            'timezone' => $user->timezone
        ]);

        $response->assertStatus(200);

        // Verify email verification is reset
        $user->refresh();
        $this->assertEquals('new@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }
}
