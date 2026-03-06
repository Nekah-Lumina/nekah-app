import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Heart, 
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  Brain,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Scale,
  Activity,
  Baby,
  FileText,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';

interface HealthEntry {
  id: string;
  date: string;
  time: string;
  pregnancyWeek?: number;
  entryType: 'symptom' | 'mood' | 'measurement' | 'appointment' | 'medication' | 'craving' | 'analysis';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'urgent';
  measurements?: {
    weight?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature?: number;
    heartRate?: number;
  };
  aiAnalysis?: {
    analysis: string;
    recommendations: string[];
    urgentCare: boolean;
    confidence?: number;
  };
  tags: string[];
  attachments?: string[];
}

interface SymptomEntry {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  triggers?: string;
  notes?: string;
}

function HealthEntryForm({ onEntryAdded }: { onEntryAdded: (entry: HealthEntry) => void }) {
  const [formData, setFormData] = useState({
    entryType: 'symptom' as HealthEntry['entryType'],
    title: '',
    description: '',
    severity: 'low' as HealthEntry['severity'],
    pregnancyWeek: '',
    tags: '',
    measurements: {
      weight: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      temperature: '',
      heartRate: ''
    },
    symptomData: {
      symptom: '',
      severity: 'mild' as SymptomEntry['severity'],
      duration: '',
      triggers: '',
      notes: ''
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeSymptomsMutation = useMutation({
    mutationFn: async (symptoms: string) => {
      const response = await apiRequest('POST', '/api/ai/symptom-analysis', {
        symptoms,
        pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined
      });
      return response.json();
    },
    onSuccess: (result) => {
      setFormData(prev => ({
        ...prev,
        description: `${prev.description}\n\nAI Analysis: ${result.analysis}`,
      }));
      
      toast({
        title: result.urgentCareNeeded ? "⚠️ Urgent Care Recommended" : "Symptom Analysis Complete",
        description: result.urgentCareNeeded 
          ? "This symptom combination may require immediate medical attention."
          : "AI analysis has been added to your journal entry.",
        variant: result.urgentCareNeeded ? "destructive" : "default"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const entry: HealthEntry = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
      entryType: formData.entryType,
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      measurements: formData.entryType === 'measurement' ? {
        weight: formData.measurements.weight ? parseFloat(formData.measurements.weight) : undefined,
        bloodPressure: (formData.measurements.bloodPressureSystolic && formData.measurements.bloodPressureDiastolic) ? {
          systolic: parseInt(formData.measurements.bloodPressureSystolic),
          diastolic: parseInt(formData.measurements.bloodPressureDiastolic)
        } : undefined,
        temperature: formData.measurements.temperature ? parseFloat(formData.measurements.temperature) : undefined,
        heartRate: formData.measurements.heartRate ? parseInt(formData.measurements.heartRate) : undefined
      } : undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    onEntryAdded(entry);
    
    // Reset form
    setFormData({
      entryType: 'symptom',
      title: '',
      description: '',
      severity: 'low',
      pregnancyWeek: '',
      tags: '',
      measurements: {
        weight: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        temperature: '',
        heartRate: ''
      },
      symptomData: {
        symptom: '',
        severity: 'mild',
        duration: '',
        triggers: '',
        notes: ''
      }
    });

    toast({
      title: "Entry Added",
      description: "Your health journal entry has been saved successfully.",
    });
  };

  const handleAnalyzeSymptoms = () => {
    if (!formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter symptom details to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    analyzeSymptomsMutation.mutate(formData.description);
    setIsAnalyzing(false);
  };

  const entryTypeOptions = [
    { value: 'symptom', label: 'Symptom Tracking', icon: AlertTriangle },
    { value: 'mood', label: 'Mood & Wellness', icon: Heart },
    { value: 'measurement', label: 'Health Measurements', icon: Scale },
    { value: 'appointment', label: 'Medical Appointment', icon: Calendar },
    { value: 'medication', label: 'Medication & Supplements', icon: Activity },
    { value: 'craving', label: 'Craving Analysis', icon: Brain }
  ];

  const currentEntryType = entryTypeOptions.find(option => option.value === formData.entryType);
  const EntryIcon = currentEntryType?.icon || FileText;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-teal-600" />
          Add Health Journal Entry
        </CardTitle>
        <CardDescription>
          Track symptoms, measurements, and health insights for comprehensive maternal care
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entry Type Selection */}
          <div>
            <Label htmlFor="entryType">Entry Type</Label>
            <Select value={formData.entryType} onValueChange={(value: HealthEntry['entryType']) => setFormData(prev => ({ ...prev, entryType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entryTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={`e.g., ${currentEntryType?.label}`}
                required
              />
            </div>
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

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description *</Label>
              {formData.entryType === 'symptom' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeSymptoms}
                  disabled={isAnalyzing || analyzeSymptomsMutation.isPending}
                >
                  {isAnalyzing || analyzeSymptomsMutation.isPending ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Analysis
                    </>
                  )}
                </Button>
              )}
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={`Describe your ${formData.entryType}...`}
              rows={4}
              required
            />
          </div>

          {/* Conditional Fields Based on Entry Type */}
          {formData.entryType === 'symptom' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Symptom Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Severity</Label>
                  <Select value={formData.severity} onValueChange={(value: HealthEntry['severity']) => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Mild discomfort</SelectItem>
                      <SelectItem value="medium">Medium - Noticeable symptoms</SelectItem>
                      <SelectItem value="high">High - Concerning symptoms</SelectItem>
                      <SelectItem value="urgent">Urgent - Requires immediate attention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {formData.entryType === 'measurement' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Health Measurements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.measurements.weight}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      measurements: { ...prev.measurements, weight: e.target.value }
                    }))}
                    placeholder="e.g., 65.5"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.measurements.temperature}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      measurements: { ...prev.measurements, temperature: e.target.value }
                    }))}
                    placeholder="e.g., 36.5"
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.measurements.heartRate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      measurements: { ...prev.measurements, heartRate: e.target.value }
                    }))}
                    placeholder="e.g., 72"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label>Blood Pressure (mmHg)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.measurements.bloodPressureSystolic}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        measurements: { ...prev.measurements, bloodPressureSystolic: e.target.value }
                      }))}
                      placeholder="Systolic"
                    />
                    <span className="self-center">/</span>
                    <Input
                      type="number"
                      value={formData.measurements.bloodPressureDiastolic}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        measurements: { ...prev.measurements, bloodPressureDiastolic: e.target.value }
                      }))}
                      placeholder="Diastolic"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., morning sickness, headache, fatigue"
            />
            <p className="text-xs text-gray-600 mt-1">Separate tags with commas</p>
          </div>

          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
            <EntryIcon className="w-4 h-4 mr-2" />
            Add Entry to Journal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function HealthEntryCard({ entry }: { entry: HealthEntry }) {
  const severityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const entryTypeIcons = {
    symptom: AlertTriangle,
    mood: Heart,
    measurement: Scale,
    appointment: Calendar,
    medication: Activity,
    craving: Brain,
    analysis: Eye
  };

  const EntryIcon = entryTypeIcons[entry.entryType] || FileText;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <EntryIcon className="w-5 h-5 text-teal-600" />
            <div>
              <h4 className="font-medium text-gray-900">{entry.title}</h4>
              <p className="text-sm text-gray-500">
                {entry.date} at {entry.time}
                {entry.pregnancyWeek && ` • Week ${entry.pregnancyWeek}`}
              </p>
            </div>
          </div>
          {entry.severity && (
            <Badge className={severityColors[entry.severity]}>
              {entry.severity}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {entry.description}
        </p>

        {/* Measurements Display */}
        {entry.measurements && (
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
            <div className="grid grid-cols-2 gap-2">
              {entry.measurements.weight && (
                <div>Weight: {entry.measurements.weight} kg</div>
              )}
              {entry.measurements.temperature && (
                <div>Temperature: {entry.measurements.temperature}°C</div>
              )}
              {entry.measurements.heartRate && (
                <div>Heart Rate: {entry.measurements.heartRate} bpm</div>
              )}
              {entry.measurements.bloodPressure && (
                <div>BP: {entry.measurements.bloodPressure.systolic}/{entry.measurements.bloodPressure.diastolic} mmHg</div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Display */}
        {entry.aiAnalysis && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">AI Analysis</span>
              {entry.aiAnalysis.confidence && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(entry.aiAnalysis.confidence * 100)}% confidence
                </Badge>
              )}
            </div>
            <p className="text-blue-800">{entry.aiAnalysis.analysis}</p>
            {entry.aiAnalysis.urgentCare && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-1 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Urgent care recommended</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HealthJournal() {
  const [entries, setEntries] = useState<HealthEntry[]>(() => {
    const stored = localStorage.getItem('healthJournalEntries');
    return stored ? JSON.parse(stored) : [];
  });

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleEntryAdded = (entry: HealthEntry) => {
    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('healthJournalEntries', JSON.stringify(updatedEntries));
  };

  // Filter and search entries
  const filteredEntries = entries.filter(entry => {
    const matchesType = filterType === 'all' || entry.entryType === filterType;
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Statistics
  const totalEntries = entries.length;
  const urgentEntries = entries.filter(entry => entry.severity === 'urgent').length;
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

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
            <h1 className="text-3xl font-bold text-gray-900">Health Journal</h1>
            <p className="text-gray-600">Comprehensive health tracking with AI-powered insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="add-entry" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add-entry">Add Entry</TabsTrigger>
                <TabsTrigger value="view-entries">View Entries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="add-entry">
                <HealthEntryForm onEntryAdded={handleEntryAdded} />
              </TabsContent>
              
              <TabsContent value="view-entries" className="space-y-4">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search entries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Entries</SelectItem>
                          <SelectItem value="symptom">Symptoms</SelectItem>
                          <SelectItem value="mood">Mood & Wellness</SelectItem>
                          <SelectItem value="measurement">Measurements</SelectItem>
                          <SelectItem value="appointment">Appointments</SelectItem>
                          <SelectItem value="medication">Medications</SelectItem>
                          <SelectItem value="craving">Cravings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Entries List */}
                {filteredEntries.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEntries.map((entry) => (
                      <HealthEntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || filterType !== 'all' ? 'No matching entries found' : 'No entries yet'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || filterType !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'Start tracking your health journey by adding your first entry'
                        }
                      </p>
                      {!searchTerm && filterType === 'all' && (
                        <Button 
                          onClick={() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            const addEntryTab = tabsList?.querySelector('[value="add-entry"]') as HTMLElement;
                            addEntryTab?.click();
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Entry
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journal Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{totalEntries}</div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{recentEntries}</div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                  {urgentEntries > 0 && (
                    <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                      <div className="text-2xl font-bold text-red-600">{urgentEntries}</div>
                      <div className="text-sm text-red-800">Urgent Entries</div>
                      <p className="text-xs text-red-700 mt-1">Review with healthcare provider</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/bump-check">
                    <Eye className="w-4 h-4 mr-2" />
                    BumpCheck Analysis
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/cravings">
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Craving
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

            {/* Health Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Health Tracking Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 text-sm space-y-2">
                <p>• Log symptoms daily for better pattern recognition</p>
                <p>• Include context like time, activities, and triggers</p>
                <p>• Use AI analysis for symptom interpretation</p>
                <p>• Share urgent entries with your healthcare provider</p>
                <p>• Track measurements regularly for trend analysis</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}