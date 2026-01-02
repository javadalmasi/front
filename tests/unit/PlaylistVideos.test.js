import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PlaylistVideos from '@/components/PlaylistVideos.vue';

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
    ...PlaylistVideos,
    methods: {
      ...PlaylistVideos.methods,
      updateScroll: vi.fn(), // Mock the updateScroll method that accesses offsetTop
      updateWatched: vi.fn(), // Mock the updateWatched method that was causing the error
      ...additionalMethods
    }
  };
};

describe('PlaylistVideos.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks();
    const wrapper = mount(MockedComponent, {
      props: {
        playlist: { name: 'Test Playlist', videos: [] },
        playlistId: 'test-id',
        selectedIndex: 0
      },
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    // Properly mock the $refs after mounting to simulate DOM elements
    Object.defineProperty(wrapper.vm, '$refs', {
      value: {
        scrollable: {
          scrollTop: 0,
          offsetTop: 0
        }
      },
      writable: true
    });

    expect(wrapper.exists()).toBe(true);
  });
});