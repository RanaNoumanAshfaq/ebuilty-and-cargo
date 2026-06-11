import { useEffect, useRef, useState } from 'react';
import { X, Printer, Download, FileText, Loader2 } from 'lucide-react';
import { generateBiltyPDFBlob, generateBiltyPDF } from '../utils/generateBiltyPDF';

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
    id: b.cargoId || b._id,
    _id: b._id,
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

  const idStr = String(booking._id || '000000');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0e0e18] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ maxHeight: '92vh' }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/20 flex items-center justify-center">
              <FileText size={18} className="text-[#00f3ff]" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-white leading-tight">Digital Bilty</h2>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                BLT-{idStr.slice(0, 8).toUpperCase()} &nbsp;·&nbsp; {booking.cargoTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print */}
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 border border-[#00f3ff]/30 text-[#00f3ff] font-bold text-xs rounded-xl transition-all disabled:opacity-40 cursor-pointer"
            >
              <Printer size={14} />
              Print
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download size={14} />
              Download
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── PDF Viewer Area ── */}
        <div className="flex-1 relative bg-[#1a1a28] overflow-hidden" style={{ minHeight: '500px' }}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="animate-spin text-[#00f3ff]" size={32} />
              <p className="text-sm font-semibold">Generating Bilty PDF...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 px-8 text-center">
              <FileText size={36} className="text-red-600" />
              <p className="font-bold">Could not generate PDF</p>
              <p className="text-xs text-gray-500">{error}</p>
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
        <div className="px-6 py-3 border-t border-white/5 text-center text-[10px] text-gray-600 shrink-0">
          Use <span className="text-gray-400 font-bold">Print</span> to send to a printer &nbsp;·&nbsp;
          Use <span className="text-gray-400 font-bold">Download</span> to save the PDF file
        </div>
      </div>
    </div>
  );
}
