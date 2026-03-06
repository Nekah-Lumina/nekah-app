import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  History,
  TrendingUp,
  Info,
  Clock,
  Apple,
  Utensils,
  Shield,
  Heart,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';

interface CravingAnalysis {
  id: string;
  craving: string;
  timestamp: string;
  pregnancyWeek?: number;
  aiAnalysis: string;
  safety: 'safe' | 'moderate' | 'avoid';
  alternatives: string[];
  nutritionalInfo?: string;
  reasoning: string;
  context?: string;
}

interface SafetyConfig {
  color: string;
  icon: any;
  bgColor: string;
  borderColor: string;
  description: string;
}

const safetyConfigs: Record<CravingAnalysis['safety'], SafetyConfig> = {
  safe: {
    color: 'text-green-800',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Generally safe during pregnancy with proper moderation'
  },
  moderate: {
    color: 'text-yellow-800',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Safe in moderation, be mindful of portions and frequency'
  },
  avoid: {
    color: 'text-red-800',
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Should be avoided during pregnancy due to health risks'
  }
};

function CravingAnalyzer() {
  const [formData, setFormData] = useState({
    craving: '',
    pregnancyWeek: '',
    context: ''
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<CravingAnalysis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeCravingMutation = useMutation({
    mutationFn: async (data: any) => {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await apiRequest('POST', '/api/ai/craving-analysis', data, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    onSuccess: (result) => {
      const analysis: CravingAnalysis = {
        id: Date.now().toString(),
        craving: formData.craving,
        timestamp: new Date().toISOString(),
        pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
        aiAnalysis: result.meaning || result.analysis || 'Analysis completed',
        safety: result.safety || 'moderate',
        alternatives: result.alternatives || [],
        reasoning: result.meaning || result.reasoning || '',
        context: formData.context
      };

      setCurrentAnalysis(analysis);

      // Save to localStorage (in a real app, this would go to a database)
      const existingAnalyses = JSON.parse(localStorage.getItem('cravingAnalyses') || '[]');
      const updatedAnalyses = [analysis, ...existingAnalyses.slice(0, 19)]; // Keep last 20
      localStorage.setItem('cravingAnalyses', JSON.stringify(updatedAnalyses));
      queryClient.invalidateQueries({ queryKey: ['craving-analyses'] });

      toast({
        title: result.safety === 'avoid' ? "⚠️ Caution Recommended" : "Analysis Complete",
        description: result.safety === 'avoid' 
          ? "This craving may require careful consideration during pregnancy."
          : "Your craving has been analyzed successfully.",
        variant: result.safety === 'avoid' ? "destructive" : "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze craving. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.craving.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a craving to analyze.",
        variant: "destructive",
      });
      return;
    }

    analyzeCravingMutation.mutate({
      craving: formData.craving,
      pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
      context: formData.context
    });
  };

  const startNewAnalysis = () => {
    setCurrentAnalysis(null);
    setFormData({ craving: '', pregnancyWeek: '', context: '' });
  };

  const quickCravings = [
    'Chocolate',
    'Ice',
    'Red meat',
    'Citrus fruits',
    'Dairy products',
    'Pickles',
    'Spicy food',
    'Starch/Soap'
  ];

  return (
    <div className="space-y-6">
      {!currentAnalysis ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              AI Craving Analysis
            </CardTitle>
            <CardDescription>
              Get instant, medically-informed insights about your pregnancy cravings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="craving">What are you craving? *</Label>
                <Input
                  id="craving"
                  value={formData.craving}
                  onChange={(e) => setFormData(prev => ({ ...prev, craving: e.target.value }))}
                  placeholder="e.g., chocolate, ice, pickles, starch, soap..."
                  required
                />
                
                {/* Quick selection buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <p className="text-sm text-gray-600 w-full mb-1">Quick select:</p>
                  {quickCravings.map((craving) => (
                    <Button
                      key={craving}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, craving }))}
                      className="text-xs"
                    >
                      {craving}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pregnancyWeek">Pregnancy Week (optional)</Label>
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
              </div>

              <div>
                <Label htmlFor="context">Additional Context (optional)</Label>
                <Textarea
                  id="context"
                  value={formData.context}
                  onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                  placeholder="e.g., time of day, how often, intensity of craving..."
                  rows={2}
                />
              </div>

              <Button 
                type="submit" 
                disabled={analyzeCravingMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {analyzeCravingMutation.isPending ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Craving...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Craving
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <CravingAnalysisResults 
          analysis={currentAnalysis} 
          onNewAnalysis={startNewAnalysis}
        />
      )}
    </div>
  );
}

function CravingAnalysisResults({ 
  analysis, 
  onNewAnalysis 
}: { 
  analysis: CravingAnalysis;
  onNewAnalysis: () => void;
}) {
  const safetyConfig = safetyConfigs[analysis.safety];
  const SafetyIcon = safetyConfig.icon;

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <Card className={`${safetyConfig.borderColor} ${safetyConfig.bgColor}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-teal-600" />
                Craving: {analysis.craving}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4" />
                {new Date(analysis.timestamp).toLocaleDateString()} at {new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {analysis.pregnancyWeek && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Week {analysis.pregnancyWeek}</span>
                  </>
                )}
              </CardDescription>
            </div>
            <Badge className={`${safetyConfig.color} ${safetyConfig.bgColor} border-current`}>
              <SafetyIcon className="w-3 h-3 mr-1" />
              {analysis.safety.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Safety Assessment */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              Safety Assessment
            </h4>
            <p className={`text-sm ${safetyConfig.color} font-medium mb-2`}>
              {safetyConfig.description}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>

          {/* AI Analysis */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-600" />
              Medical Analysis
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {analysis.aiAnalysis}
            </p>
          </div>

          {/* Alternatives & Recommendations */}
          {analysis.alternatives && analysis.alternatives.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.alternatives.map((alternative, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{alternative}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Context */}
          {analysis.context && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" />
                Additional Context
              </h4>
              <p className="text-sm text-gray-600 italic">
                "{analysis.context}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={onNewAnalysis} className="flex-1 bg-teal-600 hover:bg-teal-700">
              <Search className="w-4 h-4 mr-2" />
              Analyze Another Craving
            </Button>
            <Button variant="outline" asChild>
              <Link href="/health-journal">
                <Heart className="w-4 h-4 mr-2" />
                Save to Journal
              </Link>
            </Button>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p className="text-amber-800 text-xs">
              <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and 
              does not replace professional medical advice. Always consult your healthcare provider 
              about dietary concerns during pregnancy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CravingHistoryCard({ analysis }: { analysis: CravingAnalysis }) {
  const safetyConfig = safetyConfigs[analysis.safety];
  const SafetyIcon = safetyConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {analysis.craving}
            </h4>
            <p className="text-xs text-gray-500">
              {new Date(analysis.timestamp).toLocaleDateString()}
              {analysis.pregnancyWeek && ` • Week ${analysis.pregnancyWeek}`}
            </p>
          </div>
          <Badge className={`text-xs ${safetyConfig.color} ${safetyConfig.bgColor} border-current`}>
            <SafetyIcon className="w-3 h-3 mr-1" />
            {analysis.safety}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">
          {analysis.reasoning}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Cravings() {
  // Load craving history
  const { data: cravingHistory = [] } = useQuery({
    queryKey: ['craving-analyses'],
    queryFn: () => {
      const stored = localStorage.getItem('cravingAnalyses');
      return stored ? JSON.parse(stored) : [];
    }
  });

  const recentCravings = cravingHistory.slice(0, 5);
  const safeCravings = cravingHistory.filter((c: CravingAnalysis) => c.safety === 'safe').length;
  const avoidCravings = cravingHistory.filter((c: CravingAnalysis) => c.safety === 'avoid').length;

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
            <h1 className="text-3xl font-bold text-gray-900">Cravings Analyzer</h1>
            <p className="text-gray-600">AI-powered safety analysis for pregnancy cravings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analyzer */}
          <div className="lg:col-span-2">
            <CravingAnalyzer />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{cravingHistory.length}</div>
                    <div className="text-sm text-gray-600">Total Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{safeCravings}</div>
                    <div className="text-sm text-gray-600">Safe Cravings</div>
                  </div>
                </div>
                {avoidCravings > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">{avoidCravings} cravings to avoid</span>
                    </div>
                    <p className="text-red-700 text-xs mt-1">
                      Review these with your healthcare provider
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCravings.length > 0 ? (
                  <div className="space-y-3">
                    {recentCravings.map((analysis: CravingAnalysis) => (
                      <CravingHistoryCard key={analysis.id} analysis={analysis} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No analyses yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Start analyzing your cravings above
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
                  Craving Safety Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Safe:</strong> Generally okay in moderation</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span><strong>Moderate:</strong> Be mindful of portions</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span><strong>Avoid:</strong> May pose pregnancy risks</span>
                </div>
                <p className="text-blue-700 text-xs mt-3">
                  Always consult your healthcare provider for personalized dietary advice during pregnancy.
                </p>
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
                    <Heart className="w-4 h-4 mr-2" />
                    Health Journal
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/doctor-eye">
                    <Zap className="w-4 h-4 mr-2" />
                    Consult Doctor
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