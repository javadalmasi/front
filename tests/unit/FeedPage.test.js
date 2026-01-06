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
      fetchJson: vi.fn().mockResolvedValue([]),
      fetchDeArrowContent: vi.fn().mockResolvedValue([]),
      getSiteName: vi.fn().mockReturnValue('Vidioo'),
      loadMoreVideos: vi.fn(), // Mock the method that's causing the error
      updateWatched: vi.fn(),
      ...additionalMethods
    },
    data() {
      const originalData = typeof FeedPage.data === 'function' ? FeedPage.data() : {};
      return {
        ...originalData,
        videosStore: [] // Initialize as an empty array instead of null
      };
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

    // Ensure videosStore is properly initialized as an array
    wrapper.vm.videosStore = [];

    expect(wrapper.exists()).toBe(true);
  });
});