import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Sidebar from '@/components/Sidebar.vue';

// Mock the $t function for internationalization
const mock$t = (key) => {
  const translations = {
    "info.user_dashboard_menu": "منوی داشبورد کاربر",
    "info.public": "آیتم‌های عمومی",
    "actions.categories": "دسته‌بندی‌ها",
    "titles.user_dashboard": "داشبورد کاربر",
    "titles.user_subscriptions": "اشتراک‌ها",
    "titles.user_history": "تاریخچه",
    "titles.user_likes": "پسندیده‌ها",
    "titles.user_dislikes": "نپسندیده‌ها",
    "titles.user_preferences": "تنظیمات",
    "titles.user_backup": "پشتیبان‌گیری"
  };
  return translations[key] || key;
};

// Mock router
const mockRouter = {
  push: vi.fn()
};

describe('Sidebar.vue', () => {
  it('renders correctly in open state', () => {
    const wrapper = mount(Sidebar, {
      props: {
        sidebarState: 'open',
        isWatchPage: false,
        theme: 'dark',
        isMobile: false
      },
      global: {
        mocks: {
          $route: { path: '/' },
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    // Check that the element has the expected class
    const sidebarDiv = wrapper.find('div');
    expect(sidebarDiv.classes()).toContain('w-64');
    expect(wrapper.find('[data-testid="theme-toggle"]').exists()).toBe(true);
  });

  it('renders correctly in semi-open state', () => {
    const wrapper = mount(Sidebar, {
      props: {
        sidebarState: 'semi-open',
        isWatchPage: false,
        theme: 'dark',
        isMobile: false
      },
      global: {
        mocks: {
          $route: { path: '/' },
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    const sidebarDiv = wrapper.find('div');
    expect(sidebarDiv.classes()).toContain('w-20');
  });

  it('renders correctly in closed state', () => {
    const wrapper = mount(Sidebar, {
      props: {
        sidebarState: 'closed',
        isWatchPage: false,
        theme: 'dark',
        isMobile: false
      },
      global: {
        mocks: {
          $route: { path: '/' },
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    const sidebarDiv = wrapper.find('div');
    expect(sidebarDiv.classes()).toContain('w-0');
    expect(sidebarDiv.classes()).toContain('overflow-hidden');
  });

  it('toggles theme when theme toggle is clicked', async () => {
    const wrapper = mount(Sidebar, {
      props: {
        sidebarState: 'open',
        isWatchPage: false,
        theme: 'dark',
        isMobile: false
      },
      global: {
        mocks: {
          $route: { path: '/' },
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    const themeToggle = wrapper.find('[data-testid="theme-toggle"]');
    await themeToggle.trigger('click');

    expect(wrapper.emitted('toggle-theme')).toBeTruthy();
  });

  it('displays public items when not on user dashboard route', () => {
    const wrapper = mount(Sidebar, {
      props: {
        sidebarState: 'open',
        isWatchPage: false,
        theme: 'dark',
        isMobile: false
      },
      global: {
        mocks: {
          $route: { path: '/' },
          $router: mockRouter,
          $t: mock$t
        }
      }
    });

    // Check that public section is visible
    expect(wrapper.text()).toContain('آیتم‌های عمومی');
  });
});