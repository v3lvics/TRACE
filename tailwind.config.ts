import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f14',
        nebula: '#101826',
        pulse: '#63f5ff',
        aurora: '#7c4dff'
      },
      boxShadow: {
        glow: '0 0 20px rgba(99,245,255,0.35)'
      }
    }
  },
  plugins: []
};

export default config;
