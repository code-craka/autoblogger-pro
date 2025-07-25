/**
 * Jest Setup for AutoBlogger Pro Frontend Integration Tests
 * Configures testing environment and global test utilities
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment to support MSW
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add missing ReadableStream polyfill for undici
if (!global.ReadableStream) {
  const { ReadableStream } = require('node:stream/web');
  global.ReadableStream = ReadableStream;
}

// Add WritableStream polyfill if needed
if (!global.WritableStream) {
  const { WritableStream } = require('node:stream/web');
  global.WritableStream = WritableStream;
}

// Add TransformStream polyfill if needed
if (!global.TransformStream) {
  const { TransformStream } = require('node:stream/web');
  global.TransformStream = TransformStream;
}

// Polyfill fetch API for Node.js
if (!global.fetch) {
  const { fetch, Headers, Request, Response } = require('undici');
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
}

// Mock window.location for OAuth redirect tests
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock sessionStorage and localStorage
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Suppress console warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
