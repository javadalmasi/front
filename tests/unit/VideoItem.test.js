import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import VideoItem from '@/components/VideoItem.vue';

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
    ...VideoItem,
    methods: {
      ...VideoItem.methods,
      getPreferenceBoolean: vi.fn().mockReturnValue(true),
      getPreferenceString: vi.fn().mockReturnValue('default'),
      ...additionalMethods
    }
  };
};

describe('VideoItem.vue', () => {
  it('renders properly', () => {
    const MockedComponent = createComponentWithMocks();
    const wrapper = shallowMount(MockedComponent, {
      props: {
        item: {
          videoId: 'test-id',
          title: 'Test Video',
          author: 'Test Author',
          duration: '10:00',
          viewCount: '1000',
          uploaded: '2023-01-01',
          thumbnail: 'test.jpg',
          type: 'video',
          url: '/test-url',
          substr: function(start, end) {
            return this.title.substring(start, end);
          }
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