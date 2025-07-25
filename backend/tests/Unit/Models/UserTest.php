<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user roles functionality
     */
    public function test_user_roles(): void
    {
        $user = User::factory()->create(['role' => User::ROLE_USER]);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->assertTrue($user->hasRole(User::ROLE_USER));
        $this->assertFalse($user->hasRole(User::ROLE_ADMIN));
        $this->assertFalse($user->isAdmin());

        $this->assertTrue($admin->hasRole(User::ROLE_ADMIN));
        $this->assertTrue($admin->isAdmin());
    }

    /**
     * Test user status checks
     */
    public function test_user_status_checks(): void
    {
        $activeUser = User::factory()->create(['is_active' => true]);
        $inactiveUser = User::factory()->create(['is_active' => false]);

        $this->assertTrue($activeUser->isActive());
        $this->assertFalse($inactiveUser->isActive());
    }

    /**
     * Test user verification status
     */
    public function test_user_verification_status(): void
    {
        $verifiedUser = User::factory()->create(['email_verified_at' => now()]);
        $unverifiedUser = User::factory()->create(['email_verified_at' => null]);

        $this->assertTrue($verifiedUser->isVerified());
        $this->assertFalse($unverifiedUser->isVerified());
    }

    /**
     * Test user scopes
     */
    public function test_user_scopes(): void
    {
        User::factory()->create(['is_active' => true, 'role' => User::ROLE_USER]);
        User::factory()->create(['is_active' => false, 'role' => User::ROLE_USER]);
        User::factory()->create(['is_active' => true, 'role' => User::ROLE_ADMIN]);

        $activeUsers = User::active()->get();
        $this->assertCount(2, $activeUsers);

        $adminUsers = User::withRole(User::ROLE_ADMIN)->get();
        $this->assertCount(1, $adminUsers);
    }

    /**
     * Test last login update
     */
    public function test_last_login_update(): void
    {
        $user = User::factory()->create(['last_login_at' => null]);

        $this->assertNull($user->last_login_at);

        $user->updateLastLogin();
        $user->refresh();

        $this->assertNotNull($user->last_login_at);
    }

    /**
     * Test user factory creates valid users
     */
    public function test_user_factory(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user);
        $this->assertNotEmpty($user->name);
        $this->assertNotEmpty($user->email);
        $this->assertEquals(User::ROLE_USER, $user->role);
        $this->assertTrue($user->is_active);
    }

    /**
     * Test user fillable attributes
     */
    public function test_fillable_attributes(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'hashed_password',
            'role' => User::ROLE_ADMIN,
            'is_active' => false,
            'timezone' => 'America/New_York',
            'avatar_url' => 'https://example.com/avatar.jpg',
            'provider' => 'google',
            'provider_id' => '123456789',
        ];

        $user = User::create($userData);

        $this->assertEquals($userData['name'], $user->name);
        $this->assertEquals($userData['email'], $user->email);
        $this->assertEquals($userData['role'], $user->role);
        $this->assertEquals($userData['is_active'], $user->is_active);
        $this->assertEquals($userData['timezone'], $user->timezone);
        $this->assertEquals($userData['avatar_url'], $user->avatar_url);
        $this->assertEquals($userData['provider'], $user->provider);
        $this->assertEquals($userData['provider_id'], $user->provider_id);
    }

    /**
     * Test hidden attributes
     */
    public function test_hidden_attributes(): void
    {
        $user = User::factory()->create();
        $userArray = $user->toArray();

        $this->assertArrayNotHasKey('password', $userArray);
        $this->assertArrayNotHasKey('remember_token', $userArray);
        $this->assertArrayNotHasKey('provider_token', $userArray);
    }
}
