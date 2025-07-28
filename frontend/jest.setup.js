/**
 * Jest Setup for AutoBlogger Pro Frontend Integration Tests
 * Configures testing environment and global test utilities
 */

import '@testing-library/jest-dom';

// Polyfill MessagePort for Node.js 22 compatibility
if (typeof MessagePort === 'undefined') {
  const { MessageChannel, MessagePort } = require('worker_threads');
  global.MessageChannel = MessageChannel;
  global.MessagePort = MessagePort;
}

// Polyfill fetch API for Node.js
if (!global.fetch) {
  const { fetch, Headers, Request, Response } = require('undici');
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock ResizeObserver for testing
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for testing
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
