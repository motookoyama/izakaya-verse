import React, { useState, useRef, useEffect, useCallback } from 'react';

interface QrScannerProps {
  onClose: () => void;
  onScan: (url: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        if (!('BarcodeDetector' in window)) {
          setError("QR code scanning is not supported in this browser.");
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanFrame();
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not access camera. Please grant permission and try again.");
      }
    };

    const scanFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !isScanning) return;

      try {
        // @ts-ignore - BarcodeDetector is not in standard TS libs yet
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await barcodeDetector.detect(videoRef.current);

        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue);
          setIsScanning(false);
          stopCamera();
          onClose();
          return;
        }
      } catch (err) {
        console.error("Barcode detection error:", err);
        setError("Failed to detect QR code.");
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    startCamera();

    return () => {
      stopCamera();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, onScan, onClose]);

  const handleClose = () => {
      stopCamera();
      onClose();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <h3 className="text-xl font-bold mb-4 text-center text-white">Scan QR Code</h3>
        <div className="relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {error && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-red-400 p-4 text-center">{error}</div>}
          {!error && <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">Initializing camera...</div>}
        </div>
        <button
          onClick={handleClose}
          className="mt-4 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QrScanner;
