// AtendeSoft Design System - Dashboard Tokens

export const designTokens = {
  // Colors
  colors: {
    primary: {
      50: 'hsl(200 100% 95%)',
      100: 'hsl(200 100% 90%)',
      200: 'hsl(200 100% 80%)',
      300: 'hsl(200 100% 70%)',
      400: 'hsl(200 100% 60%)',
      500: 'hsl(200 100% 50%)', // Main primary
      600: 'hsl(200 100% 40%)',
      700: 'hsl(200 100% 30%)',
      800: 'hsl(200 100% 20%)',
      900: 'hsl(200 100% 10%)',
    },
    secondary: {
      50: 'hsl(25 100% 95%)',
      100: 'hsl(25 100% 90%)',
      200: 'hsl(25 100% 80%)',
      300: 'hsl(25 100% 70%)',
      400: 'hsl(25 100% 60%)',
      500: 'hsl(25 100% 55%)', // Main secondary
      600: 'hsl(25 100% 45%)',
      700: 'hsl(25 100% 35%)',
      800: 'hsl(25 100% 25%)',
      900: 'hsl(25 100% 15%)',
    },
    success: {
      50: 'hsl(142 71% 95%)',
      500: 'hsl(142 71% 45%)',
      600: 'hsl(142 71% 35%)',
    },
    warning: {
      50: 'hsl(38 92% 95%)',
      500: 'hsl(38 92% 50%)',
      600: 'hsl(38 92% 40%)',
    },
    danger: {
      50: 'hsl(0 84% 95%)',
      500: 'hsl(0 84% 60%)',
      600: 'hsl(0 84% 50%)',
    },
    neutral: {
      50: 'hsl(220 13% 95%)',
      100: 'hsl(220 13% 90%)',
      200: 'hsl(220 13% 80%)',
      300: 'hsl(220 13% 70%)',
      400: 'hsl(220 13% 60%)',
      500: 'hsl(220 13% 50%)',
      600: 'hsl(220 13% 40%)',
      700: 'hsl(220 13% 30%)',
      800: 'hsl(220 13% 20%)',
      900: 'hsl(220 13% 10%)',
    },
    background: {
      primary: 'hsl(220 13% 6%)',
      secondary: 'hsl(220 13% 8%)',
      tertiary: 'hsl(220 13% 12%)',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 hsl(220 13% 6% / 0.05)',
    md: '0 4px 6px -1px hsl(220 13% 6% / 0.1), 0 2px 4px -1px hsl(220 13% 6% / 0.06)',
    lg: '0 10px 15px -3px hsl(220 13% 6% / 0.1), 0 4px 6px -2px hsl(220 13% 6% / 0.05)',
    xl: '0 20px 25px -5px hsl(220 13% 6% / 0.1), 0 10px 10px -5px hsl(220 13% 6% / 0.04)',
    neon: {
      primary: '0 0 20px hsl(200 100% 50% / 0.5), 0 0 40px hsl(200 100% 50% / 0.2)',
      secondary: '0 0 20px hsl(25 100% 55% / 0.5), 0 0 40px hsl(25 100% 55% / 0.2)',
      success: '0 0 20px hsl(142 71% 45% / 0.5), 0 0 40px hsl(142 71% 45% / 0.2)',
      warning: '0 0 20px hsl(38 92% 50% / 0.5), 0 0 40px hsl(38 92% 50% / 0.2)',
      danger: '0 0 20px hsl(0 84% 60% / 0.5), 0 0 40px hsl(0 84% 60% / 0.2)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Transitions
  transitions: {
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Z-Index
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
};

// Component-specific styles
export const componentStyles = {
  // Card variants
  card: {
    base: 'rounded-xl border bg-card text-card-foreground shadow-sm',
    glass: 'rounded-xl border border-primary/20 bg-background/80 backdrop-blur-xl shadow-lg',
    elevated: 'rounded-xl border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow',
  },

  // Button variants
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-neon-secondary',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },

  // Status badges
  badge: {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    danger: 'bg-destructive/20 text-destructive border-destructive/30',
    info: 'bg-primary/20 text-primary border-primary/30',
  },

  // Table styles
  table: {
    header: 'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
    cell: 'p-4 align-middle',
    row: 'border-b transition-colors hover:bg-muted/50',
  },

  // Form styles
  form: {
    input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  },
};

// Utility functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
    case 'active':
    case 'paid':
      return 'success';
    case 'in_progress':
    case 'pending':
      return 'warning';
    case 'overdue':
    case 'cancelled':
    case 'expired':
      return 'danger';
    default:
      return 'info';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
    case 'active':
    case 'paid':
      return 'check-circle';
    case 'in_progress':
    case 'pending':
      return 'clock';
    case 'overdue':
    case 'cancelled':
    case 'expired':
      return 'alert-circle';
    default:
      return 'info';
  }
}; 