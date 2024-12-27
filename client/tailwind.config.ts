import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        mainbackground: 'var(mainbackground)',
        dashboardbackground: 'rgb(var(--background))',
        foreground: 'var(--foreground)',
        mainColor: '#093537',
        // mainColor: '#1f3835',

        //new dashboard
        mainstructure: 'rgb(var(--mainstructure))',
        maincolor: 'var(--maincolor)',
      },
      boxShadow: {
        mainshadow: '0 10px 40px -23px #093537',
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
