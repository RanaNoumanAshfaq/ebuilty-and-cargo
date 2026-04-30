import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateBiltyPDF = (biltyData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 255);
  doc.text('E-CARGO-BILTY', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Digital Logistics Platform', 105, 28, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('DIGITAL BILTY RECEIPT', 14, 45);
  
  // Date and ID
  doc.setFontSize(10);
  doc.text(`Date Generated: ${new Date(biltyData.generatedAt).toLocaleDateString()}`, 140, 45);
  doc.text(`Bilty ID: ${biltyData.docId.slice(0, 8).toUpperCase()}`, 140, 52);

  // Divider Line
  doc.setLineWidth(0.5);
  doc.line(14, 58, 196, 58);

  // Table Data
  doc.autoTable({
    startY: 65,
    theme: 'grid',
    headStyles: { fillColor: [0, 243, 255], textColor: [0, 0, 0] },
    head: [['Field', 'Details']],
    body: [
      ['Cargo Description', biltyData.cargoTitle],
      ['Transporter Name', biltyData.transporterName],
      ['Truck License Plate', biltyData.truckPlate],
      ['Agreed Price', `Rs. ${biltyData.price}`],
      ['Delivery Status', 'COMPLETED AND VERIFIED']
    ],
  });

  // Footer / Signatures
  const finalY = doc.lastAutoTable.finalY || 100;
  
  doc.setFontSize(10);
  doc.text('_______________________', 30, finalY + 40);
  doc.text('Transporter Signature', 35, finalY + 46);

  doc.text('_______________________', 130, finalY + 40);
  doc.text('Business Owner Signature', 135, finalY + 46);

  // Watermark
  doc.setFontSize(40);
  doc.setTextColor(200, 200, 200);
  doc.text('VERIFIED', 105, finalY + 80, { align: 'center', angle: -45, opacity: 0.2 });

  // Save PDF
  doc.save(`Bilty_${biltyData.docId.slice(0, 6)}.pdf`);
};
