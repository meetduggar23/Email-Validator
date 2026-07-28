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

export async function validateWithAbstract(email: string): Promise<Partial<AbstractApiResponse> | null> {
  if (!ABSTRACT_API_KEY) return null
  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = (await res.json()) as AbstractApiResponse
    return {
      email: data.email,
      autocorrect: data.autocorrect,
      deliverability: data.deliverability,
      quality_score: data.quality_score,
      is_valid_format: data.is_valid_format,
      is_free_email: data.is_free_email,
      is_disposable_email: data.is_disposable_email,
      is_role_email: data.is_role_email,
      is_catchall_email: data.is_catchall_email,
      is_mx_found: data.is_mx_found,
      is_smtp_valid: data.is_smtp_valid,
    }
  } catch {
    return null
  }
}
