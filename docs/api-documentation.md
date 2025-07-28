# AutoBlogger Pro API Documentation

## Overview
AutoBlogger Pro API provides comprehensive authentication, user management, and AI-powered content generation endpoints.

**Base URL**: `http://localhost:8000/api`  
**API Version**: `v1`  
**Authentication**: Bearer Token (JWT via Laravel Passport)

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management](#user-management)
3. [Content Generation](#content-generation)
4. [Content Management](#content-management)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication Endpoints

### Register User
Creates a new user account with email verification.

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "timezone": "UTC"
}
```

**Success Response** (201):
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "email_verified_at": null,
    "created_at": "2024-01-15T10:00:00.000000Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_at": "2024-01-15T18:00:00.000000Z"
}
```

**Error Response** (422):
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

### Login User
Authenticates user and returns access token.

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123!",
  "remember_me": false
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "email_verified_at": "2024-01-15T10:30:00.000000Z",
    "last_login_at": "2024-01-15T11:00:00.000000Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_at": "2024-01-15T19:00:00.000000Z"
}
```

**Error Responses**:
- **401**: Invalid credentials
- **403**: Account suspended
- **429**: Too many login attempts

---

### Logout User
Revokes the current access token.

**Endpoint**: `POST /api/v1/auth/logout`  
**Authentication**: Required

**Request Body**:
```json
{
  "logout_all_devices": false
}
```

**Success Response** (200):
```json
{
  "message": "Logout successful"
}
```

---

### Get Current User
Returns the authenticated user's information.

**Endpoint**: `GET /api/v1/auth/me`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "email_verified_at": "2024-01-15T10:30:00.000000Z",
    "last_login_at": "2024-01-15T11:00:00.000000Z",
    "timezone": "UTC",
    "avatar_url": null,
    "created_at": "2024-01-15T10:00:00.000000Z",
    "updated_at": "2024-01-15T11:00:00.000000Z"
  }
}
```

---

### Refresh Token
Refreshes the access token.

**Endpoint**: `POST /api/v1/auth/refresh`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "message": "Token refreshed successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_at": "2024-01-15T20:00:00.000000Z"
}
```

---

### Password Reset Request
Sends password reset link to user's email.

**Endpoint**: `POST /api/v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "Password reset link sent to your email"
}
```

**Error Responses**:
- **422**: Email validation failed
- **429**: Too many reset attempts

---

### Reset Password
Resets user password using reset token.

**Endpoint**: `POST /api/v1/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset_token_here",
  "email": "john@example.com",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

**Success Response** (200):
```json
{
  "message": "Password reset successful"
}
```

---

## OAuth Endpoints

### OAuth Redirect
Redirects to OAuth provider for authentication.

**Endpoint**: `GET /api/v1/auth/oauth/{provider}`  
**Providers**: `google`, `github`

**Success Response** (200):
```json
{
  "redirect_url": "https://accounts.google.com/oauth/authorize?...",
  "provider": "google"
}
```

---

### OAuth Callback
Handles OAuth provider callback and creates/authenticates user.

**Endpoint**: `GET /api/v1/auth/oauth/{provider}/callback`

**Success Response** (200):
```json
{
  "message": "OAuth authentication successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "email_verified_at": "2024-01-15T10:30:00.000000Z",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "provider": "google",
    "last_login_at": "2024-01-15T11:00:00.000000Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_at": "2024-01-15T19:00:00.000000Z",
  "is_new_user": false
}
```

---

## User Management Endpoints

### Get User Profile
Returns detailed user profile information.

**Endpoint**: `GET /api/v1/user/profile`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "email_verified_at": "2024-01-15T10:30:00.000000Z",
    "last_login_at": "2024-01-15T11:00:00.000000Z",
    "timezone": "UTC",
    "avatar_url": null,
    "provider": null,
    "created_at": "2024-01-15T10:00:00.000000Z",
    "updated_at": "2024-01-15T11:00:00.000000Z"
  }
}
```

---

### Update User Profile
Updates user profile information.

**Endpoint**: `PUT /api/v1/user/profile`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "timezone": "America/New_York",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Success Response** (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "user",
    "is_active": true,
    "email_verified_at": null,
    "timezone": "America/New_York",
    "avatar_url": "https://example.com/avatar.jpg",
    "updated_at": "2024-01-15T12:00:00.000000Z"
  }
}
```

---

### Change Password
Changes user password.

**Endpoint**: `POST /api/v1/user/change-password`  
**Authentication**: Required

