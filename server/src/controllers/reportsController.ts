import { Request, Response } from 'express'
import { getDb } from '../database'
import * as XLSX from 'xlsx'
import PDFDocument from 'pdfkit'

export function exportCSV(req: Request, res: Response): void {
  try {
    const db = getDb()
    const items = db.prepare('SELECT * FROM validations ORDER BY created_at DESC LIMIT 10000').all() as any[]
    const headers = 'Email,Syntax Valid,Domain Valid,MX Records,Disposable,Provider,Confidence Score,Health Score,Timestamp\n'
    const rows = items.map((v: any) =>
      `"${v.email}",${v.syntax_valid},${v.domain_valid},${v.mx_valid},${v.is_disposable},"${v.provider}",${v.confidence_score},${v.health_score || v.confidence_score},"${v.created_at}"`
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
      healthScore: v.health_score || v.confidence_score,
      timestamp: v.created_at,
    }))
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename=email-validation-report.json')
    res.json(data)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' })
  }
}

export function exportExcel(req: Request, res: Response): void {
  try {
    const db = getDb()
    const items = db.prepare('SELECT * FROM validations ORDER BY created_at DESC LIMIT 10000').all() as any[]

    const data = items.map((v: any) => ({
      Email: v.email,
      'Syntax Valid': v.syntax_valid ? 'Yes' : 'No',
      'Domain Valid': v.domain_valid ? 'Yes' : 'No',
      'MX Records': v.mx_valid ? 'Yes' : 'No',
      Disposable: v.is_disposable ? 'Yes' : 'No',
      Provider: v.provider || 'Unknown',
      'Confidence Score': v.confidence_score,
      'Health Score': v.health_score || v.confidence_score,
      Timestamp: v.created_at,
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [
      { wch: 35 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 22 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Validations')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=email-validation-report.xlsx')
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Excel export failed' })
  }
}

export function exportPDF(req: Request, res: Response): void {
  try {
    const db = getDb()
    const total = (db.prepare('SELECT COUNT(*) as count FROM validations').get() as any).count
    const valid = (db.prepare("SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 1 AND is_disposable = 0").get() as any).count
    const invalid = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE syntax_valid = 0').get() as any).count
    const disposable = (db.prepare('SELECT COUNT(*) as count FROM validations WHERE is_disposable = 1').get() as any).count
    const avgScore = (db.prepare('SELECT AVG(confidence_score) as avg FROM validations').get() as any).avg || 0
    const items = db.prepare('SELECT * FROM validations ORDER BY created_at DESC LIMIT 50').all() as any[]

    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=email-validation-report.pdf')
    doc.pipe(res)

    doc.fontSize(22).font('Helvetica-Bold').text('Email Validation Report', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
    doc.moveDown(1)

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text('Summary')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#333')

    const summaryItems = [
      ['Total Validated', String(total)],
      ['Valid Emails', String(valid)],
      ['Invalid Emails', String(invalid)],
      ['Disposable Detected', String(disposable)],
      ['Average Confidence', `${Math.round(avgScore)}%`],
    ]

    const tableTop = doc.y
    for (let i = 0; i < summaryItems.length; i++) {
      const y = tableTop + i * 20
      doc.fillColor('#666').text(summaryItems[i][0], 40, y, { width: 200 })
      doc.fillColor('#111').text(summaryItems[i][1], 250, y, { width: 100, align: 'right' })
    }

    doc.moveDown(2)
    if (items.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#111').text('Recent Validations')
      doc.moveDown(0.3)
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#666')
      const colX = [40, 200, 280, 340, 400, 480]
      const headers = ['Email', 'Status', 'Provider', 'Score', 'Date']
      headers.forEach((h, i) => doc.text(h, colX[i], doc.y, { width: 100 }))
      doc.moveDown(0.3)

      doc.fontSize(8).font('Helvetica').fillColor('#333')
      for (const item of items.slice(0, 30)) {
        if (doc.y > 750) {
          doc.addPage()
          doc.fontSize(8).font('Helvetica-Bold').fillColor('#666')
          headers.forEach((h, i) => doc.text(h, colX[i], doc.y, { width: 100 }))
          doc.moveDown(0.3)
          doc.fontSize(8).font('Helvetica').fillColor('#333')
        }
        const y = doc.y
        const status = item.syntax_valid && !item.is_disposable ? 'Valid' : item.is_disposable ? 'Disposable' : 'Invalid'
        doc.text(item.email, colX[0], y, { width: 150 })
        doc.text(status, colX[1], y, { width: 70 })
        doc.text(item.provider || '-', colX[2], y, { width: 60 })
        doc.text(String(item.confidence_score), colX[3], y, { width: 50 })
        doc.text(item.created_at?.slice(0, 10) || '', colX[4], y, { width: 80 })
        doc.moveDown(0.8)
      }
    }

    doc.end()
  } catch (error) {
    res.status(500).json({ success: false, error: 'PDF export failed' })
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
    const avgScore = (db.prepare('SELECT AVG(confidence_score) as avg FROM validations').get() as any).avg || 0

    res.json({
      success: true,
      data: {
        total, valid, invalid, disposable, duplicates, unknown: 0,
        risky: disposable + invalid,
        averageScore: Math.round(avgScore),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get report summary' })
  }
}
