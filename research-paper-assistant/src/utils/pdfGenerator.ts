import { jsPDF } from 'jspdf';
import type { Paper, Section } from '@/types/common';

export const generatePDF = (
  paper: Paper,
  sections: Section[],
  forDownload = false
): string | void => {
  if (!paper || !sections.length) return;

  const doc = new jsPDF();
  let yOffset = 20;
  const pageWidth = 210;  // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 25;
  const contentWidth = pageWidth - (2 * margin);
  const maxY = pageHeight - margin;

  const addTextWithPagination = (text: string, fontSize: number, isTitle = false) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.35;
    const contentHeight = lines.length * lineHeight;

    if (yOffset + contentHeight > maxY) {
      doc.addPage();
      yOffset = margin;
    }

    if (isTitle) {
      const textWidth = doc.getTextWidth(lines[0]);
      const xOffset = (pageWidth - textWidth) / 2;
      doc.text(lines[0], xOffset, yOffset);
    } else {
      doc.text(lines, margin, yOffset);
    }

    yOffset += contentHeight + (isTitle ? 15 : 10);
  };

  // Document title
  doc.setFont("Helvetica", 'bold');
  doc.setFontSize(24);
  const titleWidth = doc.getTextWidth(paper.title);
  doc.text(paper.title, (210 - titleWidth) / 2, yOffset);
  yOffset += 20;

  // Abstract section
  doc.setFont("Helvetica", 'bold');
  doc.setFontSize(16);
  doc.text('Abstract', margin, yOffset);
  yOffset += 10;
  
  doc.setFont("Helvetica", 'normal');
  doc.setFontSize(11);
  addTextWithPagination(paper.abstract, 11);
  yOffset += 5;

  // Content sections
  sections
    .sort((a, b) => a.order - b.order)
    .forEach((section) => {
      // Section title with bold font
      doc.setFont("Helvetica", 'bold');
      doc.setFontSize(14);
      if (yOffset + 20 > maxY) {
        doc.addPage();
        yOffset = margin;
      }
      doc.text(section.title, margin, yOffset);
      yOffset += 10;

      // Section content with normal font
      if (section.content) {
        doc.setFont("Helvetica", 'normal');
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(section.content, contentWidth);
        const contentHeight = lines.length * (11 * 0.35);
        
        if (yOffset + contentHeight > maxY) {
          doc.addPage();
          yOffset = margin;
        }
        doc.text(lines, margin, yOffset);
        yOffset += contentHeight + 15; // Add more spacing between sections
      }
    });

  if (forDownload) {
    doc.save(`${paper.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    return;
  }
  
  return doc.output('datauristring');
};
