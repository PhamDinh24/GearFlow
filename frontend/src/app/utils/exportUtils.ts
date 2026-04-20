import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, TextRun } from 'docx';

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
 * Export data to PDF file - Format giống "BÁO CÁO CÔNG VIỆC TUẦN"
 * Sử dụng autoTable plugin để hỗ trợ tiếng Việt tốt hơn
 */
export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  filename: string,
  metadata?: Record<string, string>
) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let y = 20;
    
    // === LOGO AREA (nếu có) ===
    // Có thể thêm logo ở đây nếu cần
    
    // === TITLE BAR (Blue background like in image) ===
    doc.setFillColor(41, 98, 255); // Blue color
    doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F');
    
    // Title text (white on blue)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), pageWidth / 2, y + 8, { align: 'center' });
    
    y += 15;
    
    // === METADATA SECTION ===
    if (metadata) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Draw metadata box with light background
      const metadataHeight = Object.keys(metadata).length * 7 + 6;
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y, pageWidth - 2 * margin, metadataHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, pageWidth - 2 * margin, metadataHeight);
      
      y += 5;
      Object.entries(metadata).forEach(([key, value]) => {
        doc.setFont('helvetica', 'bold');
        // Convert Vietnamese text to ASCII-safe format for PDF
        const keyText = key;
        const valueText = value;
        doc.text(`${keyText}:`, margin + 3, y);
        doc.setFont('helvetica', 'normal');
        doc.text(valueText, margin + 50, y);
        y += 7;
      });
      y += 3;
    }
    
    // === TABLE ===
    y += 2;
    const tableWidth = pageWidth - 2 * margin;
    
    // Calculate column widths
    const colWidths = headers.map((_, i) => {
      if (i === 0) return 15; // STT column
      return (tableWidth - 15) / (headers.length - 1);
    });
    
    // Draw table header (Blue background like in image)
    doc.setFillColor(100, 149, 237); // Cornflower blue
    doc.rect(margin, y, tableWidth, 10, 'F');
    
    // Header borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, tableWidth, 10);
    
    // Header text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    let x = margin;
    headers.forEach((header, i) => {
      const colWidth = colWidths[i];
      // Draw vertical lines
      if (i > 0) {
        doc.line(x, y, x, y + 10);
      }
      // Header text
      doc.text(header, x + colWidth / 2, y + 6.5, { align: 'center' });
      x += colWidth;
    });
    
    // Right border
    doc.line(x, y, x, y + 10);
    
    y += 10;
    
    // Draw data rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    data.forEach((row, rowIndex) => {
      // Check if need new page
      if (y + 10 > pageHeight - 30) {
        doc.addPage();
        y = 20;
        
        // Redraw header on new page
        doc.setFillColor(100, 149, 237);
        doc.rect(margin, y, tableWidth, 10, 'F');
        doc.rect(margin, y, tableWidth, 10);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        
        x = margin;
        headers.forEach((header, i) => {
          const colWidth = colWidths[i];
          if (i > 0) {
            doc.line(x, y, x, y + 10);
          }
          doc.text(header, x + colWidth / 2, y + 6.5, { align: 'center' });
          x += colWidth;
        });
        doc.line(x, y, x, y + 10);
        
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
      }
      
      // Row height (taller for better readability)
      const rowHeight = 10;
      
      // Alternating row colors (very light)
      if (rowIndex % 2 === 0) {
        doc.setFillColor(250, 250, 252);
        doc.rect(margin, y, tableWidth, rowHeight, 'F');
      }
      
      // Draw cell borders
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, tableWidth, rowHeight);
      
      // Draw cell data
      x = margin;
      row.forEach((cell, colIndex) => {
        const cellText = String(cell || '');
        const colWidth = colWidths[colIndex];
        
        // Vertical lines
        if (colIndex > 0) {
          doc.line(x, y, x, y + rowHeight);
        }
        
        // Cell text
        if (colIndex === 0) {
          // Center align STT
          doc.text(cellText, x + colWidth / 2, y + 6.5, { align: 'center' });
        } else {
          // Left align others with padding
          const lines = doc.splitTextToSize(cellText, colWidth - 4);
          doc.text(lines[0] || '', x + 2, y + 6.5);
        }
        x += colWidth;
      });
      
      // Right border
      doc.line(x, y, x, y + rowHeight);
      
      y += rowHeight;
    });
    
    // === FOOTER ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('GearFlow Management System', margin, pageHeight - 10);
      doc.text(`Trang ${i}/${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      const today = new Date();
      const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      doc.text(dateStr, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    doc.save(`${filename}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error };
  }
};

/**
 * Export data to Word document - Format giống "BÁO CÁO CÔNG VIỆC TUẦN"
 */
