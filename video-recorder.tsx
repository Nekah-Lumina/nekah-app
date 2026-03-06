import { useState, useRef, useCallback } from 'react';
import { Video, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoComplete: (videoBlob: Blob) => void;
  maxDuration?: number; // in seconds
}

export function VideoRecorder({ 
  isOpen, 
  onClose, 
  onVideoComplete, 
  maxDuration = 10 
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(videoBlob);
        setRecordedVideoURL(videoURL);
        onVideoComplete(videoBlob);
        
        // Cleanup stream
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      toast({
        title: "Recording Started",
        description: `Recording video for ${maxDuration} seconds maximum`,
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera and microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [maxDuration, onVideoComplete, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Recording Complete",
        description: `Video recorded successfully (${recordingTime} seconds)`,
      });
    }
  }, [isRecording, recordingTime, toast]);

  const resetRecording = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setRecordedVideoURL(null);
    setIsRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const handleClose = useCallback(() => {
    resetRecording();
    onClose();
  }, [resetRecording, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Record Video Message
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {recordedVideoURL ? (
              <video
                src={recordedVideoURL}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                REC {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!recordedVideoURL ? (
              <>
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16"
                  >
                    <Video className="w-6 h-6" />
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-16 h-16"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Record Again
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex items-center gap-2"
                >
                  Use Video
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {!recordedVideoURL 
                ? `Record up to ${maxDuration} seconds to share your thoughts` 
                : "Review your video and choose to use it or record again"
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}