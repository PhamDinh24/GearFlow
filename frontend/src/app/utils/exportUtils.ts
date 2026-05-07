import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { 
  Document, Packer, Paragraph, Table, TableCell, TableRow, 
  WidthType, AlignmentType, TextRun, ImageRun, 
  BorderStyle, VerticalAlign 
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file with professional table format
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Get range
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Auto-size columns with better calculation
    const colWidths: any[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (cell && cell.v) {
          const cellLength = String(cell.v).length;
          maxWidth = Math.max(maxWidth, cellLength);
        }
      }
      colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    ws['!cols'] = colWidths;
    
    // Add borders and styling to all cells
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: '' };
        }
        
        // Add cell styling
        ws[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: {
            vertical: 'center',
            horizontal: R === range.s.r ? 'center' : 'left',
          },
          font: {
            name: 'Arial',
            sz: 10,
            bold: R === range.s.r,
            color: { rgb: R === range.s.r ? 'FFFFFF' : '000000' },
          },
          fill: {
            fgColor: { rgb: R === range.s.r ? '000000' : (R % 2 === 0 ? 'F9FAFB' : 'FFFFFF') },
          },
        };
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return { success: true };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error };
  }
};

/**
 * Helper to remove Vietnamese accents for PDF export (jsPDF default fonts don't support them)
 * Only use this if custom font is not loaded
 */
const removeAccents = (str: string) => {
  if (!str) return "";
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^\x00-\x7F]/g, ''); // Remove any other non-ascii chars as fallback
};

/**
 * Generate a Bar Chart Image using Canvas API
 */
export const generateBarChartImage = (
  title: string,
  labels: string[],
  values: number[],
  colors: string[] = ['#3B82F6']
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = 80;
  const chartWidth = canvas.width - 2 * margin;
  const chartHeight = canvas.height - 2 * margin - 40;
  const maxValue = Math.max(...values, 1);

  // Title
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 50);

  // Axis
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, margin + 20);
  ctx.lineTo(margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin, canvas.height - margin);
  ctx.stroke();

  // Grid lines
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  for (let i = 1; i <= 5; i++) {
    const y = canvas.height - margin - (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    ctx.stroke();
    
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px Arial';
    ctx.setLineDash([]);
    ctx.fillText(Math.round((maxValue / 5) * i).toString(), margin - 30, y + 5);
    ctx.setLineDash([5, 5]);
  }
  ctx.setLineDash([]);

  // Bars
  const barWidth = (chartWidth / labels.length) * 0.7;
  const spacing = (chartWidth / labels.length) * 0.3;

  labels.forEach((label, i) => {
    const value = values[i];
    const color = colors[i % colors.length];
    const h = (value / maxValue) * chartHeight;
    const x = margin + spacing / 2 + i * (barWidth + spacing);
    const y = canvas.height - margin - h;

    // Bar shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Gradient bar
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, color);
    grad.addColorStop(1, adjustColor(color, -20));
    ctx.fillStyle = grad;
    
    // Rounded bar top
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, h, [8, 8, 0, 0]);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 18px Arial';
    ctx.save();
    ctx.translate(x + barWidth / 2, canvas.height - margin + 25);
    ctx.rotate(labels.length > 5 ? -Math.PI / 4 : 0);
    ctx.fillText(label.length > 15 ? label.substring(0, 12) + '...' : label, 0, 0);
    ctx.restore();

    // Value on top
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(value.toString(), x + barWidth / 2, y - 10);
  });

  return canvas.toDataURL('image/png');
};

/**
 * Generate a Pie Chart Image using Canvas API
 */
export const generatePieChartImage = (
  title: string,
  labels: string[],
  values: number[],
  colors: string[]
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = 300;
  const centerY = 320;
  const radius = 180;
  const total = values.reduce((a, b) => a + b, 0);

  // Title
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 60);

  let startAngle = -Math.PI / 2;
  values.forEach((value, i) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const color = colors[i % colors.length];

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Legend
    const legendX = 550;
    const legendY = 150 + i * 40;
    ctx.fillRect(legendX, legendY, 25, 25);
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    const percent = Math.round((value / total) * 100);
    ctx.fillText(`${labels[i]} (${percent}%)`, legendX + 35, legendY + 20);

    startAngle += sliceAngle;
  });

  return canvas.toDataURL('image/png');
};

/**
 * Helper to adjust color brightness
 */
