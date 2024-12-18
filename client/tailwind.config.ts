import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // تنظیم حالت دارک مود (با استفاده از کلاس 'dark')

  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        mainColor: '#1f3835',
        //new
        mainstructure: 'rgb(var(--mainstructure))',
        maincolor: 'var(--maincolor)',
        // mainColor: '#091a28',

        // mainColor: var(--mainColor)
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
          '2xl': '4rem',
        },
      },
    },
  },
  plugins: [],
};
export default config;
