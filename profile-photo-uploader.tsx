import { useState, useRef } from 'react';
import { Camera, Upload, User, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCamera } from '@/hooks/useCamera';

interface ProfilePhotoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (photoUrl: string) => void;
  currentPhotoUrl?: string;
}

export function ProfilePhotoUploader({ 
  isOpen, 
  onClose, 
  onPhotoUploaded,
  currentPhotoUrl 
}: ProfilePhotoUploaderProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    isStreamActive,
    hasPermission,
    error: cameraError,
    startCamera,
    stopCamera
  } = useCamera(videoRef);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImage(result);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const uploadPhoto = async () => {
    const imageToUpload = capturedImage || uploadedImage;
    if (!imageToUpload) return;

    setIsUploading(true);

    try {
      // Get upload URL from backend
      const uploadResponse = await fetch('/api/profile-photo/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await uploadResponse.json();

      // Convert base64 to blob
      const base64Response = await fetch(imageToUpload);
      const blob = await base64Response.blob();

      // Upload to object storage
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': blob.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload photo');
      }

      // Update profile with new photo URL
      const updateResponse = await fetch('/api/profile-photo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePhotoURL: uploadURL.split('?')[0], // Remove query parameters
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      const { profilePhotoUrl } = await updateResponse.json();

      console.log('Profile photo uploaded successfully:', profilePhotoUrl);
      onPhotoUploaded(profilePhotoUrl);
      
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });

      // Reset state and close
      setCapturedImage(null);
      setUploadedImage(null);
      stopCamera();
      onClose();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploader = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Photo */}
          {currentPhotoUrl && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-2 border-4 border-primary/20">
                <img 
                  src={currentPhotoUrl}
                  alt="Current profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-600">Current Photo</p>
            </div>
          )}

          {/* Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={captureMethod === 'camera' ? 'default' : 'outline'}
              onClick={() => setCaptureMethod('camera')}
              className="flex-1"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={captureMethod === 'upload' ? 'default' : 'outline'}
              onClick={() => setCaptureMethod('upload')}
              className="flex-1"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* Camera Capture */}
          {captureMethod === 'camera' && (
            <div className="space-y-4">
              {!capturedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square">
                    {isStreamActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-white">
                          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-gray-300">Camera not active</p>
                        </div>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {!isStreamActive && hasPermission !== false && (
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  )}

                  {isStreamActive && (
                    <Button onClick={capturePhoto} className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  )}

                  {cameraError && (
                    <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {cameraError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={retakePhoto} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button 
                      onClick={uploadPhoto}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Use Photo'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Upload */}
          {captureMethod === 'upload' && (
            <div className="space-y-4">
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload a profile photo</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setUploadedImage(null)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                    <Button 
                      onClick={uploadPhoto}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Use Photo'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={resetUploader} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}