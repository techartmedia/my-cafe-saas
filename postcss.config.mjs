/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // 👈 This matches Tailwind v4 requirements
    autoprefixer: {},
  },
};

export default config;