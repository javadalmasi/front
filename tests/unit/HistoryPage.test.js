import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import HistoryPage from '@/components/HistoryPage.vue';

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
    ...HistoryPage,
    methods: {
      ...HistoryPage.methods,
      getPreferenceBoolean: vi.fn().mockReturnValue(true),
      getPreferenceString: vi.fn().mockReturnValue('24'),
      getSiteName: vi.fn().mockReturnValue('vidioo'),
      ...additionalMethods
    }
  };
};

describe('HistoryPage.vue', () => {
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