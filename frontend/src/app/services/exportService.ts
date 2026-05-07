import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType } from 'docx';

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
  charts?: {
    revenueChart?: string;
    statusChart?: string;
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

  // Export to PDF
  exportToPDF(data: ReportData) {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(removeAccents(data.title.toUpperCase()), 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(removeAccents(`Ky bao cao: ${data.period}`), 105, 30, { align: 'center' });
    
    // Stats
    doc.setFontSize(14);
    doc.text('TONG QUAN', 20, 45);
    
    doc.setFontSize(11);
    let y = 55;
    doc.text(removeAccents(`Tong doanh thu: ${(data.stats.totalRevenue / 1000000).toFixed(2)}M VND`), 20, y);
    y += 8;
    doc.text(removeAccents(`Tong don hang: ${data.stats.totalOrders}`), 20, y);
    y += 8;
    doc.text(removeAccents(`Tong san pham: ${data.stats.totalProducts}`), 20, y);
    y += 8;
    doc.text(removeAccents(`Tong khach hang: ${data.stats.totalCustomers}`), 20, y);
    
    // Charts
    if (data.charts?.revenueChart) {
      y += 10;
      doc.addImage(data.charts.revenueChart, 'PNG', 20, y, 170, 80);
      y += 90;
    }

    if (data.charts?.statusChart) {
      if (y > 200) { doc.addPage(); y = 20; }
      doc.addImage(data.charts.statusChart, 'PNG', 20, y, 170, 80);
      y += 90;
    }

    // Top Products
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.text('SAN PHAM BAN CHAY', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    data.topProducts.slice(0, 5).forEach((product, index) => {
      doc.text(
        removeAccents(`${index + 1}. ${product.name}: ${product.sold} san pham - ${(product.revenue / 1000000).toFixed(2)}M VND`),
        20,
        y
      );
      y += 7;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text(removeAccents(`Xuat bao cao: ${new Date().toLocaleString('vi-VN')}`), 105, 280, { align: 'center' });
    
    // Generate filename
    const filename = `BaoCao_${data.period.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(filename);
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
