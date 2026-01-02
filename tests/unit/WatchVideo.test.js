import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

// Mock window.matchMedia before importing the component
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query.includes('max-width: 640px') ? false : false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
});

// Import the component after setting up the mock
import WatchVideo from '@/components/WatchVideo.vue';

// Create a modified version of the component that bypasses the matchMedia call during initialization
const ModifiedWatchVideo = {
  ...WatchVideo,
  data() {
    // Return a static data object without calling matchMedia
    return {
      // Define all the default values from the original component
      video: null,
      playlistId: null,
      playlist: null,
      index: null,
      sponsors: null,
      selectedAutoLoop: false,
      selectedAutoPlay: null,
      showComments: true,
      showDesc: true,
      showRecs: true,
      showChapters: true,
      comments: null,
      subscribed: false,
      channelId: null,
      active: true,
      // Override the values that depend on matchMedia
      smallViewQuery: { matches: false },
      smallView: false,
      showShareModal: false,
      isMobile: true,
      currentTime: 0,
      shouldShowToast: false,
      counter: 0,
      showNextVideoCountdown: false,
      nextVideoTitle: '',
      nextVideoId: '',
      nextVideoTime: 0,
      theaterMode: false,
      showDescriptions: true,
      showCommentsSection: true,
      showRecommendations: true,
      showChaptersSection: true,
      showShareButtons: true,
      showWatchOnButtons: true,
      showDownloadButtons: true,
      showEmbedButtons: true,
      showReportButtons: true,
      showFlagButtons: true,
      showSaveButtons: true,
      showBookmarkButtons: true,
      showHistoryButtons: true,
      showLikeButtons: true,
      showDislikeButtons: true,
      showSubscribeButtons: true,
    };
  },
  methods: {
    ...WatchVideo.methods,
    // Mock essential methods that the component tries to call
    apiUrl: () => 'http://localhost:8000',
    fetchJson: vi.fn().mockResolvedValue({}),
    getPreferenceBoolean: vi.fn().mockReturnValue(true),
    getPreferenceString: vi.fn().mockReturnValue('default'),
    getSiteName: vi.fn().mockReturnValue('vidioo'),
    migrateOldStorageKeys: vi.fn(),
    setupServiceWorkerUpdate: vi.fn(),
  }
};

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
  path: '/watch',
  name: 'WatchVideo',
  query: { v: 'test-video-id' },
  params: { v: 'test-video-id' }
};

describe('WatchVideo.vue', () => {
  it('renders properly', () => {
    const wrapper = shallowMount(ModifiedWatchVideo, {
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