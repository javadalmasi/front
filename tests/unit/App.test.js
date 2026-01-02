import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

// Mock the virtual:pwa-register module
vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn()
}));

// Mock the $t function for internationalization
const mock$t = (key) => key;

// Mock TimeAgo for the component
const mockTimeAgo = {
  addLocale: vi.fn(),
  format: vi.fn()
};

// Mock i18n for the component
const mockI18n = {
  global: {
    locale: { value: 'fa' },
    availableLocales: ['fa'],
    setLocaleMessage: vi.fn(),
  }
};

describe('App.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(App, {
      global: {
        mocks: {
          $route: {
            path: '/',
            name: 'Home',
            params: {},
            query: {}
          },
          $router: {
            push: vi.fn(),
            replace: vi.fn(),
            go: vi.fn(),
            back: vi.fn(),
          },
          $t: mock$t,
          TimeAgo: mockTimeAgo,
          TimeAgoConfig: { locale: 'fa' }, // Add TimeAgoConfig to the component instance
          i18n: mockI18n,
          appMixin: {
            methods: {
              migrateOldStorageKeys: vi.fn()
            }
          }
        },
        components: {
          'router-view': {
            name: 'RouterView',
            template: '<div class="router-view"><slot /></div>',
            setup() {
              // Mock the v-slot="{ Component }" functionality
              return {
                Component: null
              };
            }
          }
        }
      }
    });

    // Check if the main container div exists
    expect(wrapper.classes()).toContain('reset');
    expect(wrapper.classes()).toContain('min-h-screen');
  });
});