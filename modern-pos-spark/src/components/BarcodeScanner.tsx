import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Start barcode scanning
  const startScanning = async () => {
    try {
      // Request access to the camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please ensure you have granted permission and try again.');
    }
  };
  
  // Stop barcode scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsScanning(false);
    }
  };
  
  // Handle component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Capture and process video frames
  useEffect(() => {
    if (!isScanning || !videoRef.current) return;
    
    // In a real implementation, you would use a library like ZXing
    // to decode the video stream and detect barcodes
    const detectBarcode = () => {
      // This is a simplified simulation of barcode detection
      // In a real app, you would use a canvas to analyze video frames
      // and a library like ZXing for actual barcode detection
      
      // Simulate successful barcode detection
      // In a real app, you would get this value from analyzing the video stream
      const simulatedBarcode = 'BEV001';
      onScan(simulatedBarcode);
      
      // Stop scanning after successful detection
      stopScanning();
    };
    
    // Simulate barcode detection for demonstration
    const detectionTimeout = setTimeout(detectBarcode, 3000);
    
    return () => {
      clearTimeout(detectionTimeout);
    };
  }, [isScanning, videoRef, onScan]);
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {isScanning ? (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 bg-black rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white rounded-lg w-64 h-32 animate-pulse"></div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={stopScanning}
            >
              Stop Scanning
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={startScanning}
          >
            Start Barcode Scanner
          </Button>
        )}
      </CardContent>
    </Card>
  );
}