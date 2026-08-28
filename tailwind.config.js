/** Used only if you switch from the CDN Play script to a real build:
 *  npx tailwindcss -i ./css/app.css -o ./css/tailwind.build.css --minify
 *  then swap the <script src="https://cdn.tailwindcss.com"> tag in index.html
 *  for <link rel="stylesheet" href="./css/tailwind.build.css">.
 */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF8F2', ink: '#23261F', muted: '#6E7266',
        forest: { DEFAULT: '#10493B', deep: '#0B342A' },
        gold: { DEFAULT: '#A9803A', soft: '#E4D7B8' },
        navy: '#1e3a5f',
      },
      fontFamily: {
        bangla: ['Nikosh', 'Hind Siliguri', 'Noto Sans Bengali', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
