import { config } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import mixin from "../src/mixin";
import { vi } from "vitest";

const i18n = createI18n({
    legacy: false,
    locale: "fa",
    fallbackLocale: "fa",
    messages: {
        fa: {},
    },
});

config.global.plugins = [i18n];
config.global.mixins = [mixin];

config.global.mocks = {
    $route: {
        path: '/',
        params: {},
        query: {}
    },
    $router: {
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
    },
    fetchVideo: vi.fn(() => Promise.resolve({}))
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

window.db = {
    transaction: () => ({
        objectStore: () => ({
            get: () => ({}),
            put: () => ({}),
            delete: () => ({}),
            openCursor: () => ({
                onsuccess: () => {}
            })
        })
    })
};
