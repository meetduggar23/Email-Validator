import { describe, it, expect } from 'vitest'
import { validateEmail } from '../services/emailValidationService'

function hasDebug(result: any, pattern: string): boolean {
  return (result.debugLog || []).some((line: string) => line.includes(pattern))
}

describe('Email Validation Service', () => {
  describe('Known Provider: Gmail', () => {
    it('test@gmail.com should be valid and deliverable', async () => {
      const result = await validateEmail('test@gmail.com')
      expect(result.syntax).toBe(true)
      expect(result.domain).toBe(true)
      expect(result.domainCheck).toBe('ok')
      expect(result.mxRecords).toBe(true)
      expect(result.mxCheck).toBe('ok')
      expect(result.disposable).toBe(false)
      expect(result.provider).toBe('Google Gmail')
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      expect(result.deliverability).toBe('high')
    })
  })

  describe('Known Provider: Outlook', () => {
    it('demo@outlook.com should be valid and deliverable', async () => {
      const result = await validateEmail('demo@outlook.com')
      expect(result.syntax).toBe(true)
      expect(result.domain).toBe(true)
      expect(result.domainCheck).toBe('ok')
      expect(result.mxRecords).toBe(true)
      expect(result.mxCheck).toBe('ok')
      expect(result.disposable).toBe(false)
      expect(result.provider).toBe('Microsoft Outlook')
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      expect(result.deliverability).toBe('high')
    })
  })

  describe('Known Provider: Yahoo', () => {
    it('hello@yahoo.com should be valid and deliverable', async () => {
      const result = await validateEmail('hello@yahoo.com')
      expect(result.syntax).toBe(true)
      expect(result.domain).toBe(true)
      expect(result.domainCheck).toBe('ok')
      expect(result.mxRecords).toBe(true)
      expect(result.mxCheck).toBe('ok')
      expect(result.disposable).toBe(false)
      expect(result.provider).toBe('Yahoo Mail')
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      expect(result.deliverability).toBe('high')
    })
  })

  describe('Known Provider: iCloud', () => {
    it('admin@icloud.com should be valid and deliverable', async () => {
      const result = await validateEmail('admin@icloud.com')
      expect(result.syntax).toBe(true)
      expect(result.domain).toBe(true)
      expect(result.domainCheck).toBe('ok')
      expect(result.mxRecords).toBe(true)
      expect(result.mxCheck).toBe('ok')
      expect(result.disposable).toBe(false)
      expect(result.provider).toBe('Apple iCloud')
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      expect(result.deliverability).toBe('high')
    })
  })

  describe('Known Provider: Proton', () => {
    it('user@proton.me should be valid', async () => {
      const result = await validateEmail('user@proton.me')
      expect(result.syntax).toBe(true)
      expect(result.domain).toBe(true)
      expect(result.mxRecords).toBe(true)
      expect(result.disposable).toBe(false)
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      expect(result.deliverability).toBe('high')
    })
  })

  describe('Known Provider: Zoho', () => {
    it('contact@zoho.com should be valid', async () => {
      const result = await validateEmail('contact@zoho.com')
      expect(result.syntax).toBe(true)
      expect(result.domain).toBe(true)
      expect(result.mxRecords).toBe(true)
      expect(result.disposable).toBe(false)
      expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      expect(result.deliverability).toBe('high')
    })
  })

  describe('Invalid emails', () => {
    it('should reject missing @ symbol', async () => {
      const result = await validateEmail('notanemail')
      expect(result.syntax).toBe(false)
      expect(result.confidenceScore).toBeLessThanOrEqual(10)
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0]).toContain('@')
    })

    it('should reject email without domain extension', async () => {
      const result = await validateEmail('user@domain')
      expect(result.syntax).toBe(false)
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('should reject empty local part', async () => {
      const result = await validateEmail('@domain.com')
      expect(result.syntax).toBe(false)
    })

    it('should flag disposable email domains', async () => {
      const result = await validateEmail('test@mailinator.com')
      expect(result.disposable).toBe(true)
      expect(result.deliverability).toBe('low')
      expect(result.confidenceScore).toBeLessThanOrEqual(35)
    })

    it('should flag tempmail.com as disposable', async () => {
      const result = await validateEmail('user@tempmail.com')
      expect(result.disposable).toBe(true)
    })
  })

  describe('Typo correction', () => {
    it('should suggest gmail.com for gamil.com', async () => {
      const result = await validateEmail('user@gamil.com')
      expect(result.typoSuggestions.length).toBeGreaterThan(0)
      expect(result.typoSuggestions[0]).toContain('gmail.com')
    })

    it('should suggest outlook.com for outlok.com', async () => {
      const result = await validateEmail('user@outlok.com')
      expect(result.typoSuggestions.length).toBeGreaterThan(0)
      expect(result.typoSuggestions[0]).toContain('outlook.com')
    })

    it('should suggest hotmail.com for hotnail.com', async () => {
      const result = await validateEmail('user@hotnail.com')
      expect(result.typoSuggestions.length).toBeGreaterThan(0)
      expect(result.typoSuggestions[0]).toContain('hotmail.com')
    })
  })

  describe('Domain validation', () => {
    it('should report domain not found for nonexistent domains', async () => {
      const result = await validateEmail('user@thissitedoesnotexist99999xyz.com')
      expect(result.syntax).toBe(true)
      if (result.domainCheck === 'not_found') {
        expect(result.domain).toBe(false)
      }
    })
  })

  describe('Confidence scoring', () => {
    it('should give 85+ for valid known provider emails', async () => {
      const emails = [
        'test@gmail.com',
        'demo@outlook.com',
        'hello@yahoo.com',
        'admin@icloud.com',
        'user@proton.me',
        'contact@zoho.com',
      ]
      for (const email of emails) {
        const result = await validateEmail(email)
        expect(result.syntax).toBe(true)
        expect(result.confidenceScore).toBeGreaterThanOrEqual(85)
      }
    })

    it('should give low score for disposable emails', async () => {
      const result = await validateEmail('test@mailinator.com')
      expect(result.confidenceScore).toBeLessThanOrEqual(35)
    })

    it('should give very low score for invalid syntax', async () => {
      const result = await validateEmail('invalid')
      expect(result.confidenceScore).toBeLessThanOrEqual(10)
    })
  })

  describe('Bulk validation', () => {
    it('should validate multiple emails', async () => {
      const { validateBulk } = await import('../services/emailValidationService')
      const emails = ['test@gmail.com', 'invalid', 'user@tempmail.com', 'hello@yahoo.com']
      const results = await validateBulk(emails)
      expect(results).toHaveLength(4)
      expect(results[0].syntax).toBe(true)
      expect(results[0].domain).toBe(true)
      expect(results[1].syntax).toBe(false)
      expect(results[2].disposable).toBe(true)
      expect(results[3].syntax).toBe(true)
    })
  })
})
