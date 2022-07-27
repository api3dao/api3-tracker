/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./stories/**/*.{js,ts,jsx,tsx}",
  ],
  darkmode: false,
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "960px",
      xl: "1280px",
    },
    extend: {
      minHeight: {
        "96px": "96px",
      },
      minWidth: {
        "16px": "16px",
        "220px": "220px",
      },
      maxWidth: {
        "220px": "220px",
        "300px": "300px",
      },
      colors: {
        "color-bk": "var(--color-bk)",
        "color-bk-highlight": "var(--color-bk-highlight)",
        "color-text": "var(--color-text)",
        "color-link": "var(--color-link)",
        "color-accent": "var(--color-accent)",
        "color-warning": "var(--color-warning)",
        "color-body": "var(--color-body)",
        "color-well": "var(--color-well)",
        "color-error": "var(--color-error)",
        "color-success": "var(--color-success)",
        "color-success-dark": "var(--color-success-dark)",
        "color-grey": "var(--color-grey)",
        "color-grey-light": "var(--color-grey-light)",
        "color-cell-title": "var(--color-cell-title)",
        "color-cell-border": "var(--color-cell-border)",
        "color-panel-title": "var(--color-panel-title)",
        "color-panel-border": "var(--color-panel-border)",
        "color-menu-active": "var(--color-menu-active)",
        "color-menu-hover": "var(--color-menu-hover)",
      },
    },
  },
  plugins: [],
};
