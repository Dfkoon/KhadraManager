"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

export default function QRScanner({ onScan, onClose }: { onScan: (data: string) => void, onClose: () => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        scannerRef.current?.clear();
        onClose();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scannerRef.current?.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-10 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white md:text-gray-800"
        >
          <X size={24} />
        </button>
        
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-4">مسح كود العامل</h3>
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden border-2 border-primary/20"></div>
          <p className="mt-4 text-sm text-gray-500">وجه الكاميرا نحو كود QR الخاص بالعامل</p>
        </div>
      </div>
    </div>
  );
}
