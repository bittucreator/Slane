/**
 * @author Shiva Nagendra Babu Kore
 */

// Application Constants
// This file centralizes all hardcoded values for better maintainability

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

export const ENV = {
  // Supabase Configuration - Next.js environment variables
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Azure OpenAI Configuration
  AZURE_ENDPOINT: process.env.NEXT_PUBLIC_AZURE_ENDPOINT || "",
  AZURE_API_KEY: process.env.NEXT_PUBLIC_AZURE_API_KEY || "",
  AZURE_DEPLOYMENT_NAME: process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME || "",
  AZURE_API_VERSION: process.env.NEXT_PUBLIC_AZURE_API_VERSION || "",

  // hCaptcha Configuration
  HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
} as const;

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================
export const SECURITY = {
  // Input validation limits
  MAX_INPUT_LENGTH: 10000,
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 6,

  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_LOGIN_ATTEMPTS: 5,

  // Content Security Policy domains
  ALLOWED_DOMAINS: [
    "self",
    "*.supabase.co",
    "*.openai.azure.com",
    "*.cognitiveservices.azure.com",
  ],
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================
export const API = {
  // Azure OpenAI defaults (fallbacks)
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_TOP_P: 0.9,

  // Request timeouts (in milliseconds)
  REQUEST_TIMEOUT: 30000,
  RETRY_DELAY: 1000,
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================
export const UI = {
  // Z-index values
  Z_INDEX_OVERLAY: 9999,

  // Animation durations (in milliseconds)
  ANIMATION_DURATION_FAST: 200,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,

  // Notification durations (in milliseconds)
  NOTIFICATION_DURATION_SHORT: 3000,
  NOTIFICATION_DURATION_NORMAL: 5000,
  NOTIFICATION_DURATION_LONG: 7000,
  NOTIFICATION_DURATION_WARNING: 7000,

  // Polling intervals (in milliseconds)
  PERMISSION_CHECK_INTERVAL: 5000,

  // Component sizes
  BUTTON_HEIGHT_SM: "h-9",
  BUTTON_HEIGHT_DEFAULT: "h-10",
  BUTTON_HEIGHT_LG: "h-11",

  ICON_SIZE_SM: "w-4 h-4",
  ICON_SIZE_DEFAULT: "w-5 h-5",
  ICON_SIZE_LG: "w-6 h-6",

  // Border radius
  BORDER_RADIUS_SM: "1px",
  BORDER_RADIUS_DEFAULT: "2px",
  BORDER_RADIUS_LG: "4px",

  // Z-index values
  Z_INDEX_MODAL: 50,

  // Container dimensions
  MODAL_MAX_WIDTH_SM: "max-w-xs",
  MODAL_MAX_WIDTH_DEFAULT: "max-w-md",
  MODAL_MAX_WIDTH_LG: "max-w-lg",
} as const;

// =============================================================================
// BUSINESS LOGIC CONSTANTS
// =============================================================================
export const BUSINESS = {
  // Task constraints
  MAX_TASK_DESCRIPTION_LENGTH: 1000,

  // Date validation
  MIN_YEAR: 1900,
  MAX_YEAR: 2100,

  // Time calculations (in milliseconds)
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_HOUR: 60 * 60 * 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,

  // Notification settings
  DEFAULT_REMINDER_MINUTES_BEFORE: 15,
  DEFAULT_DAILY_SUMMARY_TIME: "09:00",
} as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================
export const STORAGE_KEYS = {
  THEME: "theme",
  NOTIFICATION_SETTINGS: "notification-settings",
  USER_PREFERENCES: "user-preferences",
  CHAT_HISTORY: "chat-history",
} as const;

// =============================================================================
// COLORS
// =============================================================================
export const COLORS = {
  // Application colors (light theme only)
  PRIMARY_BG: "#ffffff",
  SECONDARY_BG: "#f4f4f4",
  TERTIARY_BG: "#f9f9f9",
  BORDER: "#e5e5e5",
  TEXT_PRIMARY: "#000000",
  TEXT_SECONDARY: "#6b7280",
  TEXT_MUTED: "#9ca3af",
  ACCENT: "#374151",

  // Semantic colors
  SEMANTIC: {
    SUCCESS: "#10b981",
    WARNING: "#f59e0b",
    ERROR: "#ef4444",
    INFO: "#3b82f6",
  },

  // Priority colors
  PRIORITY: {
    HIGH: "bg-red-50 text-red-600 border-red-100",
    MEDIUM: "bg-amber-50 text-amber-600 border-amber-100",
    LOW: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },

  // Upgrade theme colors
  UPGRADE: {
    BUTTON:
      "bg-gradient-to-r from-blue-50/50 to-purple-50/50 hover:from-blue-100/70 hover:to-purple-100/70 text-blue-700 border-blue-200",
    MODAL: {
      PRO_CARD: "bg-gradient-to-br from-blue-50/50 to-purple-50/50",
      PRO_BUTTON:
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
      BADGE: "bg-gradient-to-r from-blue-500 to-purple-500",
    },
  },
} as const;

// =============================================================================
// ROUTES AND PATHS
// =============================================================================
export const PATHS = {
  SERVICE_WORKER: "/sw.js",
  ICONS: {
    LOGO: "/Slane.png",
    LOGO_DARK: "/slane-dark.png",
    ASK_AI: "/askailogo.svg",
    UPGRADE: "/upgrade.svg",
    ALL_TASKS_FILTER: "/all tasks filter.svg",
  },
} as const;

// =============================================================================
// TEXT STRINGS (for i18n readiness)
// =============================================================================
export const TEXT = {
  // UI Labels
  SEARCH_PLACEHOLDER: "Search tasks...",
  LOADING_TASKS: "Loading tasks...",
  NO_TASKS_FOUND: "No tasks found. Create your first task!",
  SETTINGS: "Settings",
  UPGRADE: "Upgrade",
  NEW_TASK: "New task",
  SLANE_AI: "Slane AI",

  // Task States
  ALL_TASKS: "All tasks",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELED: "Canceled",

  // Actions
  EDIT: "Edit",
  DELETE: "Delete",
  PRIORITY: "Priority",
  DUE: "Due",
  SET_DUE_DATE: "Set due date",

  // Delete Confirmation
  DELETE_TASK: "Delete Task",
  DELETE_TASK_CONFIRMATION:
    'Are you sure you want to delete "{title}"? This action cannot be undone.',
  CANCEL: "Cancel",
  DELETE_TASK_BUTTON: "Delete Task",
} as const;

// =============================================================================
// LAYOUT & DIMENSIONS
// =============================================================================
export const LAYOUT = {
  // Search Bar Widths
  SEARCH_WIDTH_DESKTOP: "w-[40rem]",
  SEARCH_WIDTH_TABLET: "sm:w-[30rem]",
  SEARCH_WIDTH_LARGE: "md:w-[40rem]",

  // Container Max Widths
  TASK_CONTAINER_MAX_WIDTH: "max-w-[1000px]",
  ERROR_CONTAINER_MAX_WIDTH: "max-w-lg",

  // Heights
  SEARCH_HEIGHT_DESKTOP: "h-10",
  SEARCH_HEIGHT_MOBILE: "h-12",
  BUTTON_HEIGHT_SMALL: "h-7",
  BUTTON_HEIGHT_MEDIUM: "h-9",
  BUTTON_HEIGHT_LARGE: "h-11",

  // Paddings & Margins
  CONTAINER_PADDING_X: "px-4 sm:px-6",
  CONTAINER_PADDING_Y: "py-3 sm:py-4",
  MOBILE_SEARCH_PADDING: "px-4 pt-2 pb-4",

  // Gaps
  BUTTON_GAP_SMALL: "gap-1",
  BUTTON_GAP_MEDIUM: "gap-1.5",
  BUTTON_GAP_LARGE: "gap-2",
  FILTER_PILLS_GAP: "gap-2",

  // Z-Index
  HEADER_Z_INDEX: "z-10",
  SETTINGS_BUTTON_Z_INDEX: "z-10",
} as const;

// =============================================================================
// CSS STYLES (for inline style replacement)
// =============================================================================
export const STYLES = {
  // Common style objects
  NO_SHADOW: {
    boxShadow: "none",
    border: "none",
    borderTop: "none",
    borderBottom: "none",
  },

  WEBKIT_SCROLLING: {
    WebkitOverflowScrolling: "touch",
  },

  RESET_STYLES: {
    boxShadow: "none !important",
    borderBottom: "none !important",
    borderTop: "none !important",
    border: "none !important",
  },
} as const;

// =============================================================================
// DEFAULT VALUES
// =============================================================================
export const DEFAULTS = {
  // Notification settings
  NOTIFICATION_SETTINGS: {
    enabled: true,
    taskDueReminders: true,
    dailySummary: false,
    reminderMinutesBefore: BUSINESS.DEFAULT_REMINDER_MINUTES_BEFORE,
    dailySummaryTime: BUSINESS.DEFAULT_DAILY_SUMMARY_TIME,
  },

  // Development fallback values (should be moved to .env)
  DEVELOPMENT_FALLBACKS: {
    // These values should be set in .env.local file:
    // NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    // NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    MISSING_ENV_WARNING:
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file",
  },
} as const;
