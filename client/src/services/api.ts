const API_BASE = '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  const data = await response.json()

  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, name: string, password: string) =>
      request<{ success: boolean; data: { token: string; user: any } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      }),
    profile: () => request<{ success: boolean; data: any }>('/auth/profile'),
  },

  validate: {
    single: (email: string) =>
      request<{ success: boolean; data: any }>('/validate', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  bulk: {
    upload: async (file: File) => {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${API_BASE}/bulk/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      return response.json()
    },
    jobs: () => request<{ success: boolean; data: any[] }>('/bulk/jobs'),
    results: (jobId: string) => request<{ success: boolean; data: any[] }>(`/bulk/results/${jobId}`),
  },

  history: {
    list: (params: { page?: number; limit?: number; search?: string; provider?: string; status?: string; sortBy?: string; sortOrder?: string } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set('page', String(params.page))
      if (params.limit) searchParams.set('limit', String(params.limit))
      if (params.search) searchParams.set('search', params.search)
      if (params.provider) searchParams.set('provider', params.provider)
      if (params.status) searchParams.set('status', params.status)
      if (params.sortBy) searchParams.set('sortBy', params.sortBy)
      if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
      return request<{ success: boolean; data: { items: any[]; total: number; page: number; limit: number; totalPages: number } }>(
        `/history?${searchParams.toString()}`
      )
    },
    delete: (id: string) => request<{ success: boolean; message: string }>(`/history/${id}`, { method: 'DELETE' }),
    clear: () => request<{ success: boolean; message: string }>('/history', { method: 'DELETE' }),
  },

  reports: {
    summary: () => request<{ success: boolean; data: any }>('/reports/summary'),
    csv: () => `${API_BASE}/reports/csv`,
    json: () => `${API_BASE}/reports/json`,
    excel: () => `${API_BASE}/reports/excel`,
    pdf: () => `${API_BASE}/reports/pdf`,
  },

  stats: {
    dashboard: () => request<{ success: boolean; data: any }>('/stats/dashboard'),
    all: () => request<{ success: boolean; data: any }>('/stats'),
  },

  settings: {
    get: () => request<{ success: boolean; data: any }>('/settings'),
    update: (settings: any) =>
      request<{ success: boolean; message: string }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
    deleteAccount: () =>
      request<{ success: boolean; message: string }>('/settings/account', { method: 'DELETE' }),
  },

  favorites: {
    list: () => request<{ success: boolean; data: any[] }>('/favorites'),
    add: (email: string, validationId?: string, label?: string) =>
      request<{ success: boolean; data: any }>('/favorites', {
        method: 'POST',
        body: JSON.stringify({ email, validationId, label }),
      }),
    remove: (id: string) =>
      request<{ success: boolean; message: string }>(`/favorites/${id}`, { method: 'DELETE' }),
    check: (email: string) =>
      request<{ success: boolean; data: { isFavorite: boolean; id: string | null } }>(`/favorites/check/${encodeURIComponent(email)}`),
  },

  collections: {
    list: () => request<{ success: boolean; data: any[] }>('/collections'),
    create: (name: string, description?: string, color?: string) =>
      request<{ success: boolean; data: any }>('/collections', {
        method: 'POST',
        body: JSON.stringify({ name, description, color }),
      }),
    update: (id: string, data: { name?: string; description?: string; color?: string }) =>
      request<{ success: boolean; message: string }>(`/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/collections/${id}`, { method: 'DELETE' }),
    items: (id: string) => request<{ success: boolean; data: any[] }>(`/collections/${id}/items`),
    addItem: (id: string, email: string, validationId?: string) =>
      request<{ success: boolean; data: any }>(`/collections/${id}/items`, {
        method: 'POST',
        body: JSON.stringify({ email, validationId }),
      }),
    removeItem: (id: string, itemId: string) =>
      request<{ success: boolean; message: string }>(`/collections/${id}/items/${itemId}`, { method: 'DELETE' }),
  },

  share: {
    create: (validationId: string) =>
      request<{ success: boolean; data: { token: string; shareUrl: string; id: string } }>('/share', {
        method: 'POST',
        body: JSON.stringify({ validationId }),
      }),
    get: (token: string) => request<{ success: boolean; data: any }>(`/share/${token}`),
  },
}
