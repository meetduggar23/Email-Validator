import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../database'
import { validateEmail } from '../services/emailValidationService'
import { validateWithAbstract } from '../services/abstractApiService'
import { AuthRequest } from '../middleware/auth'

export async function validateSingle(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body
    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' })
      return
    }

    const result = validateEmail(email)
    const abstractResult = await validateWithAbstract(email)

    if (abstractResult) {
      if (abstractResult.is_disposable_email?.value) result.disposable = true
      if (abstractResult.is_mx_found?.value === false) result.mxRecords = false
      if (abstractResult.is_smtp_valid?.value === true) result.smtp = true
      if (abstractResult.is_smtp_valid?.value === false) result.smtp = false
      if (abstractResult.is_valid_format?.value === false) result.syntax = false

      if (abstractResult.deliverability === 'DELIVERABLE') result.deliverability = 'high'
      else if (abstractResult.deliverability === 'UNDELIVERABLE') result.deliverability = 'low'
      else if (abstractResult.deliverability === 'RISKY') result.deliverability = 'medium'

      if (typeof abstractResult.quality_score === 'number') {
        result.confidenceScore = Math.round(abstractResult.quality_score)
      }

      if (abstractResult.autocorrect) {
        result.typoSuggestions.push(`Did you mean ${abstractResult.autocorrect}?`)
      }
    }

    const db = getDb()
    const id = uuidv4()
    const authReq = req as AuthRequest

    db.prepare(`
      INSERT INTO validations (id, email, user_id, syntax_valid, domain_valid, mx_valid, smtp_valid, is_disposable, provider, deliverability, confidence_score, suggestions, typo_suggestions, result_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, result.email, authReq.userId || null,
      result.syntax ? 1 : 0, result.domain ? 1 : 0, result.mxRecords ? 1 : 0,
      result.smtp === null ? null : (result.smtp ? 1 : 0),
      result.disposable ? 1 : 0, result.provider, result.deliverability,
      result.confidenceScore, JSON.stringify(result.suggestions),
      JSON.stringify(result.typoSuggestions), JSON.stringify(result)
    )

    db.prepare(`
      INSERT INTO daily_stats (date, total, valid, invalid, disposable)
      VALUES (date('now'), 1, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total = total + 1,
        valid = valid + ?,
        invalid = invalid + ?,
        disposable = disposable + ?
    `).run(
      result.syntax ? 1 : 0, result.syntax ? 0 : 1,
      result.syntax ? 1 : 0, result.syntax ? 0 : 1,
      result.disposable ? 1 : 0
    )

    res.json({ success: true, data: { id, ...result } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Validation failed' })
  }
}
