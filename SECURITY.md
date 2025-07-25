# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The AutoBlogger Pro team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@autoblogger-pro.com**

Please include the following information in your report:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Initial Response**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Investigation**: We will investigate and validate the vulnerability within 5 business days.
- **Resolution**: We will work to resolve critical vulnerabilities within 30 days of validation.
- **Disclosure**: We will coordinate with you on the disclosure timeline.

### Security Update Process

1. **Assessment**: We assess the severity and impact of the vulnerability.
2. **Fix Development**: We develop and test a fix for the vulnerability.
3. **Security Advisory**: We prepare a security advisory with details about the vulnerability.
4. **Patch Release**: We release a patch version containing the security fix.
5. **Public Disclosure**: We publicly disclose the vulnerability after users have had time to update.

### Severity Classification

We use the following severity levels:

- **Critical**: Vulnerabilities that can be exploited remotely without authentication
- **High**: Vulnerabilities that require authentication but can lead to system compromise
- **Medium**: Vulnerabilities that require local access or specific conditions
- **Low**: Minor security issues that have minimal impact

### Security Best Practices

When using AutoBlogger Pro, we recommend:

1. **Keep Updated**: Always use the latest version with security patches
2. **Secure Configuration**: Follow our security configuration guidelines
3. **Environment Variables**: Never commit sensitive environment variables
4. **HTTPS**: Always use HTTPS in production environments
5. **Database Security**: Secure your database with proper authentication and network restrictions
6. **Regular Backups**: Maintain regular backups of your data
7. **Access Control**: Implement proper user access controls and permissions

### Security Features

AutoBlogger Pro includes the following security features:

- **Authentication**: JWT-based authentication with Laravel Passport
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Proper CORS configuration
- **Password Security**: Bcrypt password hashing
- **OAuth Security**: Secure OAuth implementation for third-party authentication
- **SQL Injection Protection**: Eloquent ORM prevents SQL injection attacks
- **XSS Protection**: Input sanitization and output encoding

### Hall of Fame

We acknowledge security researchers who have helped improve AutoBlogger Pro's security:

*Currently empty - be the first to contribute!*

### Contact

For general security questions or concerns, please contact us at:
- **Email**: security@autoblogger-pro.com
- **GPG Key**: [Download our GPG key](https://autoblogger-pro.com/security.asc)

### Legal

We are committed to working with security researchers and will not pursue legal action against researchers who:
- Make a good faith effort to avoid privacy violations and disruptions to others
- Only interact with accounts you own or with explicit permission from the account holder
- Do not access, modify, or delete user data
- Contact us first before publicly disclosing any vulnerabilities

Thank you for helping keep AutoBlogger Pro and our users safe!
