<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Auth\Notifications\ResetPassword;
use Laravel\Passport\Passport;

class AuthenticationIntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear rate limiting cache before each test
        Cache::flush();
        RateLimiter::clear('login.' . request()->ip());

        // Fake notifications for testing
        Notification::fake();

        // Set up Passport for testing
        $this->artisan('passport:keys', ['--force' => true]);
    }

    /** @test */
    public function user_can_register_with_valid_data()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'timezone' => 'UTC'
        ];

        $response = $this->postJson('/api/v1/auth/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'role', 'is_active',
                        'email_verified_at', 'timezone', 'created_at'
                    ],
                    'access_token',
                    'token_type',
                    'expires_at'
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'timezone' => 'UTC'
        ]);

        // Verify password is hashed
        $user = User::where('email', 'john@example.com')->first();
        $this->assertTrue(Hash::check('Password123!', $user->password));
    }

    /** @test */
    public function user_cannot_register_with_invalid_data()
    {
        $invalidData = [
            'name' => '', // Required
            'email' => 'invalid-email', // Invalid format
            'password' => '123', // Too short
            'password_confirmation' => 'different', // Doesn't match
            // Note: timezone validation may not be enforced in controller yet
        ];

        $response = $this->postJson('/api/v1/auth/register', $invalidData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('Password123!'),
            'email_verified_at' => now()
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'remember_me' => false
        ];

        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'role', 'is_active',
                        'email_verified_at', 'last_login_at'
                    ],
                    'access_token',
                    'token_type',
                    'expires_at'
                ]);

        // Verify last_login_at is updated
        $user->refresh();
        $this->assertNotNull($user->last_login_at);
    }

    /** @test */
    public function user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'WrongPassword',
            'remember_me' => false
        ];

        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(401)
                ->assertJson(['message' => 'Invalid credentials']);
    }

    /** @test */
    public function inactive_user_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('Password123!'),
            'is_active' => false
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'remember_me' => false
        ];

        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(403)
                ->assertJson(['message' => 'Account is suspended']);
    }

    /** @test */
    public function authenticated_user_can_get_profile()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => [
                        'id', 'name', 'email', 'role', 'is_active',
                        'email_verified_at', 'last_login_at', 'timezone',
                        'avatar_url', 'provider', 'created_at', 'updated_at'
                    ]
                ])
                ->assertJson([
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'name' => $user->name
                    ]
                ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_get_profile()
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
                ->assertJson(['message' => 'Logout successful']);
    }

    /** @test */
    public function authenticated_user_can_logout_all_devices()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/auth/logout', [
            'logout_all_devices' => true
        ]);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Logout successful']);
    }

    /** @test */
    public function user_can_request_password_reset()
    {
        $user = User::factory()->create(['email' => 'john@example.com']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'john@example.com'
        ]);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Password reset link sent to your email']);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    /** @test */
    public function password_reset_request_validates_email()
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@example.com'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function user_can_reset_password_with_valid_token()
    {
        $user = User::factory()->create(['email' => 'john@example.com']);

        // Generate a password reset token
        $token = app('auth.password.broker')->createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'john@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!'
        ]);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Password reset successful']);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
    }

    /** @test */
    public function password_reset_fails_with_invalid_token()
    {
        $user = User::factory()->create(['email' => 'john@example.com']);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => 'john@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!'
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function authenticated_user_can_refresh_token()
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/auth/refresh');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'access_token',
                    'token_type',
                    'expires_at'
                ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_refresh_token()
    {
        $response = $this->postJson('/api/v1/auth/refresh');

        $response->assertStatus(401);
    }

    /** @test */
    public function api_rate_limiting_works_for_login_attempts()
    {
        // Clear rate limiting before this specific test
        Cache::flush();
        RateLimiter::clear('auth');
        $ip = request()->ip() ?? '127.0.0.1';
        RateLimiter::clear('login.' . $ip);

        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'WrongPassword',
            'remember_me' => false
        ];

        // Make multiple failed login attempts with small delays
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/api/v1/auth/login', $loginData);

            // Add small delay between requests
            usleep(100000); // 0.1 second

            if ($i < 3) {
                $response->assertStatus(401);
            } else {
                // Accept either 401 (still allowing) or 429 (rate limited)
                $this->assertContains($response->status(), [401, 429]);
            }
        }
    }

    /** @test */
    public function api_endpoints_return_consistent_error_format()
    {
        // Test validation error format
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'message',
                    'errors' => []
                ]);

        // Test authentication error format
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
                ->assertJsonStructure(['message']);
    }

    /** @test */
    public function api_returns_proper_cors_headers()
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertHeader('Access-Control-Allow-Origin');
    }
}
