import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        card: "#111115",
        muted: "#18181b",
        border: "#27272a",
        accent: "#4f46e5"
      },
      boxShadow: {
        glass: "0 8px 24px rgba(0,0,0,0.3)"
      }
    }
  },
  plugins: []
};

export default config;
