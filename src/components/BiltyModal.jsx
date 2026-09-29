import { useEffect, useRef, useState } from 'react';
import { X, Printer, Download, FileText, Loader2 } from 'lucide-react';
import { generateBiltyPDFBlob, generateBiltyPDF } from '../utils/generateBiltyPDF';
import { ChamakRibbon, TruckTaj } from './TruckArt';

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
  });

  useEffect(() => {
    if (!booking) return;
    setLoading(true);
    setError(null);

    try {
      const url = generateBiltyPDFBlob(getBiltyData(booking));
      urlRef.current = url;
      setPdfUrl(url);
      setLoading(false);
    } catch (err) {
      console.error('BiltyModal PDF error:', err);
      setError(err.message || 'Failed to generate PDF.');
      setLoading(false);
    }

    return () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white border-2 border-amber-300 rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden relative"
        style={{ maxHeight: '92vh' }}
      >
        {/* Top Chamak Patti Ribbon */}
        <ChamakRibbon height="h-[5px]" />

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 shrink-0 bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shadow-sm">
              <TruckTaj size={26} />
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
          <span className="font-urdu text-red-700 font-bold text-sm">دیکھ مگر پیار سے</span>
        </div>
      </div>
    </div>
  );
}
