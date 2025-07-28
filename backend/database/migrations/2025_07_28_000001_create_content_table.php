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
        Schema::create('content', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('topic');
            $table->longText('content');
            $table->text('meta_description')->nullable();
            $table->json('keywords')->nullable();
            $table->json('seo_data')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->enum('content_type', ['blog_post', 'article', 'custom'])->default('blog_post');
            $table->string('tone')->default('professional');
            $table->string('target_audience')->default('general');
            $table->integer('word_count')->nullable();
            $table->integer('tokens_used')->nullable();
            $table->decimal('generation_cost', 8, 4)->nullable();
            $table->string('ai_model')->nullable();
            $table->json('generation_options')->nullable();
            $table->json('quality_analysis')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'created_at']);
            $table->index('slug');
            $table->index('status');
            $table->index('content_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content');
    }
};
