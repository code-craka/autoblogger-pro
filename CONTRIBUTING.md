# Contributing to AutoBlogger Pro

First off, thank you for considering contributing to AutoBlogger Pro! It's people like you that make AutoBlogger Pro such a great tool for AI-powered content generation.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Explain why this enhancement would be useful** to most AutoBlogger Pro users.

### Pull Requests

The process described here has several goals:

- Maintain AutoBlogger Pro's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible AutoBlogger Pro
- Enable a sustainable system for AutoBlogger Pro's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md)
2. Follow the [styleguides](#styleguides)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing

## Development Setup

### Prerequisites

- Node.js 18+ with pnpm
- PHP 8.2+ with Composer
- PostgreSQL 14+
- Redis 6+
- Git

### Local Development

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/autoblogger-pro.git
   cd autoblogger-pro
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   # Configure your .env file
   php artisan key:generate
   php artisan migrate
   php artisan passport:install
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   cp .env.example .env.local
   # Configure your .env.local file
   pnpm dev
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Styleguides

### Git Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```bash
feat(auth): add Google OAuth integration
fix(api): resolve user registration validation error
docs(readme): update installation instructions
test(auth): add unit tests for login functionality
```

### TypeScript Styleguide

**Frontend (Next.js/React)**

- Use TypeScript strict mode
- Follow React best practices and hooks patterns
- Use functional components with proper TypeScript interfaces
- Implement proper error boundaries
- Use proper naming conventions (PascalCase for components, camelCase for functions)

```typescript
// Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  className?: string;
}

export function UserProfile({ user, onUpdate, className }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Component implementation
}

// Component should be exported as named export
export { UserProfile };
```

- Use React Hook Form with Zod for form validation
- Implement proper accessibility (ARIA labels, semantic HTML)
- Follow mobile-first responsive design
- Use Tailwind CSS with consistent design tokens

### PHP Styleguide

**Backend (Laravel)**

- Follow PSR-12 coding standards
- Use PHP 8.2+ features (typed properties, constructor promotion, etc.)
- Implement comprehensive error handling
- Follow Laravel conventions and best practices

```php
// Good
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Exceptions\AuthenticationException;
use Illuminate\Support\Facades\Hash;

final class AuthenticationService
{
    public function __construct(
        private UserRepository $userRepository,
        private TokenService $tokenService,
    ) {}

    public function authenticate(string $email, string $password): AuthenticationResult
    {
        $user = $this->userRepository->findByEmail($email);
        
        if (!$user || !Hash::check($password, $user->password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        return new AuthenticationResult(
            user: $user,
            token: $this->tokenService->createToken($user)
        );
    }
}
```

- Use strict types and return type declarations
- Implement proper service classes and dependency injection
- Write comprehensive tests with PHPUnit
- Use Laravel's built-in validation and authorization

### Testing Standards

**Frontend Testing**
```typescript
// Component Test Example
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';
import { AuthProvider } from '@/components/auth/auth-provider';

describe('LoginForm', () => {
  it('should validate email format', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

**Backend Testing**
```php
<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user',
                    'access_token',
                    'token_type',
                    'expires_at',
                ]);
    }
}
```

### Documentation Styleguide

- Use clear, concise language
- Include code examples for complex features
- Keep API documentation up to date
- Use proper markdown formatting
- Include screenshots for UI features

## Project Structure

### Frontend Structure
```
frontend/
├── app/                    # Next.js 15 App Router
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Authentication components
│   └── common/            # Shared components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api/              # API client functions
│   ├── validations/      # Zod schemas
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── __tests__/            # Test files
```

### Backend Structure
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/  # API controllers
│   │   ├── Middleware/   # Custom middleware
│   │   └── Requests/     # Form request validation
│   ├── Models/           # Eloquent models
│   ├── Services/         # Business logic services
│   └── Exceptions/       # Custom exceptions
├── database/
│   ├── migrations/       # Database migrations
│   ├── seeders/         # Database seeders
│   └── factories/       # Model factories
├── routes/              # Route definitions
└── tests/               # PHPUnit tests
```

## Release Process

### Version Numbers

We use [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

### Release Checklist

Before creating a release:

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version numbers are bumped
- [ ] Security vulnerabilities are addressed
- [ ] Performance benchmarks meet requirements

## Community

- Join our discussions on [GitHub Discussions](https://github.com/your-username/autoblogger-pro/discussions)
- Follow us on [Twitter](https://twitter.com/autoblogger_pro)
- Read our [blog](https://blog.autoblogger-pro.com) for development updates

## Questions?

Don't hesitate to ask questions by opening an issue or starting a discussion. We're here to help!

## License

By contributing to AutoBlogger Pro, you agree that your contributions will be licensed under the MIT License.
