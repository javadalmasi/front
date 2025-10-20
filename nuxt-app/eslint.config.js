import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";


export default [
  {
    ignores: [
      ".nuxt/**",
    ]
  },
  {languageOptions: { globals: { ...globals.browser, ...globals.node } }},
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
];
