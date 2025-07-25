## AutoBlogger Pro - Development Task Execution Guide

### Overview
This document provides comprehensive guidance for using GitHub Copilot (and related tools) to execute the development tasks defined in our project plan. Each task includes specific prompts, execution strategies, and quality assurance steps.

---

## Copilot Setup and Configuration

### 1. Installation and Authentication

```bash
# Ensure you have GitHub Copilot enabled in your IDE (VSCode, JetBrains, or Neovim)
# For VSCode, install the Copilot extension from the marketplace

# Authenticate with GitHub
gh auth login

# Set up project context (optional, for Copilot Chat)
# In VSCode, use the Copilot Chat sidebar to set project context

# Configure project settings
# For frontend, we use pnpm as the package manager
cd frontend
pnpm install
```

### 2. Project Context Configuration

Create a `.github/copilot-instructions.md` file to guide Copilot's suggestions for this project:

```markdown
# Copilot Instructions

- Use Next.js 15 with pnpm for the frontend.
- Use Laravel 11 and PHP 8.2+ for the backend.
- Write TypeScript for all frontend code.
- Follow Prettier and ESLint for code style.
- Use Jest for frontend testing, PHPUnit for backend.
- Document code with JSDoc (frontend) and PHPDoc (backend).
- Adhere to accessibility standards (WCAG 2.1 AA).
```

---

## Task Execution Framework

### 1. Prompt Engineering Strategy

#### Task-Specific Prompt Templates

##### Backend API Development Template
```
You are a Senior Laravel Developer building AutoBlogger Pro, an AI content generation platform.

CONTEXT:
- Building [TASK_NAME] as part of [EPIC_NAME]
- Target: [BUSINESS_OBJECTIVE]
- Integration: [INTEGRATION_REQUIREMENTS]

REQUIREMENTS:
[ACCEPTANCE_CRITERIA]

TECHNICAL CONSTRAINTS:
- Laravel 11 with PHP 8.2+
- PostgreSQL database
- Redis for caching/queues
- Follow SOLID principles
- 90%+ test coverage required
- RESTful API design

DELIVERABLES:
1. Complete implementation with error handling
2. Comprehensive unit tests
3. API documentation
4. Database migrations (if needed)
5. Integration tests

Please implement this following Laravel best practices, with proper validation, error handling, and comprehensive testing.
```

##### Frontend Component Development Template
```
You are a Senior React/Next.js Developer building AutoBlogger Pro, competing with AutoBlogging.ai.

CONTEXT:
- Building [COMPONENT_NAME] for [FEATURE_AREA]
- User Story: [USER_STORY]
- Design Requirements: [UI_UX_SPECS]

REQUIREMENTS:
[ACCEPTANCE_CRITERIA]

TECHNICAL CONSTRAINTS:
- Next.js 15 with App Router
- TypeScript with strict mode
- pnpm as the package manager
- Tailwind CSS + shadcn/ui components
- React 19 features
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)

DELIVERABLES:
1. Reusable React component with TypeScript
2. Comprehensive prop interfaces
3. Unit tests with React Testing Library
4. Storybook stories (if applicable)
5. Responsive styling

Create a production-ready component following React best practices and modern patterns.
```

### 2. Execution Workflow

#### Standard Task Execution Process

```bash
# 1. Create task branch
git checkout -b task/BE-3.1.F1-openai-client-setup

# 2. Use Copilot Chat or inline suggestions to scaffold and implement the task

# 3. Review and iterate
# Use Copilot to generate and refine tests, formatting, and documentation

# 4. Commit and push
git add .
git commit -m "feat(BE-3.1.F1): implement OpenAI client setup with authentication"
git push origin task/BE-3.1.F1-openai-client-setup
```

---

## Phase 1 Task Execution

### Epic 1: Project Foundation

#### Task BE-1.1: Laravel 11 API Foundation

