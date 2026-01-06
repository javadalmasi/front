import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/vue';
import * as matchers from '@testing-library/jest-dom/matchers';
import { config } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

// Create a minimal router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/user/gust', component: { template: '<div>Dashboard</div>' } },
    { path: '/user/gust/subscriptions', component: { template: '<div>Subscriptions</div>' } },
    { path: '/user/gust/history', component: { template: '<div>History</div>' } },
    { path: '/user/gust/likes', component: { template: '<div>Likes</div>' } },
    { path: '/user/gust/dislikes', component: { template: '<div>Dislikes</div>' } },
    { path: '/user/gust/preferences', component: { template: '<div>Preferences</div>' } },
    { path: '/user/gust/backup', component: { template: '<div>Backup</div>' } },
    { path: '/user/gust/danger', component: { template: '<div>Danger</div>' } },
    { path: '/:pathMatch(.*)*', component: { template: '<div>Not Found</div>' } }
  ]
});

// Register global components and directives
config.global.components = {
  'router-link': {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: {
      to: {
        type: [String, Object],
        required: true
      }
    }
  },
  'i18n-t': {
    name: 'I18nT',
    template: '<span><slot /></span>',
    props: {
      keypath: {
        type: String,
        required: true
      }
    }
  },
  'ErrorHandler': {
    name: 'ErrorHandler',
    template: '<div><slot /></div>'
  }
};

config.global.directives = {
  t: {
    mounted: () => {},
    updated: () => {}
  }
};

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