import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import SubscriptionsPage from '@/components/SubscriptionsPage.vue';

// Mock the $t function for internationalization
const mock$t = (key) => key;

// Mock router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
};

// Mock route
const mockRoute = {
  path: '/',
  name: 'Home',
  query: {}
};

// Create a wrapper component that extends the original component with mocked methods
const createComponentWithMocks = (additionalMethods = {}) => {
  return {
    ...SubscriptionsPage,
    methods: {
      ...SubscriptionsPage.methods,
      getLocalSubscriptions: vi.fn().mockReturnValue([]),
      ...additionalMethods
    }
  };
};

describe('SubscriptionsPage.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks();
    const wrapper = shallowMount(MockedComponent, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});