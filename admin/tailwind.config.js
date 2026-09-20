/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        canvas: {
          DEFAULT: 'hsl(var(--canvas))',
          subtle: 'hsl(var(--canvas-subtle))',
          muted: 'hsl(var(--canvas-muted))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          raised: 'hsl(var(--surface-raised))',
          overlay: 'hsl(var(--surface-overlay))',
          border: 'hsl(var(--surface-border))',
        },
        primary: {
          DEFAULT: '#1E3A8A', // OCI Institutional Deep Blue
          foreground: '#FFFFFF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        accent: {
          DEFAULT: '#D97706', // OCI Heritage Amber
          foreground: '#FFFFFF',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        operational: {
          emerald: '#059669',
          amber: '#D97706',
          rose: '#DC2626',
          blue: '#2563EB',
          purple: '#7C3AED',
          slate: '#64748B',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-bg))',
          foreground: 'hsl(var(--sidebar-fg))',
          muted: 'hsl(var(--sidebar-muted))',
          border: 'hsl(var(--sidebar-border))',
          accent: 'hsl(var(--sidebar-accent))',
          active: 'hsl(var(--sidebar-active))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        xl: '0.75rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        command: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      },
    },
  },
  plugins: [],
};