**Request Body**:
```json
{
  "current_password": "OldPassword123!",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

**Success Response** (200):
```json
{
  "message": "Password changed successfully. Please log in again."
}
```

---

## System Health Endpoint

### Health Check
Returns system health status and component checks.

**Endpoint**: `GET /api/health`

**Success Response** (200):
```json
{
  "status": "ok",
  "service": "AutoBlogger Pro API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T12:00:00.000000Z",
  "environment": "local",
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 5.2,
      "connection": "pgsql"
    },
    "redis": {
      "status": "ok",
      "latency_ms": 1.8
    },
    "cache": {
      "status": "ok",
      "latency_ms": 2.1,
      "driver": "redis"
    },
    "queue": {
      "status": "ok",
      "connection": "redis"
    }
  }
}
```

---

## Content Generation

### Generate Single Content
Creates AI-generated content from a topic using OpenAI models.

**Endpoint**: `POST /api/v1/content/generate`

**Request Body**:
```json
{
  "topic": "The future of artificial intelligence in healthcare",
  "title": "AI Revolution in Healthcare: What's Next?",
  "content_type": "blog_post",
  "tone": "professional",
  "target_audience": "healthcare professionals",
  "word_count": 1500,
  "keywords": ["artificial intelligence", "healthcare", "medical AI"],
  "ai_model": "gpt-4-turbo-preview",
  "temperature": 0.7
}
```

**Success Response** (200):
```json
{
  "message": "Content generated successfully",
  "content": {
    "id": 1,
    "user_id": 1,
    "title": "AI Revolution in Healthcare: What's Next?",
    "slug": "ai-revolution-in-healthcare-whats-next",
    "topic": "The future of artificial intelligence in healthcare",
    "content": "# AI Revolution in Healthcare: What's Next?\n\nArtificial intelligence is transforming...",
    "meta_description": "Explore how AI is revolutionizing healthcare with advanced diagnostics, personalized treatment, and improved patient outcomes.",
    "keywords": ["artificial intelligence", "healthcare", "medical AI"],
    "status": "draft",
    "content_type": "blog_post",
    "tone": "professional",
    "target_audience": "healthcare professionals",
    "word_count": 1487,
    "tokens_used": 2234,
    "generation_cost": 0.0445,
    "ai_model": "gpt-4-turbo-preview",
    "quality_score": 0.89,
    "created_at": "2025-07-28T10:00:00.000000Z",
    "updated_at": "2025-07-28T10:00:00.000000Z"
  },
  "generation_stats": {
    "tokens_used": 2234,
    "model": "gpt-4-turbo-preview",
    "cost_estimate": {
      "total_cost": 0.0445,
      "input_cost": 0.0089,
      "output_cost": 0.0356,
      "total_tokens": 2234,
      "input_tokens": 445,
      "output_tokens": 1789,
      "currency": "USD"
    },
    "word_count": 1487,
    "reading_time": 7
  }
}
```

### Generate Bulk Content
Creates multiple pieces of content from an array of topics.

**Endpoint**: `POST /api/v1/content/bulk-generate`

**Request Body**:
```json
{
  "topics": [
    "Machine learning in finance",
    "Blockchain technology trends",
    "Cybersecurity best practices"
  ],
  "content_type": "article",
  "tone": "professional",
  "target_audience": "business professionals",
  "word_count": 1000,
  "keywords": ["technology", "innovation"],
  "ai_model": "gpt-4-turbo-preview"
}
```

**Success Response** (200):
```json
{
  "message": "Bulk content generation completed",
  "content": [
    {
      "id": 2,
      "title": "Machine Learning Transforms Financial Services",
      "topic": "Machine learning in finance",
      "status": "draft",
      "word_count": 1045
    },
    {
      "id": 3,
      "title": "Blockchain Technology: Key Trends to Watch",
      "topic": "Blockchain technology trends", 
      "status": "draft",
      "word_count": 987
    }
  ],
  "generation_stats": {
    "total_topics": 3,
    "successful_generations": 2,
    "failed_generations": 1,
    "total_tokens_used": 4567,
    "total_cost": 0.0912
  }
}
```

## Content Management

### List User Content
Retrieves a paginated list of user's content with optional filtering.

**Endpoint**: `GET /api/v1/content`

**Query Parameters**:
- `page` (integer, optional): Page number for pagination
- `per_page` (integer, optional): Items per page (default: 15, max: 50)
- `status` (string, optional): Filter by status (draft, published, archived)
- `content_type` (string, optional): Filter by content type
- `search` (string, optional): Search in title and content

**Success Response** (200):
```json
{
  "content": [
    {
      "id": 1,
      "title": "AI Revolution in Healthcare",
      "slug": "ai-revolution-in-healthcare",
      "status": "published",
      "content_type": "blog_post",
      "word_count": 1487,
      "quality_score": 0.89,
      "created_at": "2025-07-28T10:00:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

### Get Single Content
Retrieves a specific piece of content by ID.

**Endpoint**: `GET /api/v1/content/{id}`

**Success Response** (200):
```json
{
  "content": {
    "id": 1,
    "title": "AI Revolution in Healthcare",
    "content": "# AI Revolution in Healthcare\n\nFull content here...",
    "meta_description": "Explore how AI is revolutionizing healthcare...",
    "keywords": ["artificial intelligence", "healthcare"],
    "status": "published",
    "word_count": 1487,
    "quality_score": 0.89,
    "created_at": "2025-07-28T10:00:00.000000Z"
  }
}
```

### Update Content
Updates an existing piece of content.

**Endpoint**: `PUT /api/v1/content/{id}`

**Request Body**:
```json
{
  "title": "Updated Title",
  "content": "Updated content here...",
  "meta_description": "Updated meta description",
  "keywords": ["new", "keywords"],
  "status": "published"
}
```

**Success Response** (200):
```json
{
  "message": "Content updated successfully",
  "content": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content here...",
    "updated_at": "2025-07-28T11:00:00.000000Z"
  }
}
```

### Delete Content
Deletes a specific piece of content.

**Endpoint**: `DELETE /api/v1/content/{id}`

**Success Response** (200):
```json
{
  "message": "Content deleted successfully"
}
```

### Analyze Content Quality
Analyzes content quality using AI and provides improvement suggestions.

**Endpoint**: `POST /api/v1/content/{id}/analyze-quality`

**Success Response** (200):
```json
{
  "message": "Content analysis completed",
  "analysis": {
    "success": true,
    "analysis": "Overall Quality Score: 8.5/10\n\nStrengths:\n- Clear structure with logical flow\n- Good keyword density\n- Engaging introduction\n\nAreas for improvement:\n- Add more internal links\n- Include actionable takeaways\n- Expand conclusion section",
    "tokens_used": 456,
    "analyzed_at": "2025-07-28T10:30:00.000000Z"
  }
}
```

### Get Available AI Models
Retrieves list of available OpenAI models.

**Endpoint**: `GET /api/v1/content/models`

**Success Response** (200):
```json
{
  "success": true,
  "models": [
    {
      "id": "gpt-4-turbo-preview",
      "created": 1677649963,
      "owned_by": "openai"
    },
    {
      "id": "gpt-4",
      "created": 1687882411,
      "owned_by": "openai"
    },
    {
      "id": "gpt-3.5-turbo",
      "created": 1677610602,
      "owned_by": "openai"
    }
  ],
  "count": 3
}
```

### Get Content Statistics
Retrieves user's content generation statistics.

**Endpoint**: `GET /api/v1/content/stats`

**Success Response** (200):
```json
{
  "stats": {
    "total_content": 24,
    "published_content": 18,
    "draft_content": 6,
    "total_words": 48750,
    "total_tokens_used": 195000,
    "total_cost": 12.45,
    "content_by_type": {
      "blog_post": 15,
      "article": 8,
      "custom": 1
    },
    "content_by_month": {
      "2025-07": 8,
      "2025-06": 12,
      "2025-05": 4
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error message (debug mode only)"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

## Rate Limiting

### Authentication Endpoints
- **Login**: 5 attempts per IP per 5 minutes
- **Password Reset**: 3 attempts per IP per hour
- **Registration**: Standard API rate limit

### General API
- **Rate Limit**: 100 requests per minute per user
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in window
  - `X-RateLimit-Reset`: Unix timestamp when window resets

---

## Authentication Flow

### Standard Authentication
1. Register user or login with credentials
2. Receive access token and expiration time
3. Include token in Authorization header: `Bearer {token}`
4. Refresh token before expiration if needed

### OAuth Authentication
1. Redirect user to OAuth provider URL
2. User authorizes application with provider
3. Provider redirects to callback with authorization code
4. Backend exchanges code for user information and creates/authenticates user
5. Return access token for API access

---

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens have configurable expiration times
- Rate limiting prevents brute force attacks
- CORS is configured for allowed origins
- All API requests are logged for security monitoring
- OAuth tokens are encrypted before storage
