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

describe('FeedPage.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(FeedPage, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
          $t: mock$t,
          fetchFeed: vi.fn().mockResolvedValue([]),
          getPreferenceString: vi.fn().mockReturnValue('default'),
          isLiveStreamDisabled: vi.fn().mockReturnValue(false),
          fetchDeArrowContent: vi.fn()
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});