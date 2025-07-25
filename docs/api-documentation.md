# AutoBlogger Pro API Documentation

## Overview
AutoBlogger Pro API provides comprehensive authentication and user management endpoints for the AI-powered content generation platform.

**Base URL**: `http://localhost:8000/api`  
**API Version**: `v1`  
**Authentication**: Bearer Token (JWT via Laravel Passport)

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
