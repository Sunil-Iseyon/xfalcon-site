import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm:  "480px",
      md:  "768px",
      lg:  "1024px",
      xl:  "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        accent: "#2ed1ed",
        navy: {
          deep:    "#040a17",
          DEFAULT: "#061122",
          soft:    "#0d1828",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'SF Mono'", "'Geist Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        brand: "18px",
      },
      spacing: {
        "nav": "72px",
      },
    },
  },
  plugins: [],
};

export default config;
