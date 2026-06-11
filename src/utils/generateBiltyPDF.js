import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates the Bilty PDF and returns a Blob URL string.
 * The caller is responsible for revoking the URL when done (URL.revokeObjectURL).
 * @param {object} biltyData
 * @returns {string} blobUrl
 */
export const generateBiltyPDFBlob = (biltyData) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const idStr = String(biltyData._id || biltyData.id || '00000000');
  const dateVal = biltyData.completedAt || biltyData.createdAt || new Date();

  const marginX = 40;
  const marginY = 40;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Outer Border
  doc.setLineWidth(1.5);
  doc.setDrawColor(0, 0, 0);
  doc.rect(marginX, marginY, pageWidth - marginX * 2, pageHeight - marginY * 2);

  // Header Background (teal)
  doc.setFillColor(0, 150, 170);
  doc.rect(marginX, marginY, pageWidth - marginX * 2, 80, 'F');

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('E-CARGO-BILTY', pageWidth / 2, marginY + 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(220, 255, 255);
  doc.text('Official Digital Lorry Receipt (Bilty)', pageWidth / 2, marginY + 55, { align: 'center' });
  doc.text('100% Verified Digital Logistics Platform', pageWidth / 2, marginY + 70, { align: 'center' });

  // Border below header
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX, marginY + 80, pageWidth - marginX, marginY + 80);

  // Bilty Details Section
  let currentY = marginY + 110;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('Bilty ID / No:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`BLT-${idStr.slice(0, 8).toUpperCase()}`, marginX + 115, currentY);

  currentY += 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Date Issued:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(dateVal).toLocaleDateString()}`, marginX + 115, currentY);

  currentY += 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Origin:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  const originText = biltyData.origin ? String(biltyData.origin) : 'N/A';
  doc.text(originText.length > 25 ? originText.substring(0, 25) + '...' : originText, marginX + 115, currentY);

  // Right Column
  const rightColX = pageWidth / 2 + 20;
  let currentYRight = marginY + 110;
  doc.setFont('helvetica', 'bold');
  doc.text('Transporter:', rightColX, currentYRight);
  doc.setFont('helvetica', 'normal');
  const transName = biltyData.transporterName || 'N/A';
  doc.text(transName.length > 20 ? transName.substring(0, 20) + '...' : transName, rightColX + 88, currentYRight);

  currentYRight += 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Truck Plate:', rightColX, currentYRight);
  doc.setFont('helvetica', 'normal');
  doc.text(`${biltyData.truckPlate || 'N/A'}`, rightColX + 88, currentYRight);

  currentYRight += 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Destination:', rightColX, currentYRight);
  doc.setFont('helvetica', 'normal');
  const destText = biltyData.destination ? String(biltyData.destination) : 'N/A';
  doc.text(destText.length > 20 ? destText.substring(0, 20) + '...' : destText, rightColX + 88, currentYRight);

  // Divider
  currentY = Math.max(currentY, currentYRight) + 30;
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  // AutoTable for Cargo Particulars
  autoTable(doc, {
    startY: currentY + 20,
    margin: { left: marginX + 10, right: marginX + 10 },
    theme: 'grid',
    headStyles: { fillColor: [0, 130, 150], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 8 },
    head: [['Description of Goods', 'Weight', 'Freight Amount']],
    body: [
      [
        biltyData.cargoTitle || 'General Goods',
        biltyData.weight ? `${biltyData.weight} tons` : 'N/A',
        `Rs. ${biltyData.price || '0'}`
      ]
    ],
  });

  // Totals Area
  currentY = doc.lastAutoTable.finalY + 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Freight:', pageWidth - marginX - 180, currentY);
  doc.text(`Rs. ${biltyData.price || '0'}`, pageWidth - marginX - 80, currentY);

  // Terms and Conditions
  currentY += 50;
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Terms and Conditions:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  currentY += 15;
  doc.text('1. The transporter is responsible for safe delivery of goods according to the specified route.', marginX + 20, currentY);
  currentY += 15;
  doc.text('2. All claims for damage or loss must be made within 7 days of the delivery date.', marginX + 20, currentY);
  currentY += 15;
  doc.text('3. This document is a digital record. Subject to jurisdiction of local courts.', marginX + 20, currentY);

  // Signatures
  currentY += 70;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX + 20, currentY, marginX + 180, currentY);
  doc.line(pageWidth - marginX - 180, currentY, pageWidth - marginX - 20, currentY);

  currentY += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Transporter / Driver Signature', marginX + 20, currentY);
  doc.text('Consignor / Consignee Signature', pageWidth - marginX - 180, currentY);

  // Light watermark text (no GState needed)
  doc.setFontSize(55);
  doc.setTextColor(210, 240, 245);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED BILTY', pageWidth / 2, pageHeight / 2 + 50, { align: 'center', angle: -30 });

  // Return as blob URL so caller can embed or download
  return doc.output('bloburl');
};

/**
 * Directly triggers a browser download of the Bilty PDF.
 * @param {object} biltyData
 */
export const generateBiltyPDF = (biltyData) => {
  try {
    const blobUrl = generateBiltyPDFBlob(biltyData);
    const idStr = String(biltyData._id || biltyData.id || '000000');
    const filename = `Bilty_${idStr.slice(0, 6).toUpperCase()}.pdf`;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('Failed to generate PDF: ' + err.message);
  }
};
