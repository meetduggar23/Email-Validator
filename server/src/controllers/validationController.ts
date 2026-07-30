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

    console.log(`\n=== CONTROLLER: Validating email: ${email} ===`)

    const result = await validateEmail(email)

    console.log(`CONTROLLER: DNS validation complete. domain=${result.domain}(${result.domainCheck}) mx=${result.mxRecords}(${result.mxCheck}) confidence=${result.confidenceScore}`)

    const abstractResult = await validateWithAbstract(email)

    if (abstractResult && abstractResult.success) {
      const apiData = abstractResult.data
      console.log(`CONTROLLER: Abstract API response: deliverability=${apiData.deliverability} quality_score=${apiData.quality_score} mx_found=${apiData.is_mx_found?.value} smtp_valid=${apiData.is_smtp_valid?.value} valid_format=${apiData.is_valid_format?.value} disposable=${apiData.is_disposable_email?.value} autocorrect=${apiData.autocorrect}`)

      result.syntax = apiData.is_valid_format?.value ?? result.syntax
      result.mxRecords = apiData.is_mx_found?.value ?? result.mxRecords
      if (apiData.is_mx_found?.value) {
        result.domain = true
      }

      if (apiData.is_disposable_email?.value) result.disposable = true

      if (apiData.is_smtp_valid?.value === true) result.smtp = true
      else if (apiData.is_smtp_valid?.value === false) result.smtp = false

      if (apiData.deliverability === 'DELIVERABLE') result.deliverability = 'high'
      else if (apiData.deliverability === 'UNDELIVERABLE') result.deliverability = 'low'
      else if (apiData.deliverability === 'RISKY') result.deliverability = 'medium'

      if (typeof apiData.quality_score === 'number') {
        const dnsScore = result.confidenceScore
        const apiScore = Math.round(apiData.quality_score)
        result.confidenceScore = Math.round(dnsScore * 0.4 + apiScore * 0.6)
        console.log(`CONTROLLER: Blended confidence: DNS=${dnsScore} API=${apiScore} blended=${result.confidenceScore}`)
      }

      if (apiData.autocorrect) {
        const atIndex = email.indexOf('@')
        const localPart = atIndex > -1 ? email.slice(0, atIndex) : ''
        const suggestion = `Did you mean ${localPart}@${apiData.autocorrect}?`
        if (!result.typoSuggestions.includes(suggestion)) {
          result.typoSuggestions.push(suggestion)
        }
      }
    } else if (abstractResult && !abstractResult.success) {
      console.log(`CONTROLLER: Abstract API error: ${abstractResult.error}`)
    } else {
      console.log(`CONTROLLER: Abstract API not configured or unavailable — using DNS results only`)
    }

    console.log(`CONTROLLER: Final result: syntax=${result.syntax} domain=${result.domain} mx=${result.mxRecords} disposable=${result.disposable} confidence=${result.confidenceScore} deliverability=${result.deliverability}`)

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

    const isSyntaxValid = result.syntax ? 1 : 0
    const isSyntaxInvalid = result.syntax ? 0 : 1
    db.prepare(`
      INSERT INTO daily_stats (date, total, valid, invalid, disposable)
      VALUES (date('now'), 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total = total + 1,
        valid = valid + ?,
        invalid = invalid + ?,
        disposable = disposable + ?
    `).run(
      isSyntaxValid, isSyntaxInvalid, result.disposable ? 1 : 0,
      isSyntaxValid, isSyntaxInvalid, result.disposable ? 1 : 0
    )

    const { debugLog, ...responseData } = result

    res.json({
      success: true,
      data: {
        id,
        ...responseData,
      },
      debug: debugLog,
    })

    console.log(`=== CONTROLLER: Done ===\n`)
  } catch (error: any) {
    console.error('Validation error:', error)
    if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      res.status(503).json({ success: false, error: 'DNS resolution failed. Please check your network connection.', debug: [`[ERROR] DNS resolution failed: ${error.code}`] })
      return
    }
    res.status(500).json({ success: false, error: 'Validation service temporarily unavailable', debug: [`[ERROR] ${error.message}`] })
  }
}
