import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import LikesPage from '@/components/LikesPage.vue';

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

describe('LikesPage.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(LikesPage, {
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