/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,njk,md,svg}'],
  safelist: [
    'py-4',
    'text-2xl',
    'text-xl',
    'text-lg',
    'font-light',
    'text-slate-800',
    'py-3',
    'rounded',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
