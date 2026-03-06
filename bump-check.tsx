import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useCamera } from '../hooks/useCamera';
import { 
  ArrowLeft, 
  Camera, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Eye,
  Heart,
  Shield,
  TrendingUp,
  Clock,
  FileImage,
  Upload,
  Mic,
  Stethoscope,
  Pill,
  Home,
  Timer,
  Target,
  Activity,
  ThermometerSun,
  Droplets
} from 'lucide-react';
import { Link } from 'wouter';
import { VoiceSymptomLogger } from '@/components/VoiceSymptomLogger';

interface HealthAnalysis {
  analysis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'urgent';
  urgentCareNeeded: boolean;
  possibleConditions: string[];
  isAI: boolean;
  fallback?: boolean;
  confidence?: number;
  // Enhanced solution fields
  solutionsAvailable?: boolean;
  immediateSolutions?: string[];
  topicalSolutions?: string[];
  homeRemedies?: string[];
  skincareProtocol?: string[];
  environmentalModifications?: string[];
  monitoringInstructions?: string[];
  preventiveMeasures?: string[];
  whenToSeekHelp?: string[];
}

interface AnalysisHistory {
  id: string;
  timestamp: string;
  imageUrl: string;
  symptoms: string;
  pregnancyWeek?: number;
  analysis: HealthAnalysis;
  analysisType: string;
}

