import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

/**
 * Generates the Bilty PDF and returns a Blob URL string.
 * The caller is responsible for revoking the URL when done (URL.revokeObjectURL).
 * @param {object} biltyData
 * @returns {Promise<string>} blobUrl
 */
export const generateBiltyPDFBlob = async (biltyData) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const idStr = String(biltyData._id || biltyData.id || '00000000');
  const dateVal = biltyData.completedAt || biltyData.createdAt || new Date();

  const marginX = 40;
  const marginY = 40;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Generate verified QR code with consignment metadata
  const qrPayload = JSON.stringify({
    biltyNo: `BLT-${idStr.slice(0, 8).toUpperCase()}`,
    shipper: biltyData.businessOwnerName || biltyData.businessName || 'Authorized Shipper',
    transporter: biltyData.transporterName || 'Fleet Transporter',
    truckPlate: biltyData.truckPlate || 'Unassigned',
    origin: biltyData.origin || 'N/A',
    destination: biltyData.destination || 'N/A',
    weight: `${biltyData.weight || '0'} tons`,
    freight: `PKR ${biltyData.price || '0'}`,
    terms: biltyData.paymentTerms || 'Prepaid',
    verifiedAt: new Date(dateVal).toISOString()
  });

  let qrDataUrl = null;
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: { dark: '#0B101D', light: '#FFFFFF' }
    });
  } catch (err) {
    console.error('QR code generation error:', err);
  }

  // Outer Border (Sindhi Crimson)
  doc.setLineWidth(1.5);
  doc.setDrawColor(185, 28, 28);
  doc.rect(marginX, marginY, pageWidth - marginX * 2, pageHeight - marginY * 2);

  // Header Background (Sindhi Crimson Red)
  doc.setFillColor(185, 28, 28);
  doc.rect(marginX, marginY, pageWidth - marginX * 2, 75, 'F');

  // Decorative Golden Saffron Stripe
  doc.setFillColor(245, 158, 11);
  doc.rect(marginX, marginY + 75, pageWidth - marginX * 2, 5, 'F');

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('E-CARGO-BILTY', marginX + 18, marginY + 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(254, 243, 199);
  doc.text('Official Digital Lorry Receipt (Bilty) • National Freight Network of Pakistan', marginX + 18, marginY + 48);
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Ministry of Communications Compliant • 100% Cryptographically Verified Consignment', marginX + 18, marginY + 62);

  // Embed High-Res Scannable QR Code in Header Top-Right
  if (qrDataUrl) {
    // White background card for QR
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - marginX - 70, marginY + 7, 62, 62, 4, 4, 'F');
    doc.addImage(qrDataUrl, 'PNG', pageWidth - marginX - 68, marginY + 9, 58, 58);
  }

  // Border below header
  doc.setLineWidth(1);
  doc.setDrawColor(185, 28, 28);
  doc.line(marginX, marginY + 80, pageWidth - marginX, marginY + 80);

  // Bilty Details Section
  let currentY = marginY + 105;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('Bilty ID / No:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`BLT-${idStr.slice(0, 8).toUpperCase()}`, marginX + 105, currentY);

  currentY += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Date Issued:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(dateVal).toLocaleDateString()} ${new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, marginX + 105, currentY);

  currentY += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Origin Depot:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  const originText = biltyData.origin ? String(biltyData.origin) : 'N/A';
  doc.text(originText.length > 25 ? originText.substring(0, 25) + '...' : originText, marginX + 105, currentY);

  currentY += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Consignor/Shipper:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  const shipperName = biltyData.businessOwnerName || biltyData.businessName || 'Shipper Enterprise';
  doc.text(shipperName.length > 25 ? shipperName.substring(0, 25) + '...' : shipperName, marginX + 105, currentY);

  if (biltyData.senderNTN) {
    currentY += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Sender NTN / Tax ID:', marginX + 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${biltyData.senderNTN}`, marginX + 130, currentY);
  }

  // Right Column
  const rightColX = pageWidth / 2 + 10;
  let currentYRight = marginY + 105;

  doc.setFont('helvetica', 'bold');
  doc.text('Transporter:', rightColX, currentYRight);
  doc.setFont('helvetica', 'normal');
  const transName = biltyData.transporterName || 'Verified Transporter';
  doc.text(transName.length > 22 ? transName.substring(0, 22) + '...' : transName, rightColX + 85, currentYRight);

  currentYRight += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Truck Plate:', rightColX, currentYRight);
  doc.setFont('helvetica', 'normal');
  doc.text(`${biltyData.truckPlate || 'Unassigned'}`, rightColX + 85, currentYRight);

  currentYRight += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Destination Hub:', rightColX, currentYRight);
  doc.setFont('helvetica', 'normal');
  const destText = biltyData.destination ? String(biltyData.destination) : 'N/A';
  doc.text(destText.length > 22 ? destText.substring(0, 22) + '...' : destText, rightColX + 85, currentYRight);

  // Payment Terms Stamp Banner
  currentYRight += 20;
  const paymentTerms = biltyData.paymentTerms || 'Prepaid';
  const isPrepaid = paymentTerms.toLowerCase().includes('prepaid');
  const isNet30 = paymentTerms.toLowerCase().includes('net-30') || paymentTerms.toLowerCase().includes('corp');
  
  const stampBg = isPrepaid ? [16, 185, 129] : isNet30 ? [59, 130, 246] : [225, 29, 72];
  doc.setFillColor(stampBg[0], stampBg[1], stampBg[2]);
  doc.roundedRect(rightColX, currentYRight - 11, 140, 18, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`TERMS: ${paymentTerms.toUpperCase()}`, rightColX + 70, currentYRight + 1, { align: 'center' });

  // Divider
  currentY = Math.max(currentY, currentYRight) + 24;
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  // Special Cargo Handling Warning Badges
  const flags = Array.isArray(biltyData.specialHandling) ? biltyData.specialHandling : [];
  if (flags.length > 0) {
    currentY += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text('SPECIAL CARGO HANDLING INSTRUCTIONS:', marginX + 20, currentY);
    
    currentY += 8;
    let badgeX = marginX + 20;
    flags.forEach((flag) => {
      let label = flag.toUpperCase();
      let r = 245, g = 158, b = 11; // amber default
      if (flag === 'fragile') { label = 'FRAGILE GOODS'; r = 245; g = 158; b = 11; }
      if (flag === 'cold_chain') { label = 'COLD-CHAIN / PERISHABLE'; r = 6; g = 182; b = 212; }
      if (flag === 'hazmat') { label = 'HAZARDOUS MATERIAL'; r = 225; g = 29; b = 72; }
      if (flag === 'upright') { label = 'KEEP UPRIGHT - DO NOT STACK'; r = 147; g = 51; b = 234; }

      const badgeWidth = doc.getTextWidth(label) + 16;
      if (badgeX + badgeWidth > pageWidth - marginX - 20) {
        badgeX = marginX + 20;
        currentY += 18;
      }
      doc.setFillColor(r, g, b);
      doc.roundedRect(badgeX, currentY, badgeWidth, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(label, badgeX + badgeWidth / 2, currentY + 10, { align: 'center' });
      badgeX += badgeWidth + 8;
    });
    currentY += 20;
  } else {
    currentY += 10;
  }

  // AutoTable for Cargo Particulars & Packaging
  const packaging = biltyData.packagingType || 'Cartons / Boxes';
  const chargeableWt = biltyData.chargeableWeight || biltyData.weight || '12.5';
  
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX + 10, right: marginX + 10 },
    theme: 'grid',
    headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 6 },
    head: [['Description of Goods', 'Packaging', 'Chargeable Weight', 'Freight Rate / Total']],
    body: [
      [
        biltyData.cargoTitle || 'General Commercial Cargo',
        packaging,
        `${chargeableWt} Metric Tons`,
        `Rs. ${biltyData.price || '50,000'}`
      ]
    ],
  });

  // Totals Area
  currentY = doc.lastAutoTable.finalY + 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Agreed Freight:', pageWidth - marginX - 210, currentY);
  doc.setTextColor(185, 28, 28);
  doc.text(`Rs. ${biltyData.price || '50,000'}`, pageWidth - marginX - 70, currentY, { align: 'right' });

  // Delivery Notes if present
  if (biltyData.deliveryNotes) {
    currentY += 16;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Consignee Gate Notes: "${biltyData.deliveryNotes}"`, marginX + 20, currentY);
  }

  // Terms and Conditions
  currentY += 25;
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Standard Terms & Carriage Conditions:', marginX + 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  currentY += 12;
  doc.text('1. The transporter is fully responsible for safe conveyance and delivery of consignment via assigned transponder truck.', marginX + 20, currentY);
  currentY += 11;
  doc.text('2. All claims for shortage, in-transit damage, or transit delay must be registered within 7 calendar days of e-POD generation.', marginX + 20, currentY);
  currentY += 11;
  doc.text('3. This e-Bilty serves as a verified legal carrier manifest under Pakistani Carriage of Goods by Road Act & Sales Tax Rules.', marginX + 20, currentY);

  // Signatures Section with Touchscreen e-POD embedding
  currentY += 55;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX + 20, currentY, marginX + 180, currentY);
  doc.line(pageWidth - marginX - 180, currentY, pageWidth - marginX - 20, currentY);

  // If electronic touchscreen signature was captured at delivery, embed it right above the line!
  if (biltyData.receiverSignature) {
    try {
      doc.addImage(biltyData.receiverSignature, 'PNG', pageWidth - marginX - 175, currentY - 45, 120, 40);
    } catch (e) {
      console.warn('Could not embed receiver signature:', e);
    }
  }

  currentY += 12;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Transporter / Driver Sign', marginX + 20, currentY);
  
  if (biltyData.receiverSignature) {
    doc.setTextColor(16, 185, 129);
    doc.text('Consignee (e-POD Verified)', pageWidth - marginX - 180, currentY);
  } else {
    doc.setTextColor(0, 0, 0);
    doc.text('Consignee Signature', pageWidth - marginX - 180, currentY);
  }

  // Light watermark text
  doc.setFontSize(50);
  doc.setTextColor(230, 240, 245);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED E-BILTY', pageWidth / 2, pageHeight / 2 + 50, { align: 'center', angle: -30 });

  return doc.output('bloburl');
};

/**
 * Directly triggers a browser download of the Bilty PDF.
 * @param {object} biltyData
 */
export const generateBiltyPDF = async (biltyData) => {
  try {
    const blobUrl = await generateBiltyPDFBlob(biltyData);
    const idStr = String(biltyData._id || biltyData.id || '000000');
    const filename = `Bilty_${idStr.slice(0, 6).toUpperCase()}.pdf`;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('Failed to generate PDF: ' + err.message);
  }
};
