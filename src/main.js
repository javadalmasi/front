import { createApp } from "vue";
import router from "@/router/router.js";
import App from "./App.vue";

import { createI18n } from "vue-i18n";
import faLocale from "@/locales/fa.json";
import "vazirmatn/Vazirmatn-font-face.css";
import "@unocss/reset/tailwind.css";
import "uno.css";
import "@/assets/fonts.css";
import mixin from "./mixin";

// Import the i18n-t component and t directive directly
import { Translation } from "vue-i18n";

const i18n = createI18n({
    legacy: false,
    locale: "fa",
    fallbackLocale: "fa",
    messages: {
        fa: faLocale,
    },
    globalInstall: true,  // Enable global component installation
    allowComposition: true,  // Allow composition API usage,
});

window.i18n = i18n;

window.appMixin = mixin;

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mixin(mixin);

// Register the i18n-t component globally
app.component('i18n-t', Translation);

// Register the v-t directive globally - custom implementation to handle translation
app.directive('t', {
  mounted(el, binding) {
    if (typeof binding.value === 'string') {
      el.textContent = window.i18n.global.t(binding.value);
    } else if (typeof binding.value === 'object' && binding.value.path) {
      el.textContent = window.i18n.global.t(binding.value.path, binding.value.params || {});
    }
  },
  updated(el, binding) {
    if (typeof binding.value === 'string') {
      el.textContent = window.i18n.global.t(binding.value);
    } else if (typeof binding.value === 'object' && binding.value.path) {
      el.textContent = window.i18n.global.t(binding.value.path, binding.value.params || {});
    }
  }
});

app.mount("#app");
