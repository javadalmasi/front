import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/vue';
import * as matchers from '@testing-library/jest-dom/matchers';

// Mock window.matchMedia globally to handle the specific query used in WatchVideo
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => {
    // Handle the exact query used in WatchVideo component: "(max-width: 640px)"
    const isTargetQuery = query === "(max-width: 640px)";
    return {
      matches: isTargetQuery ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  })
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window properties that the app expects
Object.defineProperty(window, 'db', {
  value: null,
  writable: true,
});

// Mock TimeAgoConfig
window.TimeAgoConfig = {
  locale: 'fa'
};

// Mock i18n
window.i18n = {
  global: {
    locale: { value: 'fa' },
    availableLocales: ['fa'],
    setLocaleMessage: vi.fn(),
  }
};

// Extend Vitest's expect with DOM testing library matchers
expect.extend(matchers);

afterEach(() => {
  // Cleanup after each test
  cleanup();
});