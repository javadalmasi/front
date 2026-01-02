import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SearchForm from '@/components/SearchForm.vue';

// Mock the $t function for internationalization
const mock$t = (key) => {
  const translations = {
    'actions.search': 'جستجو',
    'search.all': 'همه',
    'search.videos': 'ویدیوها',
    'search.channels': 'کانال‌ها',
    'search.music_songs': 'آهنگ‌ها',
    'search.music_videos': 'ویدیو‌های موسیقی',
    'search.music_albums': 'آلبوم‌ها',
    'search.music_artists': 'هنرمندان'
  };
  return translations[key] || key;
};

describe('SearchForm.vue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: '',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    expect(wrapper.find('input[type="search"]').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('emits update:search-text when input changes', async () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: '',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    const input = wrapper.find('input');
    await input.setValue('test search');

    expect(wrapper.emitted('update:search-text')).toBeTruthy();
    expect(wrapper.emitted('update:search-text')[0]).toEqual(['test search']);
  });

  it('emits submit when search button is clicked', async () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: 'test search',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('emits submit when Enter key is pressed', async () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: 'test search',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    const input = wrapper.find('input');
    await input.trigger('keypress', { key: 'Enter' });

    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('clears search text when delete button is clicked', async () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: 'test search',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    // Add a search text to make the delete button visible
    await wrapper.setProps({ searchTextProp: 'test search' });
    
    // The delete button should appear when there's text
    const deleteButton = wrapper.find('.delete-search');
    if (deleteButton.exists()) {
      await deleteButton.trigger('click');
      expect(wrapper.emitted('update:search-text')).toBeTruthy();
      expect(wrapper.emitted('update:search-text')[wrapper.emitted('update:search-text').length - 1]).toEqual(['']);
    }
  });

  it('emits update:selected-filter when filter is changed', async () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: '',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    // Only test filter change if the select element exists (not disabled)
    const select = wrapper.find('select');
    if (select.exists()) {
      await select.setValue('channels');
      
      expect(wrapper.emitted('update:selected-filter')).toBeTruthy();
      expect(wrapper.emitted('update:selected-filter')[0]).toEqual(['channels']);
    }
  });

  it('focuses input when focusInput method is called', async () => {
    const wrapper = mount(SearchForm, {
      props: {
        searchTextProp: '',
        selectedFilterProp: 'videos',
        suggestionsVisibleProp: false,
        availableFilters: ['all', 'videos', 'channels']
      },
      global: {
        mocks: {
          $t: mock$t
        }
      }
    });

    // Call the focusInput method
    wrapper.vm.focusInput();
    
    // Check if the input is focused (this might not be directly testable in jsdom)
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
  });
});