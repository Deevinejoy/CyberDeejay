import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'neo-black': '#0D0D0D',
        'neo-white': '#F5F5F5',
        'neo-primary': '#FF3366',
        'neo-secondary': '#33FF57',
        'neo-accent': '#3366FF',
      },
      fontFamily: {
        'brutalist': ['Space Mono', 'monospace'],
        'display': ['Archivo Black', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '5px 5px 0px 0px rgba(0,0,0,1)',
        'brutal-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
    },
  },
  plugins: [],
}

export default config;
