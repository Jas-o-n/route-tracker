export const clerkAppearance = {
  variables: {
    colorPrimary: '#8B5CF6',
    colorText: '#F8FAFC',
    colorBackground: '#0B0B0B',
    borderRadius: '0.75rem',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  elements: {
    // Global card/modals (SignIn/SignUp, popovers)
    card:
      'bg-neutral-900/95 text-neutral-100 border border-neutral-800 shadow-lg rounded-xl backdrop-blur-sm',
    modal: 'backdrop-blur-sm',

    // Headings
    headerTitle: 'text-2xl font-semibold tracking-tight text-neutral-50',
    headerSubtitle: 'text-neutral-400',

    // Inputs & buttons
    formFieldInput:
      'bg-neutral-900 text-neutral-100 placeholder:text-neutral-400 border border-neutral-800 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none',
    formButtonPrimary:
      'bg-violet-600 text-white hover:bg-violet-500 h-10 px-4 rounded-md font-medium transition-colors',

    // User button
    userButtonTrigger: 'ring-0 focus:ring-0',
    userButtonAvatarBox: 'h-9 w-9 md:h-10 md:w-10',
    userButtonPopoverCard:
      'bg-neutral-900/95 text-neutral-100 border border-neutral-800 rounded-xl shadow-lg backdrop-blur-sm',
    userButtonPopoverHeader: 'border-b border-neutral-800',
    userButtonPopoverFooter: 'border-t border-neutral-800',
    userButtonPopoverTitle: 'text-neutral-100',
    userButtonPopoverSubtitle: 'text-neutral-400',
    userButtonPopoverActionButton:
      'text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50 rounded-md',
    userButtonPopoverActionButtonIcon: 'text-neutral-400',
    userButtonPopoverActionButtonText: 'text-neutral-200',
  },
} as const;

import { dark } from '@clerk/themes';
export const clerkDarkAppearance = { ...clerkAppearance, baseTheme: dark } as const;

export const clerkLightAppearance = {
  ...clerkAppearance,
  variables: {
    ...clerkAppearance.variables,
    colorText: '#0F172A', // slate-900
    colorBackground: '#FFFFFF',
  },
  elements: {
    ...clerkAppearance.elements,
    card: 'bg-white text-neutral-900 border border-neutral-200 shadow-lg rounded-xl',
    headerTitle: 'text-neutral-900',
    headerSubtitle: 'text-neutral-500',
    formFieldInput:
      'bg-white text-neutral-900 placeholder:text-neutral-500 border border-neutral-300 rounded-md focus:ring-2 focus:ring-violet-600 focus:outline-none',
    formButtonPrimary:
      'bg-violet-600 text-white hover:bg-violet-500 h-10 px-4 rounded-md font-medium transition-colors',
    userButtonPopoverCard:
      'bg-white text-neutral-900 border border-neutral-200 rounded-xl shadow-lg',
    userButtonPopoverHeader: 'border-b border-neutral-200',
    userButtonPopoverFooter: 'border-t border-neutral-200',
    userButtonPopoverTitle: 'text-neutral-900',
    userButtonPopoverSubtitle: 'text-neutral-500',
    userButtonPopoverActionButton:
      'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-md',
    userButtonPopoverActionButtonIcon: 'text-neutral-500',
    userButtonPopoverActionButtonText: 'text-neutral-700',
  },
} as const;


