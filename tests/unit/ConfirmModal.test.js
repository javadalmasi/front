import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ConfirmModal from '@/components/ConfirmModal.vue';

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

describe('ConfirmModal.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(ConfirmModal, {
      props: {
        message: 'Are you sure?'
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