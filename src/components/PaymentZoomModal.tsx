import React, { useState } from 'react';
import { Registration } from '../types';
import { X, ZoomIn, ZoomOut, RotateCw, Download, CheckCircle, XCircle } from 'lucide-react';

interface PaymentZoomModalProps {
  registration: Registration | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PaymentZoomModal: React.FC<PaymentZoomModalProps> = ({
  registration,
  onClose,
  onApprove,
  onReject,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!registration) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = registration.paymentScreenshot;
    a.download = `payment_${registration.gameName}_${registration.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-4xl bg-[#11131b] border border-[#3b494b]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 bg-[#191b24] border-b border-[#3b494b]/30 flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-white text-base">
              Payment Receipt Verification
            </h3>
            <p className="text-xs text-[#b9cacb]">
              Player: <span className="text-[#00f0ff] font-bold">{registration.gameName}</span> (FF
              ID: {registration.freeFireId})
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-[#33343e] hover:bg-[#3b494b] text-[#00f0ff] rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-[#33343e] hover:bg-[#3b494b] text-[#00f0ff] rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 bg-[#33343e] hover:bg-[#3b494b] text-[#00f0ff] rounded cursor-pointer"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-[#33343e] hover:bg-[#3b494b] text-[#00f0ff] rounded cursor-pointer"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-950 hover:bg-red-900 text-red-400 rounded cursor-pointer ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[#0c0e16]">
          <div
            className="transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={registration.paymentScreenshot}
              alt="Payment screenshot receipt"
              className="max-w-full max-h-[60vh] object-contain rounded border border-[#3b494b] shadow-2xl"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-[#191b24] border-t border-[#3b494b]/30 flex justify-between items-center">
          <div className="text-xs text-[#b9cacb]">
            Status:{' '}
            <span
              className={`font-bold ${
                registration.status === 'APPROVED'
                  ? 'text-green-400'
                  : registration.status === 'REJECTED'
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}
            >
              {registration.status}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onReject(registration.id);
                onClose();
              }}
              className="px-5 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Registration</span>
            </button>
            <button
              onClick={() => {
                onApprove(registration.id);
                onClose();
              }}
              className="px-5 py-2 bg-[#00f0ff] text-[#00363a] rounded font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
