# Copilot Instructions

These project-wide Copilot instructions guide code generation and reviews for AutoBlogger Pro. Please follow these standards for all code suggestions, completions, and documentation.

---

## General Principles

- Write clear, maintainable, and well-documented code.
- Use modern, idiomatic patterns for all frameworks and languages.
- Prioritize security, performance, and accessibility in all implementations.
- Follow the project's planning and execution framework as described in `DevelopmentTaskExecutionGuide.md`.

---

## Frontend Standards

- Use **Next.js 15** with **App Router** and **TypeScript** (strict mode).
- Use **pnpm** as the package manager for all frontend dependencies and scripts.
- Use **Tailwind CSS** (with custom theme) and **shadcn/ui** component library.
- Implement **React 19** features and modern hooks.
- Follow a **mobile-first**, responsive, and accessible (WCAG 2.1 AA) design.
- Use **React Hook Form** and **Zod** for form management and validation.
- Use **ESLint** and **Prettier** for code style and formatting.
- Write unit tests with **Jest** and **React Testing Library**.
- Organize components for reusability; use prop interfaces and Storybook stories where applicable.
- Use environment variables for config and API endpoints.

---

## Backend Standards

- Use **Laravel 11** with **PHP 8.2+**.
- Use **PostgreSQL** for the database and **Redis** for caching/queues.
- Implement **SOLID principles** and modular, service-oriented architecture.
- Use **Laravel Passport** for authentication and **Laravel Socialite** for OAuth integrations.
- Write RESTful APIs with versioning (`/api/v1/`).
- Ensure 90%+ test coverage with **PHPUnit**.
- Document code with **PHPDoc** and generate API docs.
- Add comprehensive error handling, validation, and logging.
- Use **rate limiting** and follow **OWASP** security guidelines.

---

## DevOps & Automation

- Use **GitHub Actions** for CI/CD, including automated testing, code quality checks, security scanning, and deployment.
- Use **Docker** and **Kubernetes** for environment consistency and deployment.
- Automate database migrations and ensure zero-downtime deployments.
- Integrate monitoring and alerting (Laravel Telescope, Sentry, New Relic/DataDog).

---

## Quality and Documentation

- Always generate and maintain comprehensive unit and integration tests.
- Ensure code is reviewed for security, performance, and maintainability.
- Document all public interfaces and critical logic with inline comments and docblocks.
- Use Storybook for frontend component documentation where applicable.
- Maintain and update all documentation in the `/docs` folder.

---

## Communication & Process

- Update task status and progress in project management tools (Jira, GitHub Projects).
- Follow the change management and review process outlined in the project plan.
- Use the provided prompt templates for Copilot Chat and code generation.
- Reference the **DevelopmentTaskExecutionGuide.md** for detailed processes and best practices.

---

## Package Manager Note

- **All frontend scripts and dependencies must use `pnpm`.** Do not use `npm` or `yarn` in the frontend directory.