**Copilot Prompt**:
```markdown
You are setting up the Laravel 11 foundation for AutoBlogger Pro, an AI content generation platform.

OBJECTIVE: Create a robust Laravel 11 API foundation with authentication, CORS, and database configuration.

REQUIREMENTS:
- Laravel 11 project with API-first architecture
- PostgreSQL database configuration
- Laravel Passport for API authentication
- CORS configuration for Next.js frontend (localhost:3000)
- Basic middleware setup (rate limiting, authentication)
- API versioning structure (/api/v1/)
- Environment-based configuration
- Basic health check endpoint

DELIVERABLES:
1. Complete Laravel 11 setup with composer.json
2. Database configuration and migration setup
3. Passport authentication configuration
4. CORS middleware configuration
5. API route structure with versioning
6. Basic middleware for rate limiting
7. Health check endpoint with system status
8. Comprehensive .env.example file

TECHNICAL SPECIFICATIONS:
- Use Laravel 11 features (new application structure)
- Follow API Resource pattern for responses
- Implement proper error handling middleware
- Add request validation for all endpoints
- Include comprehensive logging setup

Execute this setup following Laravel 11 best practices and modern API development standards.
```

---

#### Task FE-1.1: Next.js 15 Project Initialization

**Copilot Prompt**:
```markdown
You are setting up the Next.js 15 foundation for AutoBlogger Pro frontend.

OBJECTIVE: Create a modern Next.js 15 project with TypeScript, Tailwind CSS, and essential configurations.

REQUIREMENTS:
- Next.js 15 with App Router and TypeScript
- Tailwind CSS with custom theme configuration
- shadcn/ui component library setup
- ESLint and Prettier configuration
- Environment configuration for development/production
- Basic layout components and routing structure
- Dark/light theme support
- Responsive design foundation

DELIVERABLES:
1. Next.js 15 project with proper TypeScript configuration
2. Tailwind CSS setup with custom design system
3. shadcn/ui installation and configuration
4. Basic layout components (Header, Footer, Sidebar)
5. Authentication layout structure
6. Theme provider with dark/light mode
7. API client setup for Laravel backend
8. Responsive navigation components

TECHNICAL SPECIFICATIONS:
- Use App Router with proper directory structure
- Implement TypeScript strict mode
- Configure path aliases for clean imports
- Set up environment variables handling
- Create reusable component architecture
- Implement proper error boundaries

Create a scalable and maintainable frontend foundation using pnpm as the package manager.
```

---

### Epic 2: User Authentication System

#### Task BE-2.1: User Authentication API

**Copilot Prompt**:
```markdown
You are implementing the complete user authentication system for AutoBlogger Pro.

OBJECTIVE: Build a secure, comprehensive authentication API with JWT tokens and OAuth integration.

REQUIREMENTS:
- User registration with email verification
- Login/logout with JWT token management
- Password reset functionality
- Google OAuth integration
- GitHub OAuth integration
- User profile CRUD operations
- Role-based access control (Admin, User)
- API rate limiting for auth endpoints
- Security best practices implementation

DELIVERABLES:
1. User model with proper relationships and scopes
2. Authentication controller with all endpoints
3. OAuth service integration (Google, GitHub)
4. Email verification system
5. Password reset functionality
6. JWT token management with refresh tokens
7. Rate limiting middleware for auth routes
8. Comprehensive validation rules
9. Security middleware and policies
10. Complete test suite (>90% coverage)

TECHNICAL SPECIFICATIONS:
- Use Laravel Passport for JWT authentication
- Implement Laravel Socialite for OAuth
- Create custom rate limiting for auth endpoints
- Add comprehensive input validation
- Implement proper error handling and responses
- Create audit logging for authentication events
- Follow OWASP security guidelines

API ENDPOINTS TO CREATE:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email/{id}/{hash}
- GET /api/v1/auth/oauth/{provider}
- GET /api/v1/auth/oauth/{provider}/callback
- GET /api/v1/user/profile
- PUT /api/v1/user/profile

Implement with comprehensive error handling, validation, and security measures.
```

---

#### Task FE-2.1: Authentication UI Components

