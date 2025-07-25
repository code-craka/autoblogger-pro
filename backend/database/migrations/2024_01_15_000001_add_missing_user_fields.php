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
            // Add missing fields for OAuth and user preferences
            $table->string('provider')->nullable()->after('email_verified_at');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('timezone')->default('UTC')->after('provider_id');
            $table->string('avatar_url')->nullable()->after('timezone');
            $table->timestamp('last_login_at')->nullable()->after('avatar_url');
            $table->boolean('is_active')->default(true)->after('last_login_at');

            // Add indexes for performance
            $table->index(['provider', 'provider_id']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['provider', 'provider_id']);
            $table->dropIndex(['is_active']);

            $table->dropColumn([
                'provider',
                'provider_id',
                'timezone',
                'avatar_url',
                'last_login_at',
                'is_active'
            ]);
        });
    }
};
