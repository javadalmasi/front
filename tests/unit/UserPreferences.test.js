import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import UserPreferences from '@/components/UserPreferences.vue';

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
    ...UserPreferences,
    methods: {
      ...UserPreferences.methods,
      ...additionalMethods
    }
  };
};

describe('UserPreferences.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks({
      getSiteName: vi.fn().mockReturnValue('Vidioo'),
      getPreferenceString: vi.fn().mockReturnValue('vp9,avc'),
      getPreferenceJSON: vi.fn().mockReturnValue([])
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