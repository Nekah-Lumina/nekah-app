import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Check, RotateCcw } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
  onClose: () => void;
}

export function PhotoCapture({ onPhotoCapture, onClose }: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Camera timeout')), 8000)
      );
      
      const cameraRequest = navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });
      
      const mediaStream = await Promise.race([cameraRequest, timeout]) as MediaStream;
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob);
        setCapturedPhoto(photoUrl);
      }
    }, 'image/jpeg', 0.8);
  }, []);

  const acceptPhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
      cleanup();
      onClose();
    }
  }, [capturedPhoto, onPhotoCapture, onClose]);

  const retakePhoto = useCallback(() => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
      setCapturedPhoto(null);
    }
  }, [capturedPhoto]);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
  }, [stream, capturedPhoto]);

  // Start camera when component mounts
  useState(() => {
    startCamera();
    return cleanup;
  });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h3 className="text-white font-semibold">Capture Health Photo</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            cleanup();
            onClose();
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Camera/Photo View */}
      <div className="flex-1 relative">
        {capturedPhoto ? (
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {/* Guidelines overlay */}
        {!capturedPhoto && !isLoading && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-64 border-2 border-white/50 rounded-lg"></div>
            </div>
            <div className="absolute bottom-20 left-0 right-0 text-center">
              <p className="text-white text-sm">
                Position the area of concern within the frame
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {capturedPhoto ? (
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={acceptPhoto}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Check className="w-5 h-5 mr-2" />
              Use Photo
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Button
              onClick={capturePhoto}
              disabled={isLoading || !stream}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16"
            >
              <Camera className="w-8 h-8" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}