import { Request, Response } from 'express'
import { getDb } from '../database'
import { AuthRequest } from '../middleware/auth'

export function getDashboardStats(req: Request, res: Response): void {
  try {
    const db = getDb()

    const totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
    const validEmails = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 1 AND is_disposable = 0").get() as any).count
    const invalidEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 0').get() as any).count
    const disposableEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE is_disposable = 1').get() as any).count
    const mxSuccess = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE mx_valid = 1').get() as any).count

    const deliverabilityRate = totalValidated > 0 ? Math.round((validEmails / totalValidated) * 100) : 0

    const recentUploads = db.prepare('SELECT * FROM bulk_jobs ORDER BY created_at DESC LIMIT 5').all() as any[]

    const dailyStats = db.prepare(`
      SELECT date, total, valid, invalid FROM daily_stats ORDER BY date DESC LIMIT 30
    `).all() as any[]

    const providerStats = db.prepare(`
      SELECT provider, COUNT(*) as count FROM validations WHERE provider IS NOT NULL GROUP BY provider ORDER BY count DESC LIMIT 10
    `).all() as any[]
    const totalWithProvider = providerStats.reduce((sum: number, p: any) => sum + p.count, 0)

    const stats = {
      totalEmailsChecked: totalValidated,
      validEmails,
      invalidEmails,
      disposableEmails,
      deliverabilityRate,
      mxSuccess,
      recentUploads: recentUploads.map((j: any) => ({
        id: j.id,
        filename: j.filename,
        totalEmails: j.total_emails,
        status: j.status,
        createdAt: j.created_at,
      })),
      dailyStats: dailyStats.map((d: any) => ({
        date: d.date,
        total: d.total,
        valid: d.valid,
        invalid: d.invalid,
      })).reverse(),
      providerStats: providerStats.map((p: any) => ({
        provider: p.provider,
        count: p.count,
        percentage: totalWithProvider > 0 ? Math.round((p.count / totalWithProvider) * 100) : 0,
      })),
    }

    res.json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' })
  }
}

export function getStats(req: Request, res: Response): void {
  try {
    const db = getDb()

    const totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
    const todayValidated = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE date(created_at) = date('now')").get() as any).count

    const providerStats = db.prepare(`
      SELECT provider, COUNT(*) as count FROM validations WHERE provider IS NOT NULL GROUP BY provider ORDER BY count DESC LIMIT 10
    `).all() as any[]

    const dailyStats = db.prepare(`
      SELECT date, total, valid, invalid FROM daily_stats ORDER BY date ASC LIMIT 30
    `).all() as any[]

    res.json({
      success: true,
      data: {
        totalValidated,
        todayValidated,
        providerStats: providerStats.map((p: any) => ({ provider: p.provider, count: p.count })),
        dailyStats: dailyStats.map((d: any) => ({
          date: d.date,
          total: d.total,
          valid: d.valid,
          invalid: d.invalid,
        })),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get stats' })
  }
}
