import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ChannelItem from '@/components/ChannelItem.vue';

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
    ...ChannelItem,
    methods: {
      ...ChannelItem.methods,
      ...additionalMethods
    }
  };
};

describe('ChannelItem.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks({
      fetchSubscriptionStatus: vi.fn().mockResolvedValue(false),
      numberFormat: vi.fn().mockReturnValue('1K')
    });
    const wrapper = shallowMount(MockedComponent, {
      props: {
        item: {
          url: 'https://example.com/channel'
        }
      },
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