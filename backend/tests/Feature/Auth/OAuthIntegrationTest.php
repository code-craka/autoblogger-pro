<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class OAuthIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up Passport keys for testing
        $this->artisan('passport:keys', ['--force' => true]);
    }

    #[Test]
    public function oauth_redirect_for_google(): void
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

        $this->assertStringContainsString('accounts.google.com', $response->json('redirect_url'));
    }

    /** @test */
    public function oauth_redirect_for_github(): void
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

        $this->assertStringContainsString('github.com', $response->json('redirect_url'));
    }

    /** @test */
    public function oauth_callback_creates_new_user(): void
    {
        // Create a simple mock socialite user
        $socialiteUser = new \stdClass();
        $socialiteUser->id = '12345';
        $socialiteUser->email = 'john@example.com';
        $socialiteUser->name = 'John Doe';
        $socialiteUser->avatar = 'https://example.com/avatar.jpg';
        $socialiteUser->token = 'mock_token';

        // Mock the Socialite facade
        Socialite::shouldReceive('driver')
                 ->with('google')
                 ->andReturnSelf();

        Socialite::shouldReceive('stateless')
                 ->andReturnSelf();

        Socialite::shouldReceive('user')
                 ->andReturn($socialiteUser);

        $response = $this->getJson('/api/v1/auth/oauth/google/callback?code=mock_code');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id', 'name', 'email', 'provider'
                    ],
                    'access_token',
                    'token_type',
                    'expires_at',
                    'is_new_user'
                ])
                ->assertJson([
                    'is_new_user' => true
                ]);

        // Verify user was created
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'provider' => 'google'
        ]);
    }

    /** @test */
    public function oauth_callback_authenticates_existing_user(): void
    {
        // Create existing user
        $existingUser = User::factory()->create([
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'provider' => null
        ]);

        // Create a simple mock socialite user
        $socialiteUser = new \stdClass();
        $socialiteUser->id = '12345';
        $socialiteUser->email = 'john@example.com';
        $socialiteUser->name = 'John Doe';
        $socialiteUser->avatar = 'https://example.com/avatar.jpg';
        $socialiteUser->token = 'mock_token';

        // Mock the Socialite facade
        Socialite::shouldReceive('driver')
                 ->with('google')
                 ->andReturnSelf();

        Socialite::shouldReceive('stateless')
                 ->andReturnSelf();

        Socialite::shouldReceive('user')
                 ->andReturn($socialiteUser);

        $response = $this->getJson('/api/v1/auth/oauth/google/callback?code=mock_code');

        $response->assertStatus(200)
                ->assertJson([
                    'is_new_user' => false
                ]);

        // Verify user was updated with OAuth info
        $existingUser->refresh();
        $this->assertEquals('google', $existingUser->provider);
    }

    /** @test */
    public function oauth_callback_fails_for_inactive_user(): void
    {
        // Create inactive user
        $inactiveUser = User::factory()->create([
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'is_active' => false
        ]);

        // Create a simple mock socialite user
        $socialiteUser = new \stdClass();
        $socialiteUser->id = '12345';
        $socialiteUser->email = 'john@example.com';
        $socialiteUser->name = 'John Doe';
        $socialiteUser->avatar = 'https://example.com/avatar.jpg';
        $socialiteUser->token = 'mock_token';

        // Mock the Socialite facade
        Socialite::shouldReceive('driver')
                 ->with('google')
                 ->andReturnSelf();

        Socialite::shouldReceive('stateless')
                 ->andReturnSelf();

        Socialite::shouldReceive('user')
                 ->andReturn($socialiteUser);

        $response = $this->getJson('/api/v1/auth/oauth/google/callback?code=mock_code');

        $response->assertStatus(403)
                ->assertJson([
                    'message' => 'Account is suspended'
                ]);
    }

    /** @test */
    public function oauth_callback_handles_invalid_provider(): void
    {
        $response = $this->getJson('/api/v1/auth/oauth/invalid/callback?code=mock_code');

        $response->assertStatus(404);
    }

    /** @test */
    public function oauth_callback_handles_missing_code(): void
    {
        $response = $this->getJson('/api/v1/auth/oauth/google/callback');

        $response->assertStatus(400)
                ->assertJson([
                    'message' => 'Authorization code is required'
                ]);
    }
}
