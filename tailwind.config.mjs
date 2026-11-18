/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    borderRadius: { none: '0', DEFAULT: '0', full: '9999px' },
    extend: {
      colors: {
        ground: '#FFFFFF',
        alt: '#F2F3EF',
        ink: '#1E2220',
        muted: '#5B615D',
        line: '#D6DAD3',
        accent: { DEFAULT: '#4B2D6E', soft: '#EEE9F3', dark: '#3A2156' },
        leaf: '#557A35',
        glow: '#EEE5CF',
      },
      fontFamily: {
        display: ['"Red Hat Display"', 'system-ui', 'sans-serif'],
        sans: ['"Red Hat Text"', 'system-ui', 'sans-serif'],
        mono: ['"Red Hat Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { display: '-0.04em', head: '-0.025em' },
      maxWidth: { page: '1240px' },
    },
  },
  plugins: [],
};
