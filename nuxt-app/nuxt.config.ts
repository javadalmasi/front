// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
    '@nuxtjs/i18n',
  ],
  unocss: {
    presets: [
      {
        name: '@unocss/preset-uno',
        options: {
          dark: 'class',
          rtl: true,
        }
      },
      {
        name: '@unocss/preset-icons',
        options: {
          extraProperties: {
            display: 'inline-block',
            'vertical-align': 'middle',
          },
        }
      },
      {
        name: '@unocss/preset-web-fonts',
        options: {
          provider: 'none',
          fonts: {
            sans: [
              'Vazirmatn',
              '-apple-system',
              'BlinkMacSystemFont',
              'Segoe UI',
              'Roboto',
              'Helvetica Neue',
              'Arial',
              'Noto Sans',
              'sans-serif',
              'Apple Color Emoji',
              'Segoe UI Emoji',
              'Segoe UI Symbol',
              'Noto Color Emoji',
            ],
          },
        }
      }
    ],
  },
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.json'
      },
      {
        code: 'fa',
        file: 'fa.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en',
  }
})
