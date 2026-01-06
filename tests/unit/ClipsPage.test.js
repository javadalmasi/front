import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ClipsPage from '@/components/ClipsPage.vue';

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
  path: '/clip/test-clip-id',
  name: 'ClipsPage',
  query: {},
  params: { clipId: 'test-clip-id' }
};

// Create a wrapper component that extends the original component with mocked methods
const createComponentWithMocks = (additionalMethods = {}) => {
  return {
    ...ClipsPage,
    methods: {
      ...ClipsPage.methods,
      ...additionalMethods
    }
  };
};

describe('ClipsPage.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks({
      apiUrl: vi.fn().mockReturnValue('http://localhost:8000'),
      fetchJson: vi.fn().mockResolvedValue({ videoId: 'test-video-id' })
    });
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