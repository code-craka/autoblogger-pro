# Contributing to AutoBlogger Pro

Thank you for your interest in contributing to AutoBlogger Pro! This document provides guidelines for contributing to our AI-powered content generation platform.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** ≥18.0.0
- **PHP** ≥8.2
- **PostgreSQL** ≥14
- **Redis** ≥6.0
- **pnpm** ≥8.0.0 (mandatory for frontend)
- **Composer** for PHP dependencies

### Development Setup

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
   php artisan key:generate
   php artisan migrate
   php artisan passport:install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   pnpm install
   cp .env.local.example .env.local
   ```

4. **Run Development Servers**
   ```bash
   # Backend (in backend directory)
   php artisan serve
   
   # Frontend (in frontend directory)
   pnpm dev
   ```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

- 🐛 **Bug Fixes**: Fixing issues or errors
- ✨ **New Features**: Adding new functionality
- 📚 **Documentation**: Improving or adding documentation
- 🎨 **UI/UX Improvements**: Enhancing user interface and experience
- ⚡ **Performance**: Optimizing performance and efficiency
- 🧪 **Tests**: Adding or improving test coverage
- 🔧 **DevOps**: Improving development and deployment processes

### Before You Start

1. **Check Existing Issues**: Look through [existing issues](https://github.com/code-craka/autoblogger-pro/issues) to avoid duplicates
2. **Create an Issue**: For new features or major changes, create an issue first to discuss
3. **Assign Yourself**: Comment on the issue to let others know you're working on it

### Branch Naming Convention

Use descriptive branch names following this pattern:

```
feature/short-description     # New features
bugfix/short-description      # Bug fixes
hotfix/critical-issue         # Critical production fixes
docs/improvement-area         # Documentation updates
test/component-name           # Test improvements
refactor/component-name       # Code refactoring
```

Examples:
- `feature/oauth-github-integration`
- `bugfix/subscription-payment-flow`
- `docs/api-documentation-update`

## 🔄 Pull Request Process

### 1. Preparation

- Ensure your fork is up to date with the main repository
- Create a new branch from `main` for your changes
- Make your changes following our coding standards

### 2. Before Submitting

- [ ] All tests pass: `pnpm test:all`
- [ ] Code follows style guidelines (ESLint, Prettier, PSR-12)
- [ ] No console.log or dd() statements in production code
- [ ] Documentation is updated for new features
- [ ] Changelog is updated for significant changes

### 3. Pull Request Template

When creating a PR, use this template:

```markdown
## 📝 Description

Brief description of changes made.

## 🔗 Related Issue

Fixes #(issue number)

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)

Add screenshots for UI changes.

## ✅ Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

### 4. Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: All tests must pass with >90% coverage
4. **Documentation**: Updates must be included for new features

## 📏 Coding Standards

### Frontend (Next.js + TypeScript)

```typescript
// Use TypeScript strict mode
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// Use React 19 features and modern patterns
const UserComponent: React.FC<UserProps> = ({ id, name, email }) => {
  // Component implementation
};

// Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Error occurred:', error);
  throw error;
}
```

**Frontend Standards:**
- Use **pnpm** for all package management
- Follow **ESLint** and **Prettier** configurations
- Use **React Hook Form** + **Zod** for forms
- Implement **shadcn/ui** components
- Follow **mobile-first** responsive design
- Ensure **WCAG 2.1 AA** accessibility compliance

### Backend (Laravel + PHP)

```php
<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserService
{
    /**
     * Create a new user with proper validation.
     *
     * @param array $data
     * @return User
     * @throws \Exception
     */
    public function createUser(array $data): User
    {
        try {
            // Implementation with proper error handling
            return User::create($validated);
        } catch (\Exception $e) {
            Log::error('User creation failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
```

**Backend Standards:**
- Follow **PSR-12** coding standards
- Use **SOLID** principles
- Implement **PHPDoc** comments
- Follow **Laravel** best practices
- Use **type hints** and **return types**
- Implement proper **error handling**

