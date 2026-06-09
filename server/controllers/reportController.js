const Lead = require('../models/Lead');
const dayjs = require('dayjs');

const exportReport = async (req, res, next) => {
  try {
    const { format = 'excel', from, to, source, status } = req.query;

    const filter = {};
    if (req.user.role === 'sales_rep') filter.assignedTo = req.user._id;
    if (source) filter.source = source;
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const rows = leads.map((l) => ({
      Name: l.name,
      Email: l.email || '',
      Phone: l.phone || '',
      Source: l.source,
      Campaign: l.campaign || '',
      Status: l.status,
      'Assigned To': l.assignedTo?.name || 'Unassigned',
      Service: l.service || '',
      'Created At': dayjs(l.createdAt).format('YYYY-MM-DD HH:mm'),
    }));

    if (format === 'excel') {
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      // Auto column widths
      const maxWidth = rows.reduce((acc, row) => {
        Object.keys(row).forEach((k, i) => {
          acc[i] = Math.max(acc[i] || k.length, String(row[k]).length);
        });
        return acc;
      }, {});
      ws['!cols'] = Object.values(maxWidth).map((w) => ({ wch: Math.min(w + 2, 30) }));

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=leads_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      return res.send(buf);
    }

    if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=leads_${dayjs().format('YYYY-MM-DD')}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).fillColor('#6366f1').text('LeadFlow CRM — Leads Report', { align: 'center' });
      doc.fontSize(9).fillColor('#64748b').text(`Generated: ${dayjs().format('MMMM D, YYYY HH:mm')} | Total: ${rows.length} leads`, { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(800, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);

      if (rows.length === 0) {
        doc.fontSize(12).fillColor('#64748b').text('No leads found for the selected filters.', { align: 'center' });
      } else {
        const headers = Object.keys(rows[0]);
        const colWidth = Math.floor(760 / headers.length);
        let y = doc.y;

        doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e293b');
        headers.forEach((h, i) => {
          doc.text(h, 40 + i * colWidth, y, { width: colWidth - 4, ellipsis: true });
        });
        y += 14;
        doc.moveTo(40, y).lineTo(800, y).strokeColor('#cbd5e1').stroke();
        y += 4;

        doc.font('Helvetica').fillColor('#374151');
        rows.forEach((row) => {
          if (y > 540) {
            doc.addPage({ layout: 'landscape' });
            y = 40;
          }
          Object.values(row).forEach((val, i) => {
            doc.fontSize(7.5).text(String(val), 40 + i * colWidth, y, { width: colWidth - 4, ellipsis: true });
          });
          y += 13;
        });
      }

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid format. Use excel or pdf.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { exportReport };
