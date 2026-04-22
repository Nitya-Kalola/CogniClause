module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 12px rgba(0,200,255,0.8), 0 0 24px rgba(0,200,255,0.4)",
      },
      colors: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        neon: {
          blue: "#37f0ff",
          cyan: "#4df7ff",
          soft: "#b6f7ff",
        },
      },
    },
  },
  plugins: [],
};