function CameraCapture({ onImageCapture }: { onImageCapture: (imageData: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    isStreamActive, 
    hasPermission, 
    error: cameraError, 
    startCamera, 
    stopCamera 
  } = useCamera(videoRef);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Debug logging
  console.log('CameraCapture state:', { isStreamActive, hasPermission, cameraError });

  const capturePhoto = useCallback(() => {
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
    onImageCapture(imageData);
    stopCamera();
  }, [onImageCapture, stopCamera]);

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (cameraError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Camera Access Error</h3>
          <p className="text-red-700 mb-4">{cameraError}</p>
          <Button onClick={startCamera} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={capturedImage} 
            alt="Captured for analysis" 
            className="w-full h-auto max-h-96 object-contain"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Captured
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={retakePhoto} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
        {isStreamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => console.log('Video metadata loaded, playing...')}
            onPlay={() => console.log('Video is playing')}
            onError={(e) => console.error('Video error:', e)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-300">Camera not active</p>
            </div>
          </div>
        )}
        
        {/* Camera controls overlay */}
        {isStreamActive && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button 
              onClick={capturePhoto}
              size="lg"
              className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-gray-900"
            >
              <Camera className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Start camera button */}
      {!isStreamActive && hasPermission !== false && (
        <Button 
          onClick={() => {
            console.log('Start camera button clicked');
            startCamera();
          }} 
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          <Camera className="w-4 h-4 mr-2" />
          Start Camera
        </Button>
      )}

      {/* Permission request */}
      {hasPermission === false && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-800 text-sm">
              Camera access is needed for health analysis. Please allow camera permission and try again.
            </p>
            <Button onClick={startCamera} className="mt-3" variant="outline">
              Allow Camera Access
            </Button>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function FileUpload({ onImageUpload }: { onImageUpload: (imageData: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
    };
    reader.onerror = () => {
      toast({
        title: "Upload Error",
        description: "Failed to read the selected file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Card className="border-dashed border-2 border-gray-300 hover:border-teal-400 transition-colors cursor-pointer">
        <CardContent 
          className="p-8 text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Image</h3>
          <p className="text-gray-600 mb-4">
            Select an image from your device for health analysis
          </p>
          <Button variant="outline">
            <FileImage className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Supports JPG, PNG, WebP • Max 10MB
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisForm({ 
  imageData, 
  onAnalyze, 
  isAnalyzing 
}: { 
  imageData: string;
  onAnalyze: (data: any) => void;
  isAnalyzing: boolean;
}) {
  const [formData, setFormData] = useState({
    symptoms: '',
    pregnancyWeek: '',
    analysisType: 'general_health',
    additionalNotes: ''
  });

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      imageBase64: imageData,
      symptoms: formData.symptoms,
      pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
      analysisType: formData.analysisType,
      additionalNotes: formData.additionalNotes
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-teal-600" />
          AI Health Analysis
        </CardTitle>
        <CardDescription>
          Provide additional information for more accurate analysis. Use voice input for hands-free symptom description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Select 
              value={formData.analysisType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, analysisType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general_health">General Health Check</SelectItem>
                <SelectItem value="skin_condition">Skin Condition Analysis</SelectItem>
                <SelectItem value="swelling_assessment">Swelling Assessment</SelectItem>
                <SelectItem value="rash_examination">Rash or Irritation</SelectItem>
                <SelectItem value="wound_healing">Wound or Injury Check</SelectItem>
                <SelectItem value="pregnancy_related">Pregnancy-Related Concern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="symptoms">Current Symptoms</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="text-xs"
              >
                <Mic className="w-3 h-3 mr-1" />
                {showVoiceRecorder ? 'Type Instead' : 'Voice Input'}
              </Button>
            </div>
            
            {showVoiceRecorder ? (
              <VoiceSymptomLogger
                onSymptomLogged={(symptoms) => {
                  setFormData(prev => ({ ...prev, symptoms }));
                  setShowVoiceRecorder(false);
                }}
                pregnancyWeek={formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined}
                className="mb-4"
              />
            ) : (
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Describe your symptoms... (e.g., pain, itching, swelling, discoloration, duration, location) 

💡 Tip: Click 'Voice Input' above for hands-free symptom description"
                rows={4}
              />
            )}
          </div>

          <div>
            <Label htmlFor="pregnancyWeek">Pregnancy Week (if applicable)</Label>
            <Input
              id="pregnancyWeek"
              type="number"
              min="1"
              max="42"
              value={formData.pregnancyWeek}
              onChange={(e) => setFormData(prev => ({ ...prev, pregnancyWeek: e.target.value }))}
              placeholder="Current week"
            />
          </div>

          <div>
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional context or concerns..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isAnalyzing}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AnalysisResults({ analysis }: { analysis: HealthAnalysis }) {
  const severityConfig = {
    low: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    urgent: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  };

  const config = severityConfig[analysis.severity];
  const Icon = config.icon;

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-teal-600" />
          AI Analysis Results
          {analysis.fallback && (
            <Badge variant="outline" className="ml-2">
              Fallback Analysis
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {analysis.severity.toUpperCase()} PRIORITY
          </Badge>
          {analysis.confidence && (
            <Badge variant="outline">
              {Math.round(analysis.confidence * 100)}% Confidence
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Urgent Care Alert */}
        {analysis.urgentCareNeeded && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-900">Urgent Medical Attention Required</h3>
            </div>
            <p className="text-red-800 text-sm mb-3">
              Based on the analysis, this condition may require immediate medical evaluation. 
              Please consult with a healthcare provider as soon as possible.
            </p>
            <Button variant="destructive" asChild className="w-full">
              <Link href="/doctor-eye">Find Doctor Now</Link>
            </Button>
          </div>
        )}

        {/* Main Analysis */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{analysis.analysis}</p>
        </div>

        {/* Possible Conditions */}
        {analysis.possibleConditions && analysis.possibleConditions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Possible Conditions</h4>
            <div className="space-y-2">
              {analysis.possibleConditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Healthcare Provider Recommendation */}
        {analysis.severity === 'high' || analysis.severity === 'urgent' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Professional Consultation Recommended</h4>
            </div>
            <p className="text-blue-800 text-sm mb-3">
              Consider scheduling a consultation with a healthcare provider for professional evaluation.
            </p>
            <Button variant="outline" asChild>
              <Link href="/doctor-eye">Browse Healthcare Providers</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Continue Monitoring</h4>
            </div>
            <p className="text-gray-700 text-sm">
              Keep track of any changes and log symptoms in your health journal for ongoing monitoring.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-xs">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and 
            does not replace professional medical advice, diagnosis, or treatment. Always consult 
            qualified healthcare providers for medical concerns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SolutionsDisplay({ analysis }: { analysis: HealthAnalysis }) {
  const solutionSections = [
    {
      title: "Immediate Solutions (Next 30 minutes)",
      icon: Timer,
      items: analysis.immediateSolutions || analysis.recommendations || [],
      color: "bg-red-50 border-red-200",
      iconColor: "text-red-600"
    },
    {
      title: "Topical Treatments",
      icon: Droplets,
      items: analysis.topicalSolutions || [],
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      title: "Home Remedies",
      icon: Home,
      items: analysis.homeRemedies || [],
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600"
    },
    {
      title: "Skincare Protocol",
      icon: Stethoscope,
      items: analysis.skincareProtocol || [],
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      title: "Environmental Changes",
      icon: ThermometerSun,
      items: analysis.environmentalModifications || [],
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600"
    },
    {
      title: "Monitoring Instructions",
      icon: Activity,
      items: analysis.monitoringInstructions || [],
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600"
    },
    {
      title: "Prevention Measures",
      icon: Shield,
      items: analysis.preventiveMeasures || [],
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600"
    }
  ];

  const visibleSections = solutionSections.filter(section => section.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-gray-900">Real-Time Treatment Solutions</h3>
        {analysis.solutionsAvailable && (
          <Badge className="bg-green-100 text-green-800 text-xs">AI-Powered</Badge>
        )}
      </div>
      
      {visibleSections.map((section, index) => (
        <Card key={index} className={`${section.color} border`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className={`w-4 h-4 ${section.iconColor}`} />
              <h4 className="font-medium text-gray-800 text-sm">{section.title}</h4>
            </div>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {analysis.whenToSeekHelp && analysis.whenToSeekHelp.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200 border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <h4 className="font-medium text-gray-800 text-sm">When to Seek Immediate Help</h4>
            </div>
            <div className="space-y-2">
              {analysis.whenToSeekHelp.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AnalysisHistoryCard({ entry }: { entry: AnalysisHistory }) {
  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={entry.imageUrl} 
              alt="Analysis" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {entry.analysisType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <p className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Badge className={`text-xs ${severityColors[entry.analysis.severity]}`}>
                {entry.analysis.severity}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {entry.analysis.analysis}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BumpCheck() {
  const [currentStep, setCurrentStep] = useState<'capture' | 'analyze' | 'results'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera');
  const { toast } = useToast();

  // Load analysis history
  const analysisHistory: AnalysisHistory[] = JSON.parse(
    localStorage.getItem('bumpCheckHistory') || '[]'
  );

  const analyzeImageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/ai/health-analysis', data);
      return response.json();
    },
    onSuccess: (result: HealthAnalysis) => {
      setAnalysis(result);
      setCurrentStep('results');

      // Save to history
      const historyEntry: AnalysisHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        imageUrl: capturedImage!,
        symptoms: result.analysis,
        analysis: result,
        analysisType: 'health_check'
      };

      const updatedHistory = [historyEntry, ...analysisHistory.slice(0, 9)]; // Keep last 10
      localStorage.setItem('bumpCheckHistory', JSON.stringify(updatedHistory));

      toast({
        title: result.urgentCareNeeded ? "Urgent Care Needed" : "Analysis Complete",
        description: result.urgentCareNeeded 
          ? "Your analysis indicates urgent medical attention may be required."
          : "Your health analysis has been completed successfully.",
        variant: result.urgentCareNeeded ? "destructive" : "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentStep('analyze');
  };

  const handleAnalyze = (formData: any) => {
    analyzeImageMutation.mutate(formData);
  };

  const startNewAnalysis = () => {
    setCurrentStep('capture');
    setCapturedImage(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BumpCheck</h1>
            <p className="text-gray-600">AI-powered visual health analysis for pregnancy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'capture' && (
              <div className="space-y-6">
                {/* Capture Method Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Image Source</CardTitle>
                    <CardDescription>
                      Take a photo or upload an existing image for AI health analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <Button
                        variant={captureMethod === 'camera' ? 'default' : 'outline'}
                        onClick={() => setCaptureMethod('camera')}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        variant={captureMethod === 'upload' ? 'default' : 'outline'}
                        onClick={() => setCaptureMethod('upload')}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>

                    {captureMethod === 'camera' ? (
                      <CameraCapture onImageCapture={handleImageCapture} />
                    ) : (
                      <FileUpload onImageUpload={handleImageCapture} />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 'analyze' && capturedImage && (
              <div className="space-y-6">
                {/* Image Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Image for Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-4">
                      <img 
                        src={capturedImage} 
                        alt="For analysis" 
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                    <Button onClick={() => setCurrentStep('capture')} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Choose Different Image
                    </Button>
                  </CardContent>
                </Card>

                {/* Analysis Form */}
                <AnalysisForm 
                  imageData={capturedImage}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzeImageMutation.isPending}
                />
              </div>
            )}

            {currentStep === 'results' && analysis && (
              <div className="space-y-6">
                <AnalysisResults analysis={analysis} />
                
                {/* Real-Time Solutions Display */}
                {(analysis.solutionsAvailable || analysis.immediateSolutions?.length || analysis.topicalSolutions?.length || 
                  analysis.homeRemedies?.length || analysis.skincareProtocol?.length || analysis.environmentalModifications?.length) && (
                  <SolutionsDisplay analysis={analysis} />
                )}
                
                <div className="flex gap-4">
                  <Button onClick={startNewAnalysis} className="flex-1 bg-teal-600 hover:bg-teal-700">
                    <Camera className="w-4 h-4 mr-2" />
                    New Analysis
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/health-journal">
                      <Heart className="w-4 h-4 mr-2" />
                      Save to Journal
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analysis History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Analyses</CardTitle>
                <CardDescription>
                  Your previous BumpCheck results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisHistory.length > 0 ? (
                  <div className="space-y-3">
                    {analysisHistory.slice(0, 5).map((entry) => (
                      <AnalysisHistoryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No analyses yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Start your first health check above
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  <Shield className="w-5 h-5 inline mr-2" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 text-sm space-y-2">
                <p>• This AI analysis is supplementary to professional medical care</p>
                <p>• Always consult healthcare providers for concerning symptoms</p>
                <p>• Emergency symptoms require immediate medical attention</p>
                <p>• Keep regular prenatal appointments</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/health-journal">
                    <FileImage className="w-4 h-4 mr-2" />
                    Health Journal
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/doctor-eye">
                    <Heart className="w-4 h-4 mr-2" />
                    Find Doctor
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/emergency">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Help
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}