<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Passport;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Skip Passport installation for now to avoid console interaction
        // We'll handle this differently in CI/CD
    }

    /**
     * Test user registration with valid data
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $userData = [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/v1/auth/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'role', 'is_active', 'email_verified_at', 'created_at'
                    ],
                    'access_token',
                    'token_type',
                    'expires_at'
                ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'name' => $userData['name'],
            'role' => User::ROLE_USER,
            'is_active' => true,
        ]);
    }

    /**
     * Test user registration fails with invalid data
     */
    public function test_user_registration_fails_with_invalid_data(): void
    {
        $invalidData = [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
            'password_confirmation' => 'different',
        ];

        $response = $this->postJson('/api/v1/auth/register', $invalidData);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'message',
                    'errors' => [
                        'name',
                        'email',
                        'password'
                    ]
                ]);
    }

    /**
     * Test user can login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        $loginData = [
            'email' => $user->email,
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'role', 'is_active', 'last_login_at'
                    ],
                    'access_token',
                    'token_type',
                    'expires_at'
                ]);

        // Verify last login was updated
        $user->refresh();
        $this->assertNotNull($user->last_login_at);
    }

    /**
     * Test login fails with invalid credentials
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ];

        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(401)
                ->assertJson([
                    'message' => 'Invalid credentials'
                ]);
    }

    /**
     * Test inactive user cannot login
     */
    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $loginData = [
            'email' => $user->email,
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(403)
                ->assertJson([
                    'message' => 'Account is suspended. Please contact support.'
                ]);
    }

    /**
     * Test authenticated user can access protected routes
     */
    public function test_authenticated_user_can_access_protected_routes(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => [
                        'id', 'name', 'email', 'role', 'is_active'
                    ]
                ]);
    }

    /**
     * Test unauthenticated user cannot access protected routes
     */
    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    /**
     * Test user can logout successfully
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Logout successful'
                ]);
    }

    /**
     * Test password reset request
     */
    public function test_user_can_request_password_reset(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Password reset link sent to your email'
                ]);
    }

    /**
     * Test rate limiting on login attempts
     */
    public function test_login_rate_limiting(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => $user->email,
            'password' => 'wrongpassword',
        ];

        // Make 5 failed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', $loginData);
        }

        // 6th attempt should be rate limited
        $response = $this->postJson('/api/v1/auth/login', $loginData);

        $response->assertStatus(429)
                ->assertJsonStructure([
                    'message',
                    'retry_after'
                ]);
    }

    /**
     * Test token refresh functionality
     */
    public function test_user_can_refresh_token(): void
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
}
