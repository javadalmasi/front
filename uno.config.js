import { defineConfig } from "unocss";
import transformerDirective from "@unocss/transformer-directives";
import transformerVariantGroup from "@unocss/transformer-variant-group";

import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons";
import presetWebFonts from "@unocss/preset-web-fonts";

export default defineConfig({
    transformers: [transformerDirective(), transformerVariantGroup()],
    presets: [
        presetUno({
            dark: "media",
            rtl: true, // Enable RTL support
        }),
        presetIcons({
            extraProperties: {
                display: "inline-block",
                "vertical-align": "middle",
            },
        }),
        presetWebFonts({
            provider: "none", // Changed back to none since we're using local font
            fonts: {
                sans: [
                    "Vazirmatn",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica Neue",
                    "Arial",
                    "Noto Sans",
                    "sans-serif",
                    "Apple Color Emoji",
                    "Segoe UI Emoji",
                    "Segoe UI Symbol",
                    "Noto Color Emoji",
                ],
            },
        }),
    ],
});
