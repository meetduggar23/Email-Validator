const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY || ''

interface AbstractApiResponse {
  email: string
  autocorrect: string
  deliverability: 'DELIVERABLE' | 'UNDELIVERABLE' | 'RISKY' | 'UNKNOWN'
  quality_score: number
  is_valid_format: { value: boolean; text: string }
  is_free_email: { value: boolean; text: string }
  is_disposable_email: { value: boolean; text: string }
  is_role_email: { value: boolean; text: string }
  is_catchall_email: { value: boolean; text: string }
  is_mx_found: { value: boolean; text: string }
  is_smtp_valid: { value: boolean; text: string }
}

interface AbstractErrorResponse {
  error: { message?: string }
}

export interface AbstractResult {
  deliverability: 'DELIVERABLE' | 'UNDELIVERABLE' | 'RISKY' | 'UNKNOWN'
  quality_score: number
  is_valid_format: { value: boolean; text: string }
  is_disposable_email: { value: boolean; text: string }
  is_mx_found: { value: boolean; text: string }
  is_smtp_valid: { value: boolean; text: string }
  autocorrect: string
}

export async function validateWithAbstract(email: string): Promise<{
  success: true; data: AbstractResult
} | {
  success: false; error: string
} | null> {
  if (!ABSTRACT_API_KEY) return null
  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })

    if (res.status === 401) {
      return { success: false, error: 'Invalid API key' }
    }
    if (res.status === 429) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.' }
    }
    if (!res.ok) {
      return { success: false, error: 'Email verification service temporarily unavailable' }
    }

    const data = (await res.json()) as AbstractApiResponse & AbstractErrorResponse

    if (data.error?.message) {
      return { success: false, error: data.error.message }
    }

    return {
      success: true,
      data: {
        deliverability: data.deliverability,
        quality_score: data.quality_score,
        is_valid_format: data.is_valid_format,
        is_disposable_email: data.is_disposable_email,
        is_mx_found: data.is_mx_found,
        is_smtp_valid: data.is_smtp_valid,
        autocorrect: data.autocorrect,
      },
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Email verification service timed out' }
    }
    return { success: false, error: 'Network error: unable to reach email verification service' }
  }
}
