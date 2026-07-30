import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../database'
import { validateBulk } from '../services/emailValidationService'
import { AuthRequest } from '../middleware/auth'

export async function uploadBulk(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' })
      return
    }

    const content = file.buffer.toString('utf-8')
    const emails = content
      .split(/[\n\r,]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0 && e.includes('@'))

    if (emails.length === 0) {
      res.status(400).json({ success: false, error: 'No valid email addresses found in file' })
      return
    }

    const jobId = uuidv4()
    const authReq = req as AuthRequest
    const db = getDb()

    db.prepare(`
      INSERT INTO bulk_jobs (id, user_id, filename, total_emails, status)
      VALUES (?, ?, ?, ?, 'processing')
    `).run(jobId, authReq.userId || null, file.originalname, emails.length)

    const results = await validateBulk(emails)
    let validCount = 0
    let invalidCount = 0
    let disposableCount = 0

    const insertResult = db.prepare(`
      INSERT INTO bulk_results (id, job_id, email, status, result_json)
      VALUES (?, ?, ?, ?, ?)
    `)

    const insertMany = db.transaction(() => {
      for (const result of results) {
        const resultId = uuidv4()
        insertResult.run(
          resultId, jobId, result.email,
          result.syntax ? 'completed' : 'failed',
          JSON.stringify(result)
        )
        if (result.syntax && !result.disposable) validCount++
        else if (result.syntax && result.disposable) { validCount++; disposableCount++ }
        else invalidCount++
      }
    })
    insertMany()

    db.prepare(`
      UPDATE bulk_jobs SET
        processed_emails = ?,
        valid_emails = ?,
        invalid_emails = ?,
        disposable_emails = ?,
        status = 'completed',
        completed_at = datetime('now')
      WHERE id = ?
    `).run(emails.length, validCount, invalidCount, disposableCount, jobId)

    const today = new Date().toISOString().split('T')[0]
    const existing = db.prepare('SELECT id FROM daily_stats WHERE date = ?').get(today) as any
    if (existing) {
      db.prepare(`
        UPDATE daily_stats SET total = total + ?, valid = valid + ?, invalid = invalid + ?, disposable = disposable + ?
        WHERE date = ?
      `).run(emails.length, validCount, invalidCount, disposableCount, today)
    } else {
      db.prepare(`
        INSERT INTO daily_stats (date, total, valid, invalid, disposable)
        VALUES (?, ?, ?, ?, ?)
      `).run(today, emails.length, validCount, invalidCount, disposableCount)
    }

    const job = db.prepare('SELECT * FROM bulk_jobs WHERE id = ?').get(jobId) as any
    const jobResults = db.prepare('SELECT * FROM bulk_results WHERE job_id = ?').all(jobId) as any[]

    res.json({
      success: true,
      data: {
        job: {
          id: job.id,
          filename: job.filename,
          totalEmails: job.total_emails,
          processedEmails: job.processed_emails,
          validEmails: job.valid_emails,
          invalidEmails: job.invalid_emails,
          disposableEmails: job.disposable_emails,
          status: job.status,
          createdAt: job.created_at,
          completedAt: job.completed_at,
        },
        results: jobResults.map((r: any) => ({
          id: r.id,
          email: r.email,
          status: r.status,
          result: JSON.parse(r.result_json || '{}'),
        })),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Bulk validation failed' })
  }
}

export function getBulkJobs(req: Request, res: Response): void {
  try {
    const db = getDb()
    const jobs = db.prepare(`
      SELECT * FROM bulk_jobs ORDER BY created_at DESC LIMIT 50
    `).all() as any[]

    res.json({
      success: true,
      data: jobs.map((j: any) => ({
        id: j.id,
        filename: j.filename,
        totalEmails: j.total_emails,
        processedEmails: j.processed_emails,
        validEmails: j.valid_emails,
        invalidEmails: j.invalid_emails,
        disposableEmails: j.disposable_emails,
        status: j.status,
        createdAt: j.created_at,
        completedAt: j.completed_at,
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get bulk jobs' })
  }
}

export function getBulkResults(req: Request, res: Response): void {
  try {
    const { jobId } = req.params
    const db = getDb()
    const results = db.prepare('SELECT * FROM bulk_results WHERE job_id = ?').all(jobId) as any[]

    res.json({
      success: true,
      data: results.map((r: any) => ({
        id: r.id,
        email: r.email,
        status: r.status,
        result: r.result_json ? JSON.parse(r.result_json) : null,
        error: r.error,
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get bulk results' })
  }
}