**Copilot Prompt**:
```markdown
You are creating the authentication UI components for AutoBlogger Pro frontend.

OBJECTIVE: Build comprehensive authentication interfaces with modern UX patterns.

REQUIREMENTS:
- Login form with email/password validation
- Registration form with email verification flow
- Password reset functionality
- OAuth integration (Google, GitHub) UI
- User profile management interface
- Responsive design for all screen sizes
- Form validation with real-time feedback
- Loading states and error handling
- Accessibility compliance (WCAG 2.1 AA)

DELIVERABLES:
1. Login component with form validation
2. Registration component with multi-step flow
3. Password reset component
4. OAuth integration buttons
5. User profile management interface
6. Form validation hooks and utilities
7. Authentication layout components
8. Error handling and success messaging
9. Loading states and animations
10. Comprehensive TypeScript interfaces

TECHNICAL SPECIFICATIONS:
- Use React Hook Form for form management
- Implement Zod for schema validation
- Create reusable form components
- Use shadcn/ui components for consistency
- Implement proper error boundaries
- Add loading states with skeleton components
- Ensure mobile-first responsive design
- Include proper ARIA labels and roles

COMPONENTS TO CREATE:
- LoginForm with validation
- RegisterForm with email verification
- ForgotPasswordForm
- ResetPasswordForm
- OAuthButtons (Google, GitHub)
- UserProfile with edit functionality
- AuthLayout wrapper
- ProtectedRoute component

Create modern, accessible, and user-friendly authentication experiences.
```

---

### Epic 3: Core AI Integration

#### Task BE-3.1.F1: OpenAI Client Setup

**Copilot Prompt**:
```markdown
You are implementing the OpenAI client foundation for AutoBlogger Pro's AI content generation.

OBJECTIVE: Create a robust OpenAI client with proper authentication, configuration, and error handling.

REQUIREMENTS:
- OpenAI SDK installation and configuration
- API key management with environment variables
- Basic client connection and testing
- SSL/TLS security verification
- Configuration for different environments (dev/staging/prod)
- Error handling for authentication failures
- Logging and monitoring setup

DELIVERABLES:
1. OpenAI service class with proper initialization
2. Configuration management for API keys
3. Connection testing and validation
4. Error handling and retry logic
5. Logging integration for API calls
6. Unit tests for client functionality
7. Environment-based configuration
8. API health check functionality

TECHNICAL SPECIFICATIONS:
- Use official OpenAI PHP SDK
- Implement singleton pattern for client instance
- Add comprehensive error handling
- Create logging for all API interactions
- Implement connection pooling if applicable
- Add timeout and retry configurations
- Follow Laravel service provider pattern

SERVICE STRUCTURE:
```php
class OpenAIService
{
    public function __construct()
    public function generateContent(string $prompt, array $options = []): string
    public function validateConnection(): bool
    public function getUsage(): array
    public function healthCheck(): array
}
```

Create a reliable foundation for all AI operations with proper error handling and monitoring.
```

---

#### Task BE-3.1.C1: Basic Content Generation

**Copilot Prompt**:
```markdown
You are implementing the core content generation functionality for AutoBlogger Pro.

OBJECTIVE: Create a content generation service that transforms topics into SEO-optimized blog articles.

REQUIREMENTS:
- Topic-to-article generation with customizable prompts
- Prompt template system for different content types
- Basic error handling for API failures
- Response parsing and content formatting
- Content length validation and optimization
- Integration with OpenAI service
- Content quality scoring
- Usage tracking for billing

DELIVERABLES:
1. ContentGenerationService with core logic
2. Prompt template system
3. Content formatting and validation
4. Error handling and fallback mechanisms
5. Content quality scoring algorithm
6. Usage tracking and logging
7. Database models for content storage
8. API endpoints for content generation
9. Comprehensive test suite
10. Performance optimization

TECHNICAL SPECIFICATIONS:
- Create modular prompt templates
- Implement content validation rules
- Add comprehensive error handling
- Create audit trails for all generations
- Implement caching for repeated requests
- Add rate limiting per user tier
- Follow repository pattern for data access

API ENDPOINTS:
- POST /api/v1/content/generate
- GET /api/v1/content/{id}
- GET /api/v1/content/history
- DELETE /api/v1/content/{id}

DATABASE MODELS:
- Content (id, user_id, topic, content, mode, status, created_at)
- ContentGeneration (id, content_id, prompt, response, tokens_used, cost)

PROMPT TEMPLATES:
- Blog article template
- SEO-optimized content template
- Quick content template
- Professional content template

Implement with focus on quality, reliability, and user experience.
```

