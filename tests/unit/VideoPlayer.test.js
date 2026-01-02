import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import VideoPlayer from '@/components/VideoPlayer.vue';

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
    ...VideoPlayer,
    methods: {
      ...VideoPlayer.methods,
      getPreferenceBoolean: vi.fn().mockReturnValue(true),
      timeFormat: vi.fn().mockReturnValue('0:00'),
      ...additionalMethods
    }
  };
};

describe('VideoPlayer.vue', () => {
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