/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F7F5",
        surface: "#FFFFFF",
        "surface-2": "#EFF0ED",
        ink: "#15171A",
        text: "#15171A",
        dim: "#3E434A",
        muted: "#646A72",
        line: "#DADDDB",
        "line-strong": "#B9BDB7",
        accent: "#1E3DF0",
        "accent-deep": "#1733B8",
        "accent-soft": "rgba(30, 61, 240, 0.08)",
        "edge-ink": "#80858C",
      },
      fontFamily: {
        sans: ["'Instrument Sans'", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["'DM Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        display: "-0.03em",
        tight: "-0.02em",
        label: "0.06em",
      },
      maxWidth: {
        shell: "76rem",
        prose: "60ch",
        lede: "34ch",
      },
      borderRadius: {
        DEFAULT: "2px",
      },
      boxShadow: {
        lift: "0 24px 48px -32px rgba(21, 23, 26, 0.28)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
}