## 🧪 Testing Requirements

### Test Coverage Requirements

- **Minimum Coverage**: 90% for all new code
- **Unit Tests**: Required for all new functions/methods
- **Integration Tests**: Required for API endpoints
- **Feature Tests**: Required for user-facing features

### Frontend Testing

```typescript
// Example test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { UserComponent } from './UserComponent';

describe('UserComponent', () => {
  it('should render user information correctly', () => {
    const props = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserComponent {...props} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### Backend Testing

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created(): void
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure(['user', 'message']);
    }
}
```

### Running Tests

```bash
# Frontend tests
cd frontend
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# Backend tests
cd backend
php artisan test       # Run all tests
php artisan test --coverage  # With coverage
```

## 📚 Documentation

### Required Documentation

1. **Code Comments**: All public methods must have PHPDoc/JSDoc
2. **README Updates**: Update relevant README files for new features
3. **API Documentation**: Update OpenAPI specs for API changes
4. **User Guide**: Update user-facing documentation for new features

### Documentation Standards

```typescript
/**
 * Generates content using AI based on provided topic
 * @param topic - The topic to generate content for
 * @param options - Generation options (length, style, etc.)
 * @returns Promise resolving to generated content
 * @throws APIError when generation fails
 */
async function generateContent(topic: string, options: GenerationOptions): Promise<Content> {
  // Implementation
}
```

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `priority: low` - Low priority issue
- `frontend` - Frontend related issue
- `backend` - Backend related issue

## 🎯 Development Workflow

### Feature Development

1. **Planning**: Create or assign issue
2. **Branch**: Create feature branch
3. **Develop**: Implement with tests
4. **Test**: Ensure all tests pass
5. **Review**: Create pull request
6. **Deploy**: Merge after approval

### Bug Fixes

1. **Reproduce**: Confirm the bug exists
2. **Diagnose**: Identify root cause
3. **Fix**: Implement minimal fix
4. **Test**: Verify fix works
5. **Regress**: Ensure no new issues
6. **Deploy**: Merge after review

## 🛠️ Development Tools

### Required Tools

- **ESLint**: Code linting for JavaScript/TypeScript
- **Prettier**: Code formatting
- **PHPStan**: Static analysis for PHP
- **PHP CS Fixer**: PHP code style fixer

### Recommended IDE Extensions

**VS Code:**
- ESLint
- Prettier
- PHP Intelephense
- Laravel Extension Pack
- Tailwind CSS IntelliSense

### Git Hooks

We use pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
pnpm prepare

# Manual checks
pnpm lint:fix          # Fix frontend linting
composer fix-style     # Fix PHP style
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, PHP version
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Additional Context**: Any other relevant information

Use the bug report template when creating issues.

## 💡 Suggesting Enhancements

When suggesting enhancements:

1. **Check Existing**: Search for existing feature requests
2. **Use Template**: Use the feature request template
3. **Be Specific**: Provide detailed descriptions
4. **Consider Impact**: Think about backward compatibility
5. **Provide Examples**: Include use cases and examples

## 🏆 Recognition

Contributors will be recognized in:

- **Contributors Page**: Listed on our website
- **README**: Mentioned in acknowledgments
- **Releases**: Credited in release notes
- **Social Media**: Featured on our social channels

## 📞 Getting Help

If you need help:

- 💬 **Discord**: [Join our community](https://discord.gg/autoblogger-pro)
- 📧 **Email**: dev-support@autoblogger-pro.com
- 🐛 **Issues**: [Create an issue](https://github.com/code-craka/autoblogger-pro/issues/new)
- 📖 **Documentation**: Check our [docs](./docs)

## 📜 License

By contributing, you agree that your contributions will be licensed under the same [MIT License](./LICENSE) that covers the project.

---

Thank you for contributing to AutoBlogger Pro! Your efforts help make this project better for everyone. 🚀
