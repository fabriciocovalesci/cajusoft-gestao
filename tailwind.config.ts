import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("tailwindcss-animate"),
  ],
  daisyui: {
    themes: [
      {
        pacajusTheme: {
          "primary": "#0052CC",
          "primary-focus": "#0747A6",
          "secondary": "#00B8D9",
          "accent": "#6554C0",
          "base-100": "#FFFFFF",
          "base-200": "#F4F5F7",
          "base-300": "#EBECF0",
          "base-content": "#172B4D",
          "neutral": "#253858",
          "neutral-content": "#FFFFFF",
          "cancel": "#4B5563",
          "cancel-content": "#FFFFFF",
          "info": "#0065FF",
          "success": "#36B37E",
          "warning": "#FFAB00",
          "error": "#FF5630",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.3rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-text-case": "none",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.3rem",
        },
      },
    ],
    darkTheme: false,
    base: true,
    styled: true,
    utils: true,
  },
};

export default config;
