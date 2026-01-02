import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import UserLikes from '@/components/UserLikes.vue';

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

describe('UserLikes.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(UserLikes, {
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