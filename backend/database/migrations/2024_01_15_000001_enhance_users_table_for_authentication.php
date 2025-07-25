<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Role and status fields
            $table->string('role')->default('user')->after('email_verified_at');
            $table->boolean('is_active')->default(true)->after('role');
            $table->timestamp('last_login_at')->nullable()->after('is_active');

            // User profile fields
            $table->string('timezone')->default('UTC')->after('last_login_at');
            $table->string('avatar_url')->nullable()->after('timezone');

            // OAuth fields
            $table->string('provider')->nullable()->after('avatar_url');
            $table->string('provider_id')->nullable()->after('provider');
            $table->text('provider_token')->nullable()->after('provider_id');

            // Add indexes for performance
            $table->index('role');
            $table->index('is_active');
            $table->index(['provider', 'provider_id']);
            $table->index('email_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['provider', 'provider_id']);
            $table->dropIndex(['email_verified_at']);

            $table->dropColumn([
                'role',
                'is_active',
                'last_login_at',
                'timezone',
                'avatar_url',
                'provider',
                'provider_id',
                'provider_token',
            ]);
        });
    }
};
