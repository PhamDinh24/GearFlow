import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, ImageRun } from 'docx';

export interface ReportData {
  title: string;
  period: string;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
  revenueByDate: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  ordersByStatus: Record<string, number>;
  paymentMethods?: Record<string, number>;
  charts?: {
    revenueChart?: string;
    statusChart?: string;
    paymentChart?: string;
  };
}

/**
 * Helper to remove Vietnamese accents for PDF export
 */
const removeAccents = (str: string): string => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export const exportService = {
  // Export to Excel
  exportToExcel(data: ReportData) {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['BÁO CÁO KINH DOANH'],
      ['Kỳ báo cáo:', data.period],
      [''],
      ['TỔNG QUAN'],
      ['Tổng doanh thu:', `${(data.stats.totalRevenue / 1000000).toFixed(2)}M VNĐ`],
      ['Tổng đơn hàng:', data.stats.totalOrders],
      ['Tổng sản phẩm:', data.stats.totalProducts],
      ['Tổng khách hàng:', data.stats.totalCustomers],
      [''],
      ['DOANH THU THEO NGÀY'],
      ['Ngày', 'Doanh thu (VNĐ)'],
      ...data.revenueByDate.map(item => [item.date, item.revenue]),
      [''],
      ['SẢN PHẨM BÁN CHẠY'],
      ['Tên sản phẩm', 'Đã bán', 'Doanh thu (VNĐ)'],
      ...data.topProducts.map(item => [item.name, item.sold, item.revenue]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');

    // Generate filename
    const filename = `BaoCao_${data.period.replace(/\s/g, '_')}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, filename);
  },

  // Export to PDF via HTML Print (Supports Vietnamese perfectly and looks much better)
  exportToPDF(data: ReportData) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép popup để xuất PDF');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>\${data.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; margin: 0; background: #fff; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #4f46e5; letter-spacing: 2px; margin-bottom: 5px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0; }
          .period { font-size: 14px; color: #64748b; margin-top: 5px; }
          
          .section-title { font-size: 16px; font-weight: 800; color: #334155; margin-top: 35px; margin-bottom: 15px; text-transform: uppercase; border-left: 4px solid #4f46e5; padding-left: 12px; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
          .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; }
          .stat-value { font-size: 24px; font-weight: 800; color: #0f172a; }
          .stat-value.primary { color: #4f46e5; }
          
          .charts-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; page-break-inside: avoid; }
          .chart-box { text-align: center; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background: #fff; }
          .chart-title { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 15px; text-transform: uppercase; }
          .chart-img { max-width: 100%; height: auto; border-radius: 8px; }
          
          .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th { background: #f1f5f9; color: #334155; font-weight: 600; text-transform: uppercase; font-size: 11px; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
          tr:nth-child(even) { background-color: #f8fafc; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .signatures { display: flex; justify-content: space-around; margin-top: 50px; page-break-inside: avoid; }
          .signature-box { text-align: center; }
          .signature-title { font-weight: 600; color: #334155; font-size: 14px; }
          .signature-sub { font-size: 11px; color: #64748b; font-style: italic; margin-top: 4px; }
          
          @media print {
            body { padding: 0; }
            .chart-box { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">GEARFLOW</div>
          <h1 class="title">${data.title}</h1>
          <div class="period">Kỳ báo cáo: ${data.period}</div>
        </div>

        <div class="section-title">Tổng quan kinh doanh</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">Tổng doanh thu</div>
            <div class="stat-value primary">${(data.stats.totalRevenue / 1000000).toFixed(2)}M đ</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Tổng đơn hàng</div>
            <div class="stat-value">${data.stats.totalOrders}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Sản phẩm đã bán</div>
            <div class="stat-value">${data.stats.totalProducts}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Khách hàng mới</div>
            <div class="stat-value">${data.stats.totalCustomers}</div>
          </div>
        </div>

        ${data.charts?.revenueChart || data.charts?.statusChart ? `
        <div class="section-title">Phân tích biểu đồ</div>
        <div class="charts-container">
          ${data.charts.revenueChart ? `
          <div class="chart-box" style="grid-column: 1 / -1;">
            <div class="chart-title">Biểu đồ Tăng trưởng Doanh thu</div>
            <img class="chart-img" style="max-height: 250px;" src="${data.charts.revenueChart}" alt="Revenue" />
          </div>` : ''}
          ${data.charts.statusChart ? `
          <div class="chart-box">
            <div class="chart-title">Tỷ lệ Trạng thái Đơn hàng</div>
            <img class="chart-img" style="max-height: 220px;" src="${data.charts.statusChart}" alt="Status" />
          </div>` : ''}
          ${data.charts.paymentChart ? `
          <div class="chart-box">
            <div class="chart-title">Cơ cấu Phương thức Thanh toán</div>
            <img class="chart-img" style="max-height: 220px;" src="${data.charts.paymentChart}" alt="Payment" />
          </div>` : ''}
        </div>
        ` : ''}

        <div class="data-grid" style="page-break-before: auto;">
          <div>
            <div class="section-title" style="margin-top: 0;">Trạng thái đơn hàng</div>
            <table>
              <thead>
                <tr>
                  <th>Trạng thái</th>
                  <th style="text-align: right;">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.ordersByStatus || {}).map(([status, count]) => `
                <tr>
                  <td style="font-weight: 600;">${status}</td>
                  <td style="text-align: right;">${count}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div>
            <div class="section-title" style="margin-top: 0;">Phương thức thanh toán</div>
            <table>
              <thead>
                <tr>
                  <th>Phương thức</th>
                  <th style="text-align: right;">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.paymentMethods || {}).map(([method, count]) => `
                <tr>
                  <td style="font-weight: 600;">${method}</td>
                  <td style="text-align: right;">${count}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="section-title">Top 10 Sản phẩm bán chạy nhất</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">STT</th>
              <th>Tên sản phẩm</th>
              <th style="text-align: center;">Đã bán</th>
              <th style="text-align: right;">Doanh thu mang lại</th>
            </tr>
          </thead>
          <tbody>
            ${data.topProducts.slice(0, 10).map((p, i) => `
            <tr>
              <td style="text-align: center; color: #64748b;">${i + 1}</td>
              <td style="font-weight: 600;">${p.name}</td>
              <td style="text-align: center;">${p.sold}</td>
              <td style="text-align: right; color: #4f46e5; font-weight: 600;">${p.revenue.toLocaleString('vi-VN')} đ</td>
            </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="signature-box">
            <div class="signature-title">Người lập biểu</div>
            <div class="signature-sub">(Ký và ghi rõ họ tên)</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Giám đốc phê duyệt</div>
            <div class="signature-sub">(Ký, ghi rõ họ tên và đóng dấu)</div>
          </div>
        </div>

        <div class="footer">
          Báo cáo được xuất tự động từ Hệ thống Quản trị GearFlow vào lúc ${new Date().toLocaleString('vi-VN')}
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // Export to Word
  async exportToWord(data: ReportData) {
    const doc = new Document({
      sections: [
        {
          children: [
            // === BRANDING HEADER ===
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: 'nil' }, bottom: { style: 'double', size: 6, color: '3F51B5' }, left: { style: 'nil' }, right: { style: 'nil' },
                insideHorizontal: { style: 'nil' }, insideVertical: { style: 'nil' }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'GEARFLOW', bold: true, font: 'Arial', size: 36, color: '3F51B5' })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'Hệ thống quản lý kinh doanh chuyên nghiệp', font: 'Arial', size: 18, color: '757575' })],
                        })
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'BÁO CÁO KINH DOANH', bold: true, font: 'Arial', size: 28, color: '1A237E' })],
                          alignment: 'right'
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: new Date().toLocaleDateString('vi-VN'), font: 'Arial', size: 18, color: '757575' })],
                          alignment: 'right'
                        })
                      ],
                      width: { size: 40, type: WidthType.PERCENTAGE },
                    })
                  ]
                })
              ]
            }),
            new Paragraph({ text: '', spacing: { before: 400 } }),

            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: data.title.toUpperCase(),
                  bold: true,
                  size: 32,
                  font: 'Arial',
                  color: '1A237E'
                }),
              ],
              alignment: 'center',
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Kỳ báo cáo: ${data.period}`,
                  size: 24,
                  font: 'Arial',
                  color: '757575'
                }),
              ],
              alignment: 'center',
              spacing: { after: 400 },
            }),

            // Stats section
            new Paragraph({
              children: [
                new TextRun({
                  text: 'TỔNG QUAN',
                  bold: true,
                  size: 28,
                  font: 'Arial'
                }),
              ],
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tổng doanh thu: ${(data.stats.totalRevenue / 1000000).toFixed(2)}M VNĐ`,
                  size: 22,
                  font: 'Arial'
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tổng đơn hàng: ${data.stats.totalOrders}`,
                  size: 22,
                  font: 'Arial'
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tổng sản phẩm: ${data.stats.totalProducts}`,
                  size: 22,
                  font: 'Arial'
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tổng khách hàng: ${data.stats.totalCustomers}`,
                  size: 22,
                  font: 'Arial'
                }),
              ],
              spacing: { after: 400 },
            }),

            // Charts
            ...(data.charts?.revenueChart ? [
              new Paragraph({ 
                children: [new TextRun({ text: 'Biểu đồ doanh thu', bold: true, font: 'Arial', size: 24 })],
                spacing: { before: 200, after: 200 } 
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: Uint8Array.from(atob(data.charts.revenueChart.split(',')[1]), c => c.charCodeAt(0)),
                    transformation: { width: 600, height: 300 }
                  })
                ],
                alignment: 'center'
              })
            ] : []),

            ...(data.charts?.statusChart ? [
              new Paragraph({ 
                children: [new TextRun({ text: 'Biểu đồ trạng thái đơn hàng', bold: true, font: 'Arial', size: 24 })],
                spacing: { before: 200, after: 200 } 
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: Uint8Array.from(atob(data.charts.statusChart.split(',')[1]), c => c.charCodeAt(0)),
                    transformation: { width: 600, height: 300 }
                  })
                ],
                alignment: 'center'
              })
            ] : []),

            // Top Products section
            new Paragraph({
              children: [
                new TextRun({
                  text: 'SẢN PHẨM BÁN CHẠY',
                  bold: true,
                  size: 28,
                  font: 'Arial'
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            // Top Products table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Sản phẩm', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Đã bán', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Doanh thu', bold: true })],
                    }),
                  ],
                }),
                ...data.topProducts.slice(0, 10).map(
                  (product) =>
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph(product.name)],
                        }),
                        new TableCell({
                          children: [new Paragraph(product.sold.toString())],
                        }),
                        new TableCell({
                          children: [new Paragraph(`${(product.revenue / 1000000).toFixed(2)}M`)],
                        }),
                      ],
                    })
                ),
              ],
            }),

            // Signature Section
            new Paragraph({ text: '', spacing: { before: 800 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: 'nil' }, bottom: { style: 'nil' }, left: { style: 'nil' }, right: { style: 'nil' },
                insideHorizontal: { style: 'nil' }, insideVertical: { style: 'nil' }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Người lập biểu', bold: true, font: 'Arial', size: 20 })],
                          alignment: 'center'
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, font: 'Arial', size: 16 })],
                          alignment: 'center'
                        }),
                      ]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Người duyệt', bold: true, font: 'Arial', size: 20 })],
                          alignment: 'center'
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, font: 'Arial', size: 16 })],
                          alignment: 'center'
                        }),
                      ]
                    }),
                  ]
                })
              ]
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCao_${data.period.replace(/\s/g, '_')}_${new Date().getTime()}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
