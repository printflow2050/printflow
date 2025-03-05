// config.ts

// Base URL for API requests
export const BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  SHOP_DETAILS: `${BASE_URL}/api/shop`, // Base for shop details (append /:shopId)
  PRINT_JOBS: `${BASE_URL}/api/printjobs`, // Base for print jobs (append /prints/:shopId, /:jobId, etc.)
  UPLOAD_FILE: `${BASE_URL}/api/upload`, // Base for file upload (append /:shopId)
  FILE_DOWNLOAD: BASE_URL, // Base for file downloads (append file_path)
  PRINT_JOB_STATUS: `${BASE_URL}/api/printjobs/status`, // For status check (append /:token)
  SHOP_REGISTER: `${BASE_URL}/api/shop/register`, // Added for shop registration
} as const;

// Static Variables
export const STATIC_VARIABLES = {
  MAX_FILE_SIZE_MB: 10, // Maximum file size in MB for uploads
  DATE_FORMAT: 'MMM d, h:mm a', // Date format for display
  STATUS_TYPES: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    DELETED: 'deleted',
  } as const,
  SOCKET_URL: 'http://localhost:5000', // WebSocket URL
  SOCKET_TRANSPORTS: ['websocket'] as const, // WebSocket transport option
  ACCEPTED_FILE_TYPES: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  } as const,
  ANIMATION_DELAY_MS: 2000, // Delay for status transition (in milliseconds)
  FADE_ANIMATION_TIMEOUT: 500, // Fade animation duration (in milliseconds)
  MAX_COPIES: 100, // Maximum number of copies allowed
  MIN_COPIES: 1, // Minimum number of copies allowed
  DEFAULT_BW_COST_PER_PAGE: 0.10, // Default black & white cost per page
  DEFAULT_COLOR_COST_PER_PAGE: 0.25, // Default color cost per page
} as const;