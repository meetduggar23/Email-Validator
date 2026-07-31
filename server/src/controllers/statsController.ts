import { Request, Response } from 'express'
import { getDb } from '../database'
import { AuthRequest } from '../middleware/auth'

export function getDashboardStats(req: Request, res: Response): void {
  try {
    const authReq = req as AuthRequest
    const db = getDb()
    const userId = authReq.userId

    let totalValidated = 0
    let validEmails = 0
    let invalidEmails = 0
    let disposableEmails = 0
    let mxSuccess = 0
    let todayValidated = 0
    let averageScore = 0
    let healthDistribution = { healthy: 0, risky: 0, invalid: 0 }
    let recentValidations: any[] = []
    let dailyStats: any[] = []
    let providerStats: any[] = []
    let hourlyActivity: any[] = []
    let dayOfWeekActivity: any[] = []

    if (userId) {
      // User-specific stats
      totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE user_id = ?').get(userId) as any).count
      validEmails = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND syntax_valid = 1 AND is_disposable = 0").get(userId) as any).count
      invalidEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND syntax_valid = 0').get(userId) as any).count
      disposableEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND is_disposable = 1').get(userId) as any).count
      mxSuccess = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND mx_valid = 1').get(userId) as any).count
      todayValidated = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND date(created_at) = date('now')").get(userId) as any).count

      const avgScore = db.prepare('SELECT AVG(confidence_score) as avg FROM validations WHERE user_id = ?').get(userId) as any
      averageScore = avgScore?.avg ? Math.round(avgScore.avg) : 0

      healthDistribution = {
        healthy: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND confidence_score >= 80").get(userId) as any).count,
        risky: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND confidence_score >= 40 AND confidence_score < 80").get(userId) as any).count,
        invalid: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND confidence_score < 40").get(userId) as any).count,
      }

      recentValidations = db.prepare(`
        SELECT id, email, syntax_valid, is_disposable, provider, confidence_score, created_at
        FROM validations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
      `).all(userId) as any[]

      // Generate daily stats dynamically per user
      const dailyStatsRaw = db.prepare(`
        SELECT date(created_at) as date, COUNT(*) as total,
               SUM(CASE WHEN syntax_valid = 1 AND is_disposable = 0 THEN 1 ELSE 0 END) as valid,
               SUM(CASE WHEN syntax_valid = 0 THEN 1 ELSE 0 END) as invalid
        FROM validations WHERE user_id = ?
        GROUP BY date ORDER BY date DESC LIMIT 30
      `).all(userId) as any[]
      dailyStats = dailyStatsRaw.reverse()

      providerStats = db.prepare(`
        SELECT provider, COUNT(*) as count FROM validations
        WHERE user_id = ? AND provider IS NOT NULL AND provider != 'Unknown'
        GROUP BY provider ORDER BY count DESC LIMIT 10
      `).all(userId) as any[]

      hourlyActivity = db.prepare(`
        SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count
        FROM validations WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
        GROUP BY hour ORDER BY hour
      `).all(userId) as any[]

      dayOfWeekActivity = db.prepare(`
        SELECT CAST(strftime('%w', created_at) AS INTEGER) as day, COUNT(*) as count
        FROM validations WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
        GROUP BY day ORDER BY day
      `).all(userId) as any[]
    } else {
      // Global metrics for landing page / guest view
      totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
      validEmails = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 1 AND is_disposable = 0").get() as any).count
      invalidEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 0').get() as any).count
      disposableEmails = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE is_disposable = 1').get() as any).count
      mxSuccess = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE mx_valid = 1').get() as any).count
      todayValidated = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE date(created_at) = date('now')").get() as any).count

      const avgScore = db.prepare('SELECT AVG(confidence_score) as avg FROM validations').get() as any
      averageScore = avgScore?.avg ? Math.round(avgScore.avg) : 0

      healthDistribution = {
        healthy: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE confidence_score >= 80").get() as any).count,
        risky: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE confidence_score >= 40 AND confidence_score < 80").get() as any).count,
        invalid: (db.prepare("SELECT COUNT(*) as count FROM validations WHERE confidence_score < 40").get() as any).count,
      }

      recentValidations = [] // Do not leak other users' validation emails to guests

      const dailyStatsRaw = db.prepare(`
        SELECT date, total, valid, invalid FROM daily_stats ORDER BY date DESC LIMIT 30
      `).all() as any[]
      dailyStats = dailyStatsRaw.reverse()

      providerStats = db.prepare(`
        SELECT provider, COUNT(*) as count FROM validations
        WHERE provider IS NOT NULL AND provider != 'Unknown'
        GROUP BY provider ORDER BY count DESC LIMIT 10
      `).all() as any[]

      hourlyActivity = db.prepare(`
        SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count
        FROM validations WHERE created_at >= datetime('now', '-7 days')
        GROUP BY hour ORDER BY hour
      `).all() as any[]

      dayOfWeekActivity = db.prepare(`
        SELECT CAST(strftime('%w', created_at) AS INTEGER) as day, COUNT(*) as count
        FROM validations WHERE created_at >= datetime('now', '-30 days')
        GROUP BY day ORDER BY day
      `).all() as any[]
    }

    const deliverabilityRate = totalValidated > 0 ? Math.round((validEmails / totalValidated) * 100) : 0
    const totalWithProvider = providerStats.reduce((sum: number, p: any) => sum + p.count, 0)

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
      })),
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
    const authReq = req as AuthRequest
    const db = getDb()
    const userId = authReq.userId

    let totalValidated = 0
    let todayValidated = 0
    let averageScore = 0
    let providerStats: any[] = []
    let dailyStats: any[] = []

    if (userId) {
      totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE user_id = ?').get(userId) as any).count
      todayValidated = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE user_id = ? AND date(created_at) = date('now')").get(userId) as any).count
      
      const avgScore = db.prepare('SELECT AVG(confidence_score) as avg FROM validations WHERE user_id = ?').get(userId) as any
      averageScore = avgScore?.avg ? Math.round(avgScore.avg) : 0

      providerStats = db.prepare(`
        SELECT provider, COUNT(*) as count FROM validations WHERE user_id = ? AND provider IS NOT NULL GROUP BY provider ORDER BY count DESC LIMIT 10
      `).all(userId) as any[]

      dailyStats = db.prepare(`
        SELECT date(created_at) as date, COUNT(*) as total,
               SUM(CASE WHEN syntax_valid = 1 AND is_disposable = 0 THEN 1 ELSE 0 END) as valid,
               SUM(CASE WHEN syntax_valid = 0 THEN 1 ELSE 0 END) as invalid
        FROM validations WHERE user_id = ?
        GROUP BY date ORDER BY date ASC LIMIT 30
      `).all(userId) as any[]
    } else {
      totalValidated = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
      todayValidated = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE date(created_at) = date('now')").get() as any).count
      
      const avgScore = db.prepare('SELECT AVG(confidence_score) as avg FROM validations').get() as any
      averageScore = avgScore?.avg ? Math.round(avgScore.avg) : 0

      providerStats = db.prepare(`
        SELECT provider, COUNT(*) as count FROM validations WHERE provider IS NOT NULL GROUP BY provider ORDER BY count DESC LIMIT 10
      `).all() as any[]

      dailyStats = db.prepare(`
        SELECT date, total, valid, invalid FROM daily_stats ORDER BY date ASC LIMIT 30
      `).all() as any[]
    }

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
          valid: d.valid, // Fix d.invalid copy-paste bug
          invalid: d.invalid,
        })),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get stats' })
  }
}
