import { useEffect, useRef, useState } from 'react';
import { X, Printer, Download, FileText, Loader2 } from 'lucide-react';
import { generateBiltyPDFBlob, generateBiltyPDF } from '../utils/generateBiltyPDF';
import { ChamakRibbon } from './TruckArt';

/**
 * BiltyModal – shows the generated PDF embedded in an iframe with Print & Download actions.
 *
 * Props:
 *   booking  – the booking object to generate the bilty for (null = closed)
 *   onClose  – callback to close the modal
 */
export default function BiltyModal({ booking, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const urlRef = useRef(null); // track for cleanup

  // Build biltyData from booking
  const getBiltyData = (b) => ({
    id: b.cargoId || b.id || b._id,
    _id: b.id || b._id,
    cargoTitle: b.cargoTitle || b.cargo?.title,
    transporterName: b.transporterName,
    truckPlate: b.truckPlate,
    price: b.price,
    completedAt: b.completedAt || b.createdAt,
    origin: b.origin || b.cargo?.origin,
    destination: b.destination || b.cargo?.destination,
    weight: b.weight || b.cargo?.weight,
    businessOwnerName: b.cargo?.businessOwnerName || b.businessOwnerName,
    packagingType: b.cargo?.packagingType || b.packagingType,
    paymentTerms: b.cargo?.paymentTerms || b.paymentTerms,
    specialHandling: b.cargo?.specialHandling || b.specialHandling,
    senderNTN: b.cargo?.senderNTN || b.senderNTN,
    deliveryNotes: b.cargo?.deliveryNotes || b.deliveryNotes,
    chargeableWeight: b.cargo?.chargeableWeight || b.chargeableWeight,
    receiverSignature: b.receiverSignature,
  });

  useEffect(() => {
    if (!booking) return;
    setLoading(true);
    setError(null);
    let active = true;

    generateBiltyPDFBlob(getBiltyData(booking))
      .then((url) => {
        if (active) {
          urlRef.current = url;
          setPdfUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('BiltyModal PDF error:', err);
          setError(err.message || 'Failed to generate PDF.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
      // Revoke blob URL on unmount / booking change
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [booking]);

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.focus();
      iframeRef.current.contentWindow?.print();
    }
  };

  const handleDownload = () => {
    if (booking) {
      generateBiltyPDF(getBiltyData(booking));
    }
  };

  if (!booking) return null;

  const idStr = String(booking.id || booking._id || '000000');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl px-4 py-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white/95 backdrop-blur-2xl border-2 border-cyan-400 rounded-3xl shadow-[0_30px_80px_rgba(2,132,199,0.35),0_15px_35px_rgba(124,58,237,0.25)] w-full max-w-4xl flex flex-col overflow-hidden relative modal-enter"
        style={{ maxHeight: '92vh' }}
      >
        {/* Top Chamak Patti Ribbon */}
        <ChamakRibbon height="h-[5px]" />

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-200 shrink-0 bg-gradient-to-r from-sky-50/90 via-purple-50/80 to-amber-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-amber-500 p-0.5 shadow-sm overflow-hidden shrink-0">
              <img src="/logo.jpg" alt="E-CARGO-BILTY" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Official Digital Lorry Receipt
                </h2>
                <span className="font-urdu text-sm text-red-700 font-bold">رسید بلٹی</span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                BLT-{idStr.slice(0, 8).toUpperCase()} &nbsp;·&nbsp; {booking.cargoTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print */}
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="btn-outline text-xs !py-1.5 !px-3 cursor-pointer shadow-sm"
            >
              <Printer size={14} />
              Print
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={loading || !!error}
              className="btn-primary text-xs !py-1.5 !px-3 cursor-pointer shadow-sm"
            >
              <Download size={14} />
              Download PDF
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── PDF Viewer Area ── */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden" style={{ minHeight: '520px' }}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin text-amber-600" size={32} />
              <p className="text-xs font-mono tracking-wider text-amber-800 font-bold uppercase">Compiling Verified Bilty PDF...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-600 px-8 text-center">
              <FileText size={36} className="text-red-500" />
              <p className="font-bold text-sm">Could not generate PDF</p>
              <p className="text-xs text-slate-600">{error}</p>
            </div>
          )}

          {pdfUrl && !loading && !error && (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              title="Digital Bilty PDF"
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
            />
          )}
        </div>

        {/* ── Footer hint ── */}
        <div className="px-6 py-2.5 border-t border-amber-200 bg-amber-50/70 flex items-center justify-between text-[11px] text-slate-600 shrink-0 font-mono">
          <span>Official 100% Verified Consignment Note • jsPDF AutoTable Engine</span>
          <span className="font-urdu text-emerald-800 font-bold text-sm">تصدیق شدہ لاری بلٹی • قانونی دستاویز</span>
        </div>
      </div>
    </div>
  );
}