const adjustColor = (col: string, amt: number) => {
  let usePound = false;
  if (col[0] === "#") {
    col = col.slice(1);
    usePound = true;
  }
  const num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255; else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255; else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255; else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

export interface ExportExtraSection {
  title: string;
  type: 'table' | 'image';
  headers?: string[];
  data?: any[][];
  imageData?: string; // base64
}

/**
 * Export data to PDF file
 */
export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  filename: string,
  metadata?: Record<string, string>,
  extraSections?: ExportExtraSection[]
) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Use helvetica for PDF (does not support Vietnamese well without custom font)
    const safeTitle = removeAccents(title);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let y = 20;
    
    // === TITLE BAR ===
    doc.setFillColor(41, 98, 255);
    doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(safeTitle.toUpperCase(), pageWidth / 2, y + 8, { align: 'center' });
    y += 15;
    
    // === METADATA ===
    if (metadata) {
      doc.setFontSize(10);
      const metadataHeight = Object.keys(metadata).length * 7 + 6;
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y, pageWidth - 2 * margin, metadataHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, pageWidth - 2 * margin, metadataHeight);
      
      let metaY = y + 5;
      Object.entries(metadata).forEach(([key, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${removeAccents(key)}:`, margin + 3, metaY);
        doc.setFont('helvetica', 'normal');
        doc.text(removeAccents(String(value)), margin + 50, metaY);
        metaY += 7;
      });
      y += metadataHeight + 10;
    }
    
    // === MAIN TABLE ===
    const drawTable = (tHeaders: string[], tData: any[][], tTitle?: string) => {
      if (tTitle) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 98, 255);
        doc.text(removeAccents(tTitle), margin, y);
        y += 6;
      }
      
      const safeHeaders = tHeaders.map(h => removeAccents(h));
      const tableWidth = pageWidth - 2 * margin;
      const colWidths = safeHeaders.map((_, i) => i === 0 ? 15 : (tableWidth - 15) / (safeHeaders.length - 1));
      
      doc.setFillColor(100, 149, 237);
      doc.rect(margin, y, tableWidth, 10, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, tableWidth, 10);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      let x = margin;
      safeHeaders.forEach((header, i) => {
        const colWidth = colWidths[i];
        if (i > 0) doc.line(x, y, x, y + 10);
        doc.text(header, x + colWidth / 2, y + 6.5, { align: 'center' });
        x += colWidth;
      });
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      tData.forEach((row, rowIndex) => {
        if (y + 10 > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        const rowHeight = 10;
        if (rowIndex % 2 === 0) {
          doc.setFillColor(250, 250, 252);
          doc.rect(margin, y, tableWidth, rowHeight, 'F');
        }
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y, tableWidth, rowHeight);
        
        let dx = margin;
        row.forEach((cell, colIndex) => {
          const cellText = removeAccents(String(cell || ''));
          const colWidth = colWidths[colIndex];
          if (colIndex > 0) doc.line(dx, y, dx, y + rowHeight);
          if (colIndex === 0) {
            doc.text(cellText, dx + colWidth / 2, y + 6.5, { align: 'center' });
          } else {
            const lines = doc.splitTextToSize(cellText, colWidth - 4);
            doc.text(lines[0] || '', dx + 2, y + 6.5);
          }
          dx += colWidth;
        });
        y += rowHeight;
      });
      y += 10;
    };
    
    drawTable(headers, data, "1. Thong Ke Tong Quan");
    
    // === EXTRA SECTIONS ===
    if (extraSections) {
      extraSections.forEach((section, index) => {
        if (y + 80 > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        if (section.type === 'table' && section.headers && section.data) {
          drawTable(section.headers, section.data, `${index + 2}. ${section.title}`);
        } else if (section.type === 'image' && section.imageData) {
          const margin = 14;
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = 90;
          
          if (y + imgHeight > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          
          doc.setTextColor(63, 81, 181); // Indigo color
          doc.setFont("helvetica", "bold");
          doc.text(removeAccents(section.title), margin, y);
          y += 5;
          
          doc.addImage(section.imageData, 'PNG', margin, y, imgWidth, imgHeight);
          y += imgHeight + 15;
        }
      });
    }
    
    // === FOOTER ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('GearFlow Management System', margin, pageHeight - 10);
      doc.text(`Trang ${i}/${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(new Date().toLocaleDateString('vi-VN'), pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    doc.save(`${filename}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error };
  }
};

/**
 * Export data to Word document
 */
export const exportToWord = async (
  title: string,
  headers: string[],
  data: any[][],
  filename: string,
  metadata?: Record<string, string>,
  extraSections?: ExportExtraSection[]
) => {
  try {
    const children: any[] = [];
    
    // === BRANDING HEADER ===
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.DOUBLE, size: 6, color: '3F51B5' }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL },
          insideHorizontal: { style: BorderStyle.NIL }, insideVertical: { style: BorderStyle.NIL }
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
                    children: [new TextRun({ text: 'BÁO CÁO THỐNG KÊ', bold: true, font: 'Arial', size: 28, color: '1A237E' })],
                    alignment: AlignmentType.RIGHT
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: new Date().toLocaleDateString('vi-VN'), font: 'Arial', size: 18, color: '757575' })],
                    alignment: AlignmentType.RIGHT
                  })
                ],
                width: { size: 40, type: WidthType.PERCENTAGE },
              })
            ]
          })
        ]
      }),
      new Paragraph({ text: '', spacing: { before: 400 } })
    );

    // === TITLE ===
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            font: 'Arial',
            size: 32,
            color: '1A237E',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 400 },
      })
    );
    
    // === METADATA SECTION ===
    if (metadata) {
      const metadataRows = Object.entries(metadata).map(([key, value]) => 
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: `${key}:`, bold: true, font: 'Arial', size: 20 })],
              })],
              shading: { fill: 'F5F7FA' },
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: String(value), font: 'Arial', size: 20 })],
              })],
              shading: { fill: 'F5F7FA' },
              width: { size: 75, type: WidthType.PERCENTAGE },
            }),
          ],
        })
      );
      
      children.push(
        new Table({
          rows: metadataRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: 'C8C8C8' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C8C8C8' },
            left: { style: BorderStyle.SINGLE, size: 6, color: 'C8C8C8' },
            right: { style: BorderStyle.SINGLE, size: 6, color: 'C8C8C8' },
          },
        })
      );
      children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }
    
    const drawTable = (tTitle: string, tHeaders: string[], tData: any[][]) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: tTitle.toUpperCase(), bold: true, font: 'Arial', size: 24, color: '1A237E' })],
          spacing: { before: 400, after: 200 },
        })
      );
      
      const headerRow = new TableRow({
        children: tHeaders.map((header, index) => 
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: header, bold: true, font: 'Arial', size: 20, color: 'FFFFFF' })],
              alignment: AlignmentType.CENTER,
            })],
            shading: { fill: '3F51B5' },
            width: { size: index === 0 ? 10 : (90 / (tHeaders.length - 1)), type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          })
        ),
        tableHeader: true,
      });
      
      const dataRows = tData.map((row, rowIndex) => 
        new TableRow({
          children: row.map((cell, cellIndex) => 
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: String(cell || ''), font: 'Arial', size: 18 })],
                alignment: cellIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
              })],
              shading: { fill: rowIndex % 2 === 0 ? 'F5F5F5' : 'FFFFFF' },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
            })
          ),
        })
      );
      
      children.push(
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '3F51B5' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '3F51B5' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '3F51B5' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '3F51B5' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E0E0E0' },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E0E0E0' },
          },
        })
      );
    };
    
    drawTable("1. Thống kê tổng quan", headers, data);
    
    if (extraSections) {
      extraSections.forEach((section, index) => {
        if (section.type === 'table' && section.headers && section.data) {
          drawTable(`${index + 2}. ${section.title}`, section.headers, section.data);
        } else if (section.type === 'image' && section.imageData) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `${index + 2}. ${section.title}`, bold: true, font: 'Arial', size: 24, color: '1A237E' })],
              spacing: { before: 400, after: 200 },
            })
          );
          
          const base64Data = section.imageData.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: bytes,
                  transformation: {
                    width: 600,
                    height: 350,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            })
          );
        }
      });
    }

    // === SIGNATURE SECTION ===
    children.push(
      new Paragraph({ text: '', spacing: { before: 800 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL },
          insideHorizontal: { style: BorderStyle.NIL }, insideVertical: { style: BorderStyle.NIL }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Người lập biểu', bold: true, font: 'Arial', size: 20 })],
                    alignment: AlignmentType.CENTER
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, font: 'Arial', size: 16 })],
                    alignment: AlignmentType.CENTER
                  }),
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Người duyệt', bold: true, font: 'Arial', size: 20 })],
                    alignment: AlignmentType.CENTER
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true, font: 'Arial', size: 16 })],
                    alignment: AlignmentType.CENTER
                  }),
                ]
              }),
            ]
          })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        children,
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting to Word:', error);
    return { success: false, error };
  }
};

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string) => {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error };
  }
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(date);
  }
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')}đ`;
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (prefix: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return sanitizeFilename(`${prefix}_${timestamp}`);
};

/**
 * Export data with Master Production Schedule format
 * Format giống ảnh: Title merged, metadata 2 cột riêng biệt, header đen chữ trắng
 */
export const exportToExcelTable = (
  title: string,
  metadata: Record<string, string>,
  headers: string[],
  data: any[][],
  filename: string
) => {
  try {
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [];
    
    // Title row (merged) - Row 1
    wsData.push([title]);
    
    // Empty row - Row 2
    wsData.push([]);
    
    // Metadata rows - mỗi metadata 1 dòng riêng với format "Label: Value"
    const metadataEntries = Object.entries(metadata);
    metadataEntries.forEach(([key, value]) => {
      wsData.push([`${key}:`, value]);
    });
    
    // Empty row before headers
    wsData.push([]);
    
    // Headers row - ĐEN với chữ TRẮNG
    wsData.push(headers);
    
    // Data rows
    data.forEach(row => wsData.push(row));
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Calculate column widths
    const colWidths: any[] = [];
    const maxCols = Math.max(...wsData.map(row => row.length));
    for (let c = 0; c < maxCols; c++) {
      let maxWidth = 12;
      wsData.forEach(row => {
        if (row[c] !== undefined && row[c] !== null) {
          const cellLength = String(row[c]).length;
          maxWidth = Math.max(maxWidth, cellLength);
        }
      });
      colWidths.push({ wch: Math.min(maxWidth + 3, 50) });
    }
    ws['!cols'] = colWidths;
    
    // Merge title cell (row 0, all columns)
    const titleRow = 0;
    const emptyRow1 = 1;
    const metadataStartRow = 2;
    const metadataEndRow = metadataStartRow + metadataEntries.length - 1;
    const emptyRow2 = metadataEndRow + 1;
    const headerRowIndex = emptyRow2 + 1;
    
    ws['!merges'] = [
      { s: { r: titleRow, c: 0 }, e: { r: titleRow, c: maxCols - 1 } }
    ];
    
    // Style all cells
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: '' };
        }
        
        let bgColor = 'FFFFFF';
        let fontColor = '000000';
        let bold = false;
        let fontSize = 11;
        let hAlign: 'left' | 'center' | 'right' = 'left';
        
        // Title row - BOLD, CENTERED, LARGE
        if (R === titleRow) {
          bgColor = 'FFFFFF';
          fontColor = '000000';
          bold = true;
          fontSize = 16;
          hAlign = 'center';
        }
        // Metadata rows - Label column (C=0) BOLD, Value column (C=1) normal
        else if (R >= metadataStartRow && R <= metadataEndRow) {
          bgColor = 'F3F4F6'; // Light gray background
          if (C === 0) {
            bold = true; // Label column bold
            fontColor = '374151'; // Darker gray for labels
          } else {
            bold = false;
            fontColor = '000000';
          }
        }
        // Header row - BLACK background, WHITE text, BOLD, CENTERED
        else if (R === headerRowIndex) {
          bgColor = '000000'; // BLACK
          fontColor = 'FFFFFF'; // WHITE
          bold = true;
          fontSize = 11;
          hAlign = 'center';
        }
        // Data rows - Alternating colors
        else if (R > headerRowIndex) {
          // Alternating: even rows gray, odd rows white
          bgColor = (R - headerRowIndex) % 2 === 1 ? 'F9FAFB' : 'FFFFFF';
          fontColor = '000000';
          bold = false;
          // Center align STT column (first column)
          if (C === 0) {
            hAlign = 'center';
          }
        }
        
        ws[cellAddress].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: {
            vertical: 'center',
            horizontal: hAlign,
            wrapText: false
          },
          font: {
            name: 'Calibri',
            sz: fontSize,
            bold: bold,
            color: { rgb: fontColor },
          },
          fill: {
            fgColor: { rgb: bgColor },
          },
        };
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return { success: true };
  } catch (error) {
    console.error('Error exporting to Excel table:', error);
    return { success: false, error };
  }
};
