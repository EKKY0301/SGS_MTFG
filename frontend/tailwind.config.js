/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    spacing: {
      0: "0%",
      1: "0.25vw",
      2: "0.5vw",
      3: "0.75vw",
      4: "1vw",
      5: "1.25vw",
      6: "1.5vw",
      7: "1.75vw",
      8: "2vw",
      10: "2.5vw",
      12: "3vw",
      28: "7vh",
      40: "10vh",
      full: "100%",
      screen: "100vh",
    },
    borderRadius: {
      none: "0%",
      sm: "0.2vw",
      DEFAULT: "0.3vw",
      md: "0.4vw",
      lg: "0.5vw",
      full: "9999px",
    },
    fontSize: {
      xs: "0.75vw",
      sm: "0.875vw",
      base: "1vw",
      lg: "1.125vw",
      xl: "1.25vw",
      "2xl": "1.5vw",
      "3xl": "1.875vw",
      "4xl": "2.25vw",
    },
    lineHeight: {
      tight: "1.2",
      snug: "1.35",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
    extend: {
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark-rgb) / <alpha-value>)",
          light: "rgb(var(--color-primary-light-rgb) / <alpha-value>)",
        },

        background: {
          DEFAULT: "rgb(var(--color-background-rgb) / <alpha-value>)",
          light: "rgb(var(--color-background-light-rgb) / <alpha-value>)",
          dark: "rgb(var(--color-background-dark-rgb) / <alpha-value>)",
        },

        sidebar: {
          DEFAULT: "rgb(var(--color-sidebar-rgb) / <alpha-value>)",
          selected: "rgb(var(--color-sidebar-selected-rgb) / <alpha-value>)",
          text: "rgb(var(--color-sidebar-text-rgb) / <alpha-value>)",
        },

        text: {
          DEFAULT: "rgb(var(--color-text-rgb) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        },

        border: {
          DEFAULT: "rgb(var(--color-border-rgb) / <alpha-value>)",
          strong: "rgb(var(--color-border-strong-rgb) / <alpha-value>)",
        },
        black: "rgb(var(--color-black-rgb) / <alpha-value>)",
        white: "rgb(var(--color-white-rgb) / <alpha-value>)",

        surface: {
          card: "rgb(var(--color-surface-card-rgb) / <alpha-value>)",
          cardAlt: "rgb(var(--color-surface-card-alt-rgb) / <alpha-value>)",
        },

        red: {
          50: "rgb(var(--color-danger-50-rgb) / <alpha-value>)",
          100: "rgb(var(--color-danger-100-rgb) / <alpha-value>)",
          200: "rgb(var(--color-danger-200-rgb) / <alpha-value>)",
          300: "rgb(var(--color-danger-300-rgb) / <alpha-value>)",
          400: "rgb(var(--color-danger-400-rgb) / <alpha-value>)",
          500: "rgb(var(--color-danger-500-rgb) / <alpha-value>)",
          600: "rgb(var(--color-danger-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-danger-700-rgb) / <alpha-value>)",
          800: "rgb(var(--color-danger-800-rgb) / <alpha-value>)",
        },

        green: {
          500: "rgb(var(--color-success-500-rgb) / <alpha-value>)",
          600: "rgb(var(--color-success-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-success-700-rgb) / <alpha-value>)",
        },

        blue: {
          300: "rgb(var(--color-info-300-rgb) / <alpha-value>)",
          500: "rgb(var(--color-info-500-rgb) / <alpha-value>)",
          600: "rgb(var(--color-info-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-info-700-rgb) / <alpha-value>)",
        },

        gray: {
          200: "rgb(var(--color-neutral-200-rgb) / <alpha-value>)",
          300: "rgb(var(--color-neutral-300-rgb) / <alpha-value>)",
          400: "rgb(var(--color-neutral-400-rgb) / <alpha-value>)",
          500: "rgb(var(--color-neutral-500-rgb) / <alpha-value>)",
          600: "rgb(var(--color-neutral-600-rgb) / <alpha-value>)",
          800: "rgb(var(--color-neutral-800-rgb) / <alpha-value>)",
        },

        emerald: {
          600: "rgb(var(--color-brand-emerald-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-brand-emerald-700-rgb) / <alpha-value>)",
        },

        slate: {
          600: "rgb(var(--color-brand-slate-600-rgb) / <alpha-value>)",
          700: "rgb(var(--color-brand-slate-700-rgb) / <alpha-value>)",
          800: "rgb(var(--color-brand-slate-800-rgb) / <alpha-value>)",
        },

        orange: {
          500: "rgb(var(--color-brand-orange-500-rgb) / <alpha-value>)",
        },

        amber: {
          600: "rgb(var(--color-brand-amber-600-rgb) / <alpha-value>)",
        },
      }
    }
  },
  plugins: [],
};
