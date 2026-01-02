import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import PlaylistItem from '@/components/PlaylistItem.vue';

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
    ...PlaylistItem,
    methods: {
      ...PlaylistItem.methods,
      ...additionalMethods
    }
  };
};

describe('PlaylistItem.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks();
    const wrapper = shallowMount(MockedComponent, {
      props: {
        item: {
          thumbnail: 'test-thumbnail'
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