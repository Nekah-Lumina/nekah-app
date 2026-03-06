import { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { cn } from '@/lib/utils';

interface VoiceSymptomLoggerProps {
  onSymptomLogged: (symptoms: string) => void;
  pregnancyWeek?: number;
  className?: string;
}

export function VoiceSymptomLogger({ 
  onSymptomLogged, 
  pregnancyWeek,
  className 
}: VoiceSymptomLoggerProps) {
  const {
    isRecording,
    transcript,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    processVoiceToText
  } = useVoiceRecording();

  const [editedTranscript, setEditedTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update edited transcript when new transcript comes in
  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSubmitSymptoms = async () => {
    if (!editedTranscript.trim()) return;

    setIsSubmitting(true);
    try {
      // Enhance the transcript with structured prompts for better AI analysis
      const enhancedSymptoms = `
Patient Voice Report (Week ${pregnancyWeek || 'Unknown'}):
"${editedTranscript.trim()}"

Voice-logged symptoms require comprehensive analysis for:
- Severity assessment
- Emergency indicators
- Pregnancy-specific complications
- WHO diagnostic criteria application
      `.trim();

      await onSymptomLogged(enhancedSymptoms);
      
      // Clear the recording after successful submission
      clearRecording();
      setEditedTranscript('');
    } catch (error) {
      console.error('Failed to submit symptoms:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    clearRecording();
    setEditedTranscript('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasContent = editedTranscript.trim().length > 0;

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-600">
          <Volume2 className="h-5 w-5" />
          Voice Symptom Logger
        </CardTitle>
        {pregnancyWeek && (
          <Badge variant="outline" className="w-fit">
            Week {pregnancyWeek}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-6"
                disabled={isProcessing}
              >
                <Mic className="h-6 w-6 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                size="lg"
                variant="destructive"
                className="rounded-full px-8 py-6 animate-pulse"
              >
                <MicOff className="h-6 w-6 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              Recording: {formatDuration(recordingDuration)}
            </div>
          )}

          {isProcessing && (
            <div className="text-sm text-gray-600">
              Processing audio...
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Transcript Editor */}
        {hasContent && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Review and edit your symptoms:
            </label>
            <Textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              placeholder="Your symptoms will appear here. You can edit them before submitting."
              className="min-h-[120px] resize-none"
              disabled={isProcessing}
            />
            
            <div className="text-xs text-gray-500">
              Tip: Be specific about pain levels (1-10), duration, location, and any changes you've noticed.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasContent && (
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              disabled={isProcessing || isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              onClick={handleSubmitSymptoms}
              disabled={!editedTranscript.trim() || isProcessing || isSubmitting}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
          </div>
        )}

        {/* Usage Instructions */}
        {!hasContent && !isRecording && (
          <div className="text-center space-y-2 py-4">
            <p className="text-sm text-gray-600">
              Press the microphone button and describe your symptoms naturally.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Speak clearly and at normal pace</div>
              <div>• Include pain levels, timing, and location</div>
              <div>• Mention any changes since last time</div>
              <div>• You can edit the text before submitting</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}