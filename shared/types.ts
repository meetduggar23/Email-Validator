export interface ValidationResult {
  email: string
  syntax: boolean
  syntaxDetails?: string
  domain: boolean
  domainDetails?: string
  mxRecords: boolean
  mxDetails?: string
  smtp: boolean | null
  smtpDetails?: string
  disposable: boolean
  disposableDetails?: string
  provider: string
  providerDetails?: string
  deliverability: 'high' | 'medium' | 'low' | 'unknown'
  deliverabilityScore: number
  confidenceScore: number
  suggestions: string[]
  isDuplicate: boolean
  typoSuggestions: string[]
  timestamp: string
}

export interface BulkValidationResult {
  id: string
  email: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: ValidationResult
  error?: string
}

export interface BulkJob {
  id: string
  filename: string
  totalEmails: number
  processedEmails: number
  validEmails: number
  invalidEmails: number
  disposableEmails: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results: BulkValidationResult[]
  createdAt: string
  completedAt?: string
}

export interface User {
  id: string
  email: string
  name: string
  password?: string
  createdAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  exportFormat: 'csv' | 'xlsx' | 'pdf' | 'json'
  apiSource: 'public' | 'internal'
}

export interface AuthResponse {
  token: string
  user: Omit<User, 'password'>
}

export interface DashboardStats {
  totalEmailsChecked: number
  validEmails: number
  invalidEmails: number
  disposableEmails: number
  deliverabilityRate: number
  mxSuccess: number
  recentUploads: BulkJob[]
  dailyStats: DailyStat[]
  providerStats: ProviderStat[]
}

export interface DailyStat {
  date: string
  total: number
  valid: number
  invalid: number
}

export interface ProviderStat {
  provider: string
  count: number
  percentage: number
}

export interface HistoryEntry {
  id: string
  email: string
  isValid: boolean
  isDisposable: boolean
  provider: string
  confidenceScore: number
  timestamp: string
  userId?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
