import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import FeedPage from '@/components/FeedPage.vue';

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
    ...FeedPage,
    methods: {
      ...FeedPage.methods,
      fetchFeed: vi.fn().mockResolvedValue({}),
      getPreferenceString: vi.fn().mockReturnValue('default'),
      isLiveStreamDisabled: vi.fn().mockReturnValue(false),
      ...additionalMethods
    }
  };
};

describe('FeedPage.vue', () => {
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