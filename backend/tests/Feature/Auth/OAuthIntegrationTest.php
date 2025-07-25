<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;
use Mockery;

class OAuthIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('passport:install', ['--force' => true]);
    }

    /**
     * Test OAuth redirect generation for Google
     */
    public function test_oauth_redirect_for_google(): void
    {
        $response = $this->getJson('/api/v1/auth/oauth/google');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'redirect_url',
                    'provider'
                ])
                ->assertJson([
                    'provider' => 'google'
                ]);

        $redirectUrl = $response->json('redirect_url');
        $this->assertStringContainsString('accounts.google.com', $redirectUrl);
        $this->assertStringContainsString('oauth/authorize', $redirectUrl);
    }

    /**
     * Test OAuth redirect generation for GitHub
     */
    public function test_oauth_redirect_for_github(): void
    {
        $response = $this->getJson('/api/v1/auth/oauth/github');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'redirect_url',
                    'provider'
                ])
                ->assertJson([
                    'provider' => 'github'
                ]);

        $redirectUrl = $response->json('redirect_url');
        $this->assertStringContainsString('github.com', $redirectUrl);
        $this->assertStringContainsString('login/oauth/authorize', $redirectUrl);
    }

    /**
     * Test OAuth redirect fails for unsupported provider
     */
    public function test_oauth_redirect_fails_for_unsupported_provider(): void
    {
        $response = $this->getJson('/api/v1/auth/oauth/facebook');

        $response->assertStatus(400)
                ->assertJsonStructure([
                    'message',
                    'supported_providers'
                ]);
    }

    /**
     * Test OAuth callback creates new user successfully
     */
    public function test_oauth_callback_creates_new_user(): void
    {
        // Mock Socialite user
        $socialiteUser = $this->createMockSocialiteUser([
            'id' => '12345',
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'avatar' => 'https://example.com/avatar.jpg',
        ]);

        // Mock Socialite driver with proper expectations
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('stateless')->once()->andReturnSelf();
        $mockDriver->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')
                 ->with('google')
                 ->once()
                 ->andReturn($mockDriver);

        $response = $this->getJson('/api/v1/auth/oauth/google/callback');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'provider', 'avatar_url'
                    ],
                    'access_token',
                    'token_type',
                    'expires_at',
                    'is_new_user'
                ])
                ->assertJson([
                    'is_new_user' => true
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'provider' => 'google',
            'provider_id' => '12345',
        ]);
    }

    /**
     * Test OAuth callback authenticates existing user
     */
    public function test_oauth_callback_authenticates_existing_user(): void
    {
        // Create existing user
        $existingUser = User::factory()->create([
            'email' => 'john@example.com',
            'name' => 'John Doe',
        ]);

        $socialiteUser = $this->createMockSocialiteUser([
            'id' => '12345',
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'avatar' => 'https://example.com/avatar.jpg',
        ]);

        // Mock Socialite driver with proper expectations
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('stateless')->once()->andReturnSelf();
        $mockDriver->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')
                 ->with('google')
                 ->once()
                 ->andReturn($mockDriver);

        $response = $this->getJson('/api/v1/auth/oauth/google/callback');

        $response->assertStatus(200)
                ->assertJson([
                    'is_new_user' => false
                ]);

        // Verify user was updated with OAuth info
        $existingUser->refresh();
        $this->assertEquals('google', $existingUser->provider);
        $this->assertEquals('12345', $existingUser->provider_id);
    }

    /**
     * Test OAuth callback fails for inactive user
     */
    public function test_oauth_callback_fails_for_inactive_user(): void
    {
        $inactiveUser = User::factory()->create([
            'email' => 'john@example.com',
            'is_active' => false,
        ]);

        $socialiteUser = $this->createMockSocialiteUser([
            'id' => '12345',
            'email' => 'john@example.com',
            'name' => 'John Doe',
        ]);

        // Mock Socialite driver with proper expectations
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('stateless')->once()->andReturnSelf();
        $mockDriver->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')
                 ->with('google')
                 ->once()
                 ->andReturn($mockDriver);

        $response = $this->getJson('/api/v1/auth/oauth/google/callback');

        $response->assertStatus(403)
                ->assertJson([
                    'message' => 'Account is suspended. Please contact support.'
                ]);
    }

    /**
     * Create a mock Socialite user
     */
    private function createMockSocialiteUser(array $attributes): SocialiteUser
    {
        $user = Mockery::mock(SocialiteUser::class);
        $user->shouldReceive('getId')->andReturn($attributes['id']);
        $user->shouldReceive('getEmail')->andReturn($attributes['email']);
        $user->shouldReceive('getName')->andReturn($attributes['name']);
        $user->shouldReceive('getAvatar')->andReturn($attributes['avatar'] ?? null);
        $user->token = 'mock_token';

        return $user;
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
