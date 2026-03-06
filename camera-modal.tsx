import { useEffect } from 'react';
import { X, Camera, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCamera } from '@/hooks/use-camera';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUrl: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const {
    capturedImage,
    error,
    videoRef,
    canvasRef,
    openCamera,
    closeCamera,
    capturePhoto,
    retakePhoto
  } = useCamera();

  useEffect(() => {
    if (isOpen) {
      openCamera();
    } else {
      closeCamera();
    }
    
    return () => closeCamera();
  }, [isOpen, openCamera, closeCamera]);

  const handleCapture = () => {
    capturePhoto();
  };

  const handleRetake = () => {
    retakePhoto();
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      closeCamera();
    }
  };

  const handleClose = () => {
    closeCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Camera</h3>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <Button
                onClick={openCamera}
                className="mt-2 text-sm"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}

          <div className="relative mb-4">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg"
              />
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-gray-900"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {capturedImage ? (
              <>
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={handleUsePhoto}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Use Photo
                </Button>
              </>
            ) : (
              <Button
                onClick={handleCapture}
                disabled={!!error}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CameraModal;
