import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures a specified DOM container and generates a print-ready, high-resolution A4 PDF document.
 */
export async function exportReportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`PDF Export target element with ID "${elementId}" was not found.`);
    return;
  }

  // Back up original display styles
  const prevDisplay = element.style.display;
  const prevPosition = element.style.position;
  const prevVisibility = element.style.visibility;

  // Temporarily force display so html2canvas can capture it
  element.style.display = 'block';
  element.style.position = 'relative';
  element.style.visibility = 'visible';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution scale factor
      useCORS: true,
      backgroundColor: '#ffffff', // Uniform white paper background
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const pageWidth = 210; // A4 standard width in mm
    const pageHeight = 297; // A4 standard height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page splitting logic
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation error occurred:', error);
  } finally {
    // Restore layout styles
    element.style.display = prevDisplay;
    element.style.position = prevPosition;
    element.style.visibility = prevVisibility;
  }
}
