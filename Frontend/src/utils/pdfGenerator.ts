import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Shop {
  name: string;
  address: string;
  phone: string;
  qr_code: string;
}

export const generateShopQRCodePDF = async (shop: Shop): Promise<void> => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 0;

  // === Header Section ===
  const headerHeight = 40;
  const gradientStart = { r: 37, g: 99, b: 235 };  // Blue-600
  const gradientEnd = { r: 67, g: 56, b: 202 };     // Indigo-700

  // Draw gradient background
  const drawGradient = (x: number, y: number, w: number, h: number) => {
    const steps = Math.ceil(w);
    for (let i = 0; i < steps; i++) {
      const factor = i / steps;
      const r = gradientStart.r + factor * (gradientEnd.r - gradientStart.r);
      const g = gradientStart.g + factor * (gradientEnd.g - gradientStart.g);
      const b = gradientStart.b + factor * (gradientEnd.b - gradientStart.b);
      doc.setFillColor(r, g, b);
      doc.rect(x + i, y, 1, h, 'F');
    }
  };
  drawGradient(0, 0, width, headerHeight);

  // Printer Icon (Vector Path)
  const drawPrinterIcon = (x: number, y: number, size: number) => {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    
    // Printer body
    doc.roundedRect(x, y, size * 1.6, size, 1, 'S');
    
    // Paper tray
    doc.line(
      x + size * 0.3,
      y + size * 0.8,
      x + size * 1.3,
      y + size * 0.8
    );
    
    // Print output
    doc.setFillColor(255, 255, 255);
    doc.rect(x + size * 0.2, y - size * 0.15, size * 1.2, size * 0.2, 'F');
  };

  // Draw logo and branding
  drawPrinterIcon(margin, 12, 6);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PrintFlow', margin + 20, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DIGITAL PRINT MANAGEMENT SOLUTION', margin + 20, 27);

  // === Shop Information ===
  yPos = 50;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(shop.name.toUpperCase(), margin, yPos);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(shop.address, margin, yPos + 8);
  doc.text(`Contact: ${shop.phone}`, margin, yPos + 16);

  // === QR Code Section ===
  yPos += 30;
  try {
    const qrResponse = await fetch(shop.qr_code);
    const qrBlob = await qrResponse.blob();
    const qrBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(qrBlob);
    });

    const qrSize = 80;
    const qrX = (width - qrSize) / 2;
    
    // QR Code container
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(qrX - 5, yPos - 5, qrSize + 10, qrSize + 10, 3, 'S');
    
    // QR Code image
    doc.addImage(qrBase64, 'PNG', qrX, yPos, qrSize, qrSize);
    
    // Token label
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text('TOKEN: 8TWp', width / 2, yPos + qrSize + 10, { align: 'center' });
  } catch (error) {
    console.error('QR Code Error:', error);
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text('QR Code Unavailable', width / 2, yPos + 40, { align: 'center' });
  }

  // === Instructions Section ===
  yPos += 110;
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('How It Works:', margin, yPos);

  const instructions = [
    '1. Scan the QR code with your smartphone',
    '2. Upload your document',
    '3. Select print preferences (B/W or Color)',
    '4. Confirm and receive print token',
    '5. Present token at shop for collection'
  ];

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  instructions.forEach((text, index) => {
    doc.text(text, margin, yPos + 10 + (index * 7));
  });

  // === Footer Section ===
  doc.setFillColor(241, 245, 249);
  doc.rect(0, height - 25, width, 25, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Powered by PrintFlow', margin, height - 15);
  doc.text('www.printflow.com', width - margin, height - 15, { align: 'right' });

  // Save PDF
  doc.save(`${shop.name.replace(/ /g, '_')}_Print_QR.pdf`);
};