export const exportToWord = async (
  title: string,
  headers: string[],
  data: any[][],
  filename: string,
  metadata?: Record<string, string>
) => {
  try {
    const children: any[] = [];
    
    // === LOGO AREA (optional) ===
    // Có thể thêm logo ở đây nếu cần
    
    // === TITLE BAR (Blue background) ===
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            font: 'Arial',
            size: 28, // 14pt = 28 half-points
            color: 'FFFFFF',
          }),
        ],
        alignment: AlignmentType.CENTER,
        shading: {
          fill: '2962FF', // Blue color
        },
        spacing: { before: 0, after: 300 },
        border: {
          top: { style: 1, size: 6, color: '2962FF' },
          bottom: { style: 1, size: 6, color: '2962FF' },
          left: { style: 1, size: 6, color: '2962FF' },
          right: { style: 1, size: 6, color: '2962FF' },
        },
      })
    );
    
    // === METADATA SECTION ===
    if (metadata) {
      // Create metadata table with light background
      const metadataRows = Object.entries(metadata).map(([key, value]) => 
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [
                  new TextRun({
                    text: `${key}:`,
                    bold: true,
                    font: 'Arial',
                    size: 20, // 10pt
                    color: '000000',
                  }),
                ],
              })],
              shading: {
                fill: 'F5F7FA', // Light gray/blue
              },
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
              verticalAlign: 'center',
              margins: {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100,
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [
                  new TextRun({
                    text: value,
                    font: 'Arial',
                    size: 20, // 10pt
                    color: '000000',
                  }),
                ],
              })],
              shading: {
                fill: 'F5F7FA',
              },
              width: {
                size: 75,
                type: WidthType.PERCENTAGE,
              },
              verticalAlign: 'center',
              margins: {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100,
              },
            }),
          ],
        })
      );
      
      children.push(
        new Table({
          rows: metadataRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: 1, size: 6, color: 'C8C8C8' },
            bottom: { style: 1, size: 6, color: 'C8C8C8' },
            left: { style: 1, size: 6, color: 'C8C8C8' },
            right: { style: 1, size: 6, color: 'C8C8C8' },
            insideHorizontal: { style: 1, size: 6, color: 'C8C8C8' },
            insideVertical: { style: 1, size: 6, color: 'C8C8C8' },
          },
        })
      );
      
      // Space after metadata
      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 200 },
        })
      );
    }
    
    // === DATA TABLE ===
    // Create table header row with BLUE background (like in image)
    const headerRow = new TableRow({
      children: headers.map((header, index) => 
        new TableCell({
          children: [new Paragraph({
            children: [
              new TextRun({
                text: header,
                bold: true,
                font: 'Arial',
                size: 20, // 10pt
                color: 'FFFFFF',
              }),
            ],
            alignment: AlignmentType.CENTER,
          })],
          shading: {
            fill: '6495ED', // Cornflower blue (like in image)
          },
          width: {
            size: index === 0 ? 10 : (90 / (headers.length - 1)), // STT column smaller
            type: WidthType.PERCENTAGE,
          },
          verticalAlign: 'center',
          margins: {
            top: 100,
            bottom: 100,
            left: 50,
            right: 50,
          },
        })
      ),
      tableHeader: true, // This makes the row repeat on each page
    });
    
    // Create data rows with alternating colors (very light)
    const dataRows = data.map((row, rowIndex) => 
      new TableRow({
        children: row.map((cell, cellIndex) => 
          new TableCell({
            children: [new Paragraph({
              children: [
                new TextRun({
                  text: String(cell || ''),
                  font: 'Arial',
                  size: 18, // 9pt
                  color: '000000',
                }),
              ],
              alignment: cellIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
            })],
            shading: {
              fill: rowIndex % 2 === 0 ? 'FAFAFC' : 'FFFFFF', // Very light alternating
            },
            width: {
              size: cellIndex === 0 ? 10 : (90 / (headers.length - 1)),
              type: WidthType.PERCENTAGE,
            },
            verticalAlign: 'center',
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          })
        ),
      })
    );
    
    // Add data table
    children.push(
      new Table({
        rows: [headerRow, ...dataRows],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: 1, size: 6, color: '000000' },
          bottom: { style: 1, size: 6, color: '000000' },
          left: { style: 1, size: 6, color: '000000' },
          right: { style: 1, size: 6, color: '000000' },
          insideHorizontal: { style: 1, size: 6, color: 'C8C8C8' },
          insideVertical: { style: 1, size: 6, color: 'C8C8C8' },
        },
      })
    );
    
    // === FOOTER ===
    children.push(
      new Paragraph({
        text: '',
        spacing: { before: 400 },
      })
    );
    
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'GearFlow Management System',
            font: 'Arial',
            size: 18,
            color: '6B7280',
          }),
          new TextRun({
            text: ' | ',
            font: 'Arial',
            size: 18,
            color: '6B7280',
          }),
          new TextRun({
            text: dateStr,
            font: 'Arial',
            size: 18,
            color: '6B7280',
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );

    const doc = new Document({
      sections: [{
        children,
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
      }],
    });

    // Use Blob instead of Buffer for browser compatibility
    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.docx`;
    link.click();
    URL.revokeObjectURL(link.href);
    
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
