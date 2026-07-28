import { Request, Response } from 'express'
import { getDb } from '../database'

export function exportCSV(req: Request, res: Response): void {
  try {
    const db = getDb()
    const items = db.prepare('SELECT * FROM validations ORDER BY created_at DESC LIMIT 10000').all() as any[]
    const headers = 'Email,Syntax Valid,Domain Valid,MX Records,Disposable,Provider,Confidence Score,Timestamp\n'
    const rows = items.map((v: any) =>
      `"${v.email}",${v.syntax_valid},${v.domain_valid},${v.mx_valid},${v.is_disposable},"${v.provider}",${v.confidence_score},"${v.created_at}"`
    ).join('\n')
    const csv = '\uFEFF' + headers + rows
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=email-validation-report.csv')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' })
  }
}

export function exportJSON(req: Request, res: Response): void {
  try {
    const db = getDb()
    const items = db.prepare('SELECT * FROM validations ORDER BY created_at DESC LIMIT 10000').all() as any[]
    const data = items.map((v: any) => ({
      email: v.email,
      syntaxValid: !!v.syntax_valid,
      domainValid: !!v.domain_valid,
      mxValid: !!v.mx_valid,
      isDisposable: !!v.is_disposable,
      provider: v.provider,
      confidenceScore: v.confidence_score,
      timestamp: v.created_at,
    }))
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename=email-validation-report.json')
    res.json(data)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' })
  }
}

export function getReportSummary(req: Request, res: Response): void {
  try {
    const db = getDb()
    const total = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
    const valid = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 1 AND is_disposable = 0").get() as any).count
    const invalid = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 0').get() as any).count
    const disposable = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE is_disposable = 1').get() as any).count
    const duplicates = (db.prepare(`
      SELECT COUNT(*) - COUNT(DISTINCT email) as count FROM validations
    `).get() as any).count

    res.json({
      success: true,
      data: { total, valid, invalid, disposable, duplicates, unknown: 0, risky: disposable + invalid },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get report summary' })
  }
}
