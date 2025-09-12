import { useState, useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function useBarcodeScanner({ onScan }: UseBarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeBuffer = useRef('');

  useEffect(() => {
    let scanTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle barcode scanner input (usually sends key events rapidly)
      if (e.key === 'Enter') {
        // Barcode scan typically ends with Enter key
        if (barcodeBuffer.current) {
          onScan(barcodeBuffer.current);
          barcodeBuffer.current = '';
        }
      } else if (e.key !== 'Shift') {
        // Accumulate barcode characters (ignore Shift key)
        barcodeBuffer.current += e.key;
        
        // Reset buffer after a short delay (in case of manual typing)
        clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(scanTimeout);
      stopScanning();
    };
  }, [onScan]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions to use barcode scanning.');
      setIsScanning(false);
      console.error('Error accessing camera:', err);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  return {
    isScanning,
    error,
    videoRef,
    startScanning,
    stopScanning
  };
}