---

### Advanced Task Execution

#### Complex Integration Task: BE-6.1.C3 - Subscription Lifecycle

**Copilot Prompt**:
```markdown
You are implementing the complete subscription lifecycle management for AutoBlogger Pro using Stripe.

OBJECTIVE: Build a comprehensive subscription system handling the complete customer lifecycle from trial to cancellation.

CONTEXT:
This is a critical revenue-generating component that must handle:
- Multiple subscription tiers (Starter $49, Pro $149, Enterprise $399)
- Trial periods and conversions
- Upgrades/downgrades with proration
- Failed payment handling and dunning
- Subscription pausing and reactivation
- Cancellation with retention flows

REQUIREMENTS:
- Subscription creation and activation
- Trial period management (14-day free trial)
- Upgrade/downgrade with automatic proration
- Subscription cancellation with grace periods
- Failed payment handling with retry logic
- Dunning management for delinquent accounts
- Subscription pausing and reactivation
- Usage-based billing integration
- Comprehensive webhook handling
- Audit logging for all billing events

DELIVERABLES:
1. SubscriptionService with complete lifecycle methods
2. Stripe webhook handlers for all subscription events
3. Billing models and relationships
4. Subscription tier and feature management
5. Proration calculation logic
6. Failed payment retry and dunning system
7. Subscription analytics and reporting
8. API endpoints for subscription management
9. Email notifications for billing events
10. Comprehensive test suite with Stripe test scenarios

TECHNICAL SPECIFICATIONS:
- Use Stripe PHP SDK with webhook handling
- Implement idempotent webhook processing
- Create proper database relationships
- Add comprehensive audit logging
- Implement retry logic for failed operations
- Follow event-driven architecture
- Ensure PCI compliance standards

STRIPE INTEGRATION COMPONENTS:
```php
class SubscriptionService
{
    public function createSubscription(User $user, string $priceId, array $options = []): Subscription
    public function upgradeSubscription(Subscription $subscription, string $newPriceId): Subscription
    public function downgradeSubscription(Subscription $subscription, string $newPriceId): Subscription
    public function cancelSubscription(Subscription $subscription, bool $immediately = false): Subscription
    public function pauseSubscription(Subscription $subscription): Subscription
    public function resumeSubscription(Subscription $subscription): Subscription
    public function handleFailedPayment(Subscription $subscription): void
    public function processProration(Subscription $subscription, string $newPriceId): array
}
```

WEBHOOK EVENTS TO HANDLE:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- invoice.finalized
- customer.subscription.trial_will_end

DATABASE SCHEMA:
```sql
-- Subscriptions table
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    status VARCHAR(50),
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Subscription items table for usage-based billing
CREATE TABLE subscription_items (
    id BIGINT PRIMARY KEY,
    subscription_id BIGINT,
    stripe_subscription_item_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

Build a production-ready subscription system that handles all edge cases and provides excellent user experience.
```

---

#### Bulk Processing Task: BE-8.1 - Complete Implementation

**Copilot Prompt**:
```markdown
You are implementing the complete bulk content generation system for AutoBlogger Pro.

OBJECTIVE: Build a scalable, robust bulk processing system that can handle thousands of content generation requests efficiently.

CONTEXT:
This is a key competitive differentiator against AutoBlogging.ai. The system must:
- Process CSV uploads with thousands of topics
- Handle concurrent generation requests efficiently
- Provide real-time progress tracking
- Implement intelligent rate limiting across AI providers
- Ensure system stability under high load
- Provide detailed error reporting and recovery

REQUIREMENTS:
- CSV upload parsing and validation (up to 10,000 topics)
- Queue-based batch processing with Laravel Horizon
- Real-time progress tracking with WebSocket updates
- Intelligent load balancing across AI providers
- Retry logic for failed generations
- Partial batch completion handling
- Resource optimization for memory and CPU
- Detailed analytics and reporting
- Error handling and user notifications

DELIVERABLES:
1. BulkGenerationService with complete workflow
2. CSV parsing and validation system
3. Queue job architecture with Laravel Horizon
4. Real-time progress tracking with WebSocket
5. Multi-provider load balancing
6. Error handling and retry mechanisms
7. Resource monitoring and optimization
8. Batch analytics and reporting
9. User interface for bulk operations
10. Comprehensive testing suite with performance tests

SYSTEM ARCHITECTURE:
```php
class BulkGenerationService
{
    public function processCsvUpload(UploadedFile $file, User $user): Batch
    public function createBatchJobs(Batch $batch, array $topics): void
    public function trackBatchProgress(Batch $batch): array
    public function handleJobFailure(ContentGenerationJob $job, Exception $exception): void
    public function optimizeResourceUsage(): void
    public function generateBatchReport(Batch $batch): array
}

class ContentGenerationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function handle(): void
    public function failed(Exception $exception): void
    public function retryUntil(): DateTime
}
```

QUEUE CONFIGURATION:
```php
// config/queue.php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 300,
        'block_for' => null,
        'after_commit' => false,
        'batch' => [
            'database' => env('DB_CONNECTION', 'mysql'),
            'table' => 'job_batches',
        ],
    ],
],
```

BATCH PROCESSING WORKFLOW:
1. CSV Upload and Validation
2. Batch Creation with Job Spawning
3. Queue Processing with Rate Limiting
4. Progress Tracking and WebSocket Updates
5. Error Handling and Retry Logic
6. Completion Notification and Reporting

PERFORMANCE REQUIREMENTS:
- Handle 10,000+ topics per batch
- Process 100+ concurrent jobs
- Real-time progress updates (<1 second latency)
- Memory usage <2GB for large batches
- 99% success rate with retry logic

Build an enterprise-grade bulk processing system that can scale to millions of content pieces.
```

---

## Quality Assurance with Copilot

### 1. Automated Testing Generation

**Test Generation Prompt**:
```markdown
You are creating comprehensive test suites for AutoBlogger Pro components.

OBJECTIVE: Generate complete test coverage for [COMPONENT_NAME] following testing best practices.

REQUIREMENTS:
- Unit tests with >90% code coverage
- Integration tests for external dependencies
- Feature tests for API endpoints
- Performance tests for critical paths
- Security tests for authentication/authorization
- Error scenario testing
- Edge case validation

DELIVERABLES:
1. PHPUnit tests for Laravel components
2. Jest tests for React components
3. Integration tests with database
4. API endpoint tests with various scenarios
5. Performance benchmarks
6. Security vulnerability tests
7. Mock implementations for external services
8. Test data factories and seeders

Create comprehensive tests that ensure reliability and maintainability.
```

### 2. Code Review Automation

**Code Review Prompt**:
```markdown
You are performing a comprehensive code review for AutoBlogger Pro.

REVIEW CRITERIA:
- Code quality and adherence to standards
- Security vulnerabilities and best practices
- Performance optimization opportunities
- Testing coverage and quality
- Documentation completeness
- Architecture and design patterns
- Error handling and edge cases

DELIVERABLES:
1. Detailed code review report
2. Security vulnerability assessment
3. Performance optimization recommendations
4. Code quality improvements
5. Testing gap analysis
6. Documentation updates needed
7. Refactoring opportunities

Provide actionable feedback for improving code quality and maintainability.
```

---

## Monitoring and Optimization

### 1. Performance Monitoring Setup

**Monitoring Implementation Prompt**:
```markdown
You are implementing comprehensive monitoring for AutoBlogger Pro production deployment.

OBJECTIVE: Create monitoring, logging, and alerting systems for production reliability.

REQUIREMENTS:
- Application performance monitoring (APM)
- Error tracking and alerting
- Database query optimization
- API endpoint monitoring
- User experience tracking
- Cost monitoring for AI providers
- Security monitoring and alerts

DELIVERABLES:
1. Laravel Telescope for local development
2. Production APM integration (New Relic/DataDog)
3. Error tracking with Sentry
4. Database query monitoring
5. API response time tracking
6. User analytics and behavior tracking
7. Cost optimization alerts
8. Security monitoring dashboard

Build production-ready monitoring that ensures system reliability and user satisfaction.
```

---

## Deployment Automation

### 1. CI/CD Pipeline Setup

**Deployment Pipeline Prompt**:
```markdown
You are creating a complete CI/CD pipeline for AutoBlogger Pro deployment.

OBJECTIVE: Automate testing, building, and deployment processes for reliable software delivery.

REQUIREMENTS:
- Automated testing on every commit
- Code quality checks and security scanning
- Automated deployment to staging/production
- Database migration automation
- Zero-downtime deployment strategy
- Rollback capabilities
- Environment-specific configurations

DELIVERABLES:
1. GitHub Actions workflow for CI/CD
2. Docker containerization setup
3. Kubernetes deployment manifests
4. Database migration automation
5. Environment configuration management
6. Monitoring and alerting integration
7. Automated security scanning
8. Performance testing automation

Create a robust deployment pipeline that ensures reliable and secure software delivery.
```

---

## Best Practices for Copilot Usage

### 1. Prompt Optimization

#### Effective Prompt Structure
```markdown
## Context Setting
[Business objective and technical context]

## Requirements
[Specific, measurable requirements]

## Technical Constraints
[Framework versions, patterns, standards]

## Deliverables
[Numbered list of expected outputs]

## Quality Standards
[Testing, documentation, performance requirements]

## Success Criteria
[Definition of done]
```

#### Common Prompt Patterns
- **Incremental Development**: Break complex tasks into smaller prompts
- **Context Preservation**: Reference previous implementations
- **Quality Gates**: Include testing and validation requirements
- **Documentation**: Always request comprehensive documentation

### 2. Code Quality Assurance

#### Pre-Execution Checklist
- [ ] Clear acceptance criteria defined
- [ ] Dependencies and integrations specified
- [ ] Testing requirements included
- [ ] Performance criteria established
- [ ] Security considerations addressed

#### Post-Execution Validation
- [ ] Code review against requirements
- [ ] Automated test execution
- [ ] Performance benchmarking
- [ ] Security vulnerability scanning
- [ ] Documentation completeness check

### 3. Iteration and Refinement

#### Feedback Loop Process
1. **Execute**: Use Copilot to generate code with initial prompt
2. **Review**: Analyze generated code against requirements
3. **Refine**: Adjust prompt based on gaps or issues
4. **Re-execute**: Generate improved implementation
5. **Validate**: Test and verify final output

#### Common Refinement Areas
- **Error Handling**: Ensure comprehensive error scenarios
- **Edge Cases**: Address boundary conditions
- **Performance**: Optimize for scale and efficiency
- **Security**: Validate authentication and authorization
- **Testing**: Ensure adequate test coverage

---

## Success Metrics and Monitoring

### 1. Development Velocity Metrics

#### Copilot Effectiveness
- **Code Generation Speed**: Lines of code per hour
- **First-Pass Quality**: Percentage of code requiring minimal revision
- **Test Coverage**: Automated test coverage percentage
- **Bug Rate**: Post-deployment issues per feature

#### Team Productivity
- **Task Completion Rate**: Tasks completed per sprint
- **Code Review Efficiency**: Time from development to deployment
- **Quality Score**: Combined metric of functionality, performance, and maintainability

### 2. Quality Assurance Metrics

#### Code Quality
- **Cyclomatic Complexity**: Maintainability score
- **Code Duplication**: Percentage of duplicated code
- **Technical Debt Ratio**: Time spent on maintenance vs. new features
- **Security Vulnerabilities**: Number and severity of security issues

#### System Performance
- **Response Time**: API endpoint performance
- **Error Rate**: Application error percentage
- **Uptime**: System availability percentage
- **Resource Utilization**: CPU, memory, and database efficiency

---

## Frontend Package Manager Instruction

**Note:**  
The project will use **pnpm** as the package manager for all frontend dependencies and scripts. Please use `pnpm install`, `pnpm run dev`, and other pnpm commands instead of npm or yarn in the frontend directory.

---

This comprehensive guide provides the framework for leveraging GitHub Copilot to accelerate AutoBlogger Pro development while maintaining high quality standards. The combination of specific prompts, quality assurance processes, and monitoring ensures successful task execution and project delivery.