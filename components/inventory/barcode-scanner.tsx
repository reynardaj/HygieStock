'use client';

import * as React from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (isMounted) onScan(decodedText);
          },
          (errorMessage) => {
            // Ignore frequent scan failures (e.g. no barcode in view)
            if (isMounted && onError && !errorMessage.includes('NotFound')) {
              onError(errorMessage);
            }
          }
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        if (isMounted && onError) onError(String(err));
      }
    };

    // Small delay to ensure the DOM element is fully rendered
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode?.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [onScan, onError]);

  return (
    <div id="reader" className="w-full h-full bg-black" />
  );
}
