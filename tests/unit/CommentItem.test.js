import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import CommentItem from '@/components/CommentItem.vue';

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

describe('CommentItem.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(CommentItem, {
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