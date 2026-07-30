import { Request, Response } from 'express'
import { getDb } from '../database'

export function getDashboardStats(req: Request, res: Response): void {
  try {
    const db = getDb()

    const totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
    const validEmails = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 1 AND is_disposable = 0").get() as any).count
    const invalidEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 0').get() as any).count
    const disposableEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE is_disposable = 1').get() as any).count
    const mxSuccess = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE mx_valid = 1').get() as any).count
    const todayValidated = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE date(created_at) = date('now')").get() as any).count

    const avgScore = db.prepare('SELECT AVG(confidence_score) as avg FROM validations').get() as any
    const averageScore = avgScore?.avg ? Math.round(avgScore.avg) : 0

    const deliverabilityRate = totalValidated > 0 ? Math.round((validEmails / totalValidated) * 100) : 0

    const validCount = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 1").get() as any).count
    const healthDistribution = {
      healthy: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE confidence_score >= 80").get() as any).count,
      risky: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE confidence_score >= 40 AND confidence_score < 80").get() as any).count,
      invalid: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE confidence_score < 40").get() as any).count,
    }

    const recentValidations = db.prepare(`
      SELECT id, email, syntax_valid, is_disposable, provider, confidence_score, created_at
      FROM validations ORDER BY created_at DESC LIMIT 10
    `).all() as any[]

    const dailyStats = db.prepare(`
      SELECT date, total, valid, invalid FROM daily_stats ORDER BY date DESC LIMIT 30
    `).all() as any[]

    const providerStats = db.prepare(`
      SELECT provider, COUNT(*) as count FROM validations WHERE provider IS NOT NULL AND provider != 'Unknown' GROUP BY provider ORDER BY count DESC LIMIT 10
    `).all() as any[]
    const totalWithProvider = providerStats.reduce((sum: number, p: any) => sum + p.count, 0)

    const hourlyActivity = db.prepare(`
      SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count
      FROM validations WHERE created_at >= datetime('now', '-7 days')
      GROUP BY hour ORDER BY hour
    `).all() as any[]

    const dayOfWeekActivity = db.prepare(`
      SELECT CAST(strftime('%w', created_at) AS INTEGER) as day, COUNT(*) as count
      FROM validations WHERE created_at >= datetime('now', '-30 days')
      GROUP BY day ORDER BY day
    `).all() as any[]

    const stats = {
      totalEmailsChecked: totalValidated,
      validEmails,
      invalidEmails,
      disposableEmails,
      deliverabilityRate,
      mxSuccess,
      averageScore,
      todayValidated,
      healthDistribution,
      recentValidations: recentValidations.map((v: any) => ({
        id: v.id,
        email: v.email,
        isValid: !!v.syntax_valid,
        isDisposable: !!v.is_disposable,
        provider: v.provider,
        confidenceScore: v.confidence_score,
        timestamp: v.created_at,
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
      hourlyActivity: hourlyActivity.map((h: any) => ({ hour: h.hour, count: h.count })),
      dayOfWeekActivity: dayOfWeekActivity.map((d: any) => ({ day: d.day, count: d.count })),
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
    const avgScore = db.prepare('SELECT AVG(confidence_score) as avg FROM validations').get() as any
    const averageScore = avgScore?.avg ? Math.round(avgScore.avg) : 0

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
        averageScore,
        providerStats: providerStats.map((p: any) => ({ provider: p.provider, count: p.count })),
        dailyStats: dailyStats.map((d: any) => ({
          date: d.date,
          total: d.total,
          valid: d.invalid,
          invalid: d.invalid,
        })),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get stats' })
  }
}
