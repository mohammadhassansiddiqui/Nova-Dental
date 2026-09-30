/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#060a14',
        card:    '#0c1220',
        surface: '#111b30',
        alabaster: '#eef2ff',
        'alabaster-muted': '#94a3c4',
        // Electric blue accent (replaces clay/terracotta)
        accent:  '#388bfd',
        'accent-light': '#79b8ff',
        'accent-glow':  '#1a6fd8',
        // Cyan highlight (replaces champagne)
        cyan:    '#58d4eb',
        'cyan-glow': '#30b6cc',
        // Kept for booking drawer compatibility
        clay: '#388bfd',
        champagne: '#58d4eb',
        'champagne-glow': '#79b8ff',
        'gold-soft': '#58d4eb',
        mineral: '#c0d4f5',
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widest: '0.2em',
        ultra:  '0.3em',
      },
    },
  },
  plugins: [],
};
