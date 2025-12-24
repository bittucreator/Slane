/**
 * @author Shiva Nagendra Babu Kore
 */

import type { Config } from "tailwindcss";

export default {
  darkMode: false, // Dark mode disabled
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      colors: {
        vscode: {
          'editor': '#ffffff',
          'sidebar': '#f3f3f3',
          'activitybar': '#2c2c2c',
          'titlebar': '#dddddd',
          'statusbar': '#007acc',
          'tab-active': '#ffffff',
          'tab-inactive': '#ececec',
          'border': '#e5e5e5',
          'input-border': '#cecece',
          'focus': '#0078d4',
          'hover': '#e8e8e8',
          'active': '#0060c0',
          'text': '#333333',
          'text-muted': '#6e6e6e',
          'icon': '#424242',
          'link': '#006ab1',
          'button': '#0078d4',
          'success': '#388a34',
          'warning': '#bf8803',
          'error': '#e51400',
          'info': '#1a85ff',
        },
      },
      fontSize: {
        'vscode-2xs': '9px',
        'vscode-xs': '10px',
        'vscode-sm': '11px',
        'vscode': '12px',
        'vscode-lg': '13px',
        'vscode-xl': '14px',
      },
      spacing: {
        'vscode-1': '4px',
        'vscode-2': '8px',
        'vscode-3': '12px',
        'vscode-4': '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;
