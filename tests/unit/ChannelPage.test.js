import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ChannelPage from '@/components/ChannelPage.vue';

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
  path: '/channel/test-channel',
  name: 'ChannelPage',
  query: {},
  params: { path: 'test-channel' }
};

// Create a wrapper component that extends the original component with mocked methods
const createComponentWithMocks = (additionalMethods = {}) => {
  return {
    ...ChannelPage,
    methods: {
      ...ChannelPage.methods,
      ...additionalMethods
    }
  };
};

describe('ChannelPage.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks({
      apiUrl: vi.fn().mockReturnValue('http://localhost:8000'),
      fetchJson: vi.fn().mockResolvedValue({
        name: 'Test Channel',
        relatedStreams: [],
        tabs: []
      }),
      getPreferenceBoolean: vi.fn().mockReturnValue(false),
      getPreferenceString: vi.fn().mockReturnValue('default'),
      getSiteName: vi.fn().mockReturnValue('Vidioo'),
      updateWatched: vi.fn(),
      fetchDeArrowContent: vi.fn()
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