import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseCameraReturn {
  isStreamActive: boolean;
  hasPermission: boolean | null;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(videoRef: RefObject<HTMLVideoElement>): UseCameraReturn {
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setIsStreamActive(false);
    setError(null);
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      setError(null);
      setIsStreamActive(false);
      
      // Check if browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      console.log('Requesting camera access...');
      
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Camera request timed out after 10 seconds')), 10000)
      );
      
      const cameraRequest = navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: false
      });

      const mediaStream = await Promise.race([cameraRequest, timeout]) as MediaStream;

      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);
      setIsStreamActive(true);

      console.log('Stream setup complete, useEffect will handle video attachment');

    } catch (err) {
      console.error('Camera access error:', err);
      setIsStreamActive(false);
      
      if (err instanceof Error) {
        if (err.message.includes('timed out')) {
          setError('Camera request timed out. Please refresh and try again.');
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setHasPermission(false);
          setError('Camera access was denied. Please allow camera permissions and try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found. Please ensure a camera is connected to your device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
          setError('Camera does not support the required specifications.');
        } else {
          setError('Failed to access camera. Please check your browser settings and try again.');
        }
      } else {
        setError('An unexpected error occurred while accessing the camera.');
      }
    }
  }, [videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up camera');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle video element changes
  useEffect(() => {
    if (videoRef.current && stream && isStreamActive) {
      console.log('Attaching stream via useEffect');
      videoRef.current.srcObject = stream;
      // Ensure the video plays
      videoRef.current.play().catch(console.error);
    }
  }, [stream, isStreamActive]);

  return {
    isStreamActive,
    hasPermission,
    error,
    startCamera,
    stopCamera
  };
}