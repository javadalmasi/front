import { defineConfig } from "unocss";
import transformerDirective from "@unocss/transformer-directives";
import transformerVariantGroup from "@unocss/transformer-variant-group";

import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons";
import presetWebFonts from "@unocss/preset-web-fonts";

export default defineConfig({
    // By default, UnoCSS applies a special reset from @unocss/reset/tailwind.css.
    // We are disabling it here and will use a custom reset later if needed.
    preflight: true,

    transformers: [transformerDirective(), transformerVariantGroup()],

    presets: [
        presetUno({
            dark: "class",
            rtl: true,
        }),
        presetIcons({
            extraProperties: {
                display: "inline-block",
                "vertical-align": "middle",
            },
        }),
        presetWebFonts({
            provider: "none",
            fonts: {
                sans: [
                    "Vazirmatn",
                    "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue",
                    "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji",
                    "Segoe UI Symbol", "Noto Color Emoji",
                ],
            },
        }),
    ],

    // Theme configuration is where we define our custom design tokens.
    // This includes colors, spacing, fonts, etc.
    theme: {
        colors: {
            // Light Theme
            primary: "#3B82F6", // A modern, friendly blue
            secondary: "#6B7280", // Neutral gray
            accent: "#EC4899", // Vibrant pink for accents
            background: "#F9FAFB", // Very light gray, almost white
            surface: "#FFFFFF", // White for cards, modals
            "text-primary": "#1F2937", // Dark gray for main text
            "text-secondary": "#6B7280", // Lighter gray for subtitles
            danger: "#EF4444", // Red for warnings and errors
            subscribe: "#EF4444", // A distinct red for the subscribe button

            // Dark Theme - these colors are applied when the 'dark' class is present
            dark: {
                primary: "#60A5FA", // A lighter, more vibrant blue for dark mode
                secondary: "#9CA3AF",
                accent: "#F472B6",
                background: "#111827", // Very dark, almost black
                surface: "#1F2937", // Dark gray, slightly lighter than background
                "text-primary": "#F9FAFB", // Light gray, almost white for main text
                "text-secondary": "#9CA3AF", // Medium gray for subtitles
                danger: "#F87171", // A lighter red for dark mode
                subscribe: "#EF4444", // Red stands out well on dark backgrounds too
            },
        },
        borderRadius: {
            DEFAULT: "0.5rem", // 8px
            lg: "1rem", // 16px
            full: "9999px",
        },
    },

    // Shortcuts allow us to create reusable utility patterns.
    // This helps in maintaining consistency and reducing class clutter in the markup.
    shortcuts: {
        // General
        "text-main": "text-text-primary dark:text-dark-text-primary",
        "text-soft": "text-text-secondary dark:text-dark-text-secondary",
        "bg-main": "bg-background dark:bg-dark-background",
        "bg-surface": "bg-surface dark:bg-dark-surface",
        "border-color": "border-gray-200 dark:border-gray-700",
        "text-link": "text-primary dark:text-dark-primary hover:underline",

        // Buttons
        btn: "px-4 py-2 rounded-DEFAULT font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        "btn-primary": "bg-primary text-white hover:bg-opacity-90",
        "btn-secondary":
            "bg-gray-200 text-text-primary hover:bg-gray-300 dark:bg-dark-secondary dark:text-dark-text-primary dark:hover:bg-opacity-80",
        "btn-danger": "bg-danger text-white hover:bg-opacity-90",
        "btn-subscribe": "bg-subscribe text-white hover:bg-opacity-90",
        "btn-ghost": "bg-transparent text-main hover:bg-gray-100 dark:hover:bg-dark-surface",
        "btn-icon": "p-2 rounded-full",

        // Cards
        card: "bg-surface border border-color rounded-lg shadow-sm",

        // Inputs
        "input-base":
            "w-full px-3 py-2 bg-transparent border border-color rounded-DEFAULT text-main placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-primary",

        // Page layout
        "page-container": "px-4 sm:px-6 lg:px-8",
    },
});
