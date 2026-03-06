import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Calendar, Activity, Camera, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { I18nService } from '@/lib/i18n';

export default function GrowthScan() {
  const [, setLocation] = useLocation();
  const [scanData, setScanData] = useState({
    date: '',
    gestationalAge: '',
    estimatedWeight: '',
    biparietal: '',
    femurLength: '',
    abdominalCircumference: '',
    notes: '',
    nextScan: ''
  });

  const handleSave = () => {
    // Save scan data to local storage
    const existingScans = JSON.parse(localStorage.getItem('nekah_growth_scans') || '[]');
    const newScan = {
      id: Date.now().toString(),
      ...scanData,
      timestamp: new Date().toISOString()
    };
    existingScans.push(newScan);
    localStorage.setItem('nekah_growth_scans', JSON.stringify(existingScans));
    
    alert('Growth scan data saved successfully!');
    setLocation('/baby-tracker');
  };

  return (
    <div className="screen-container bg-white">
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/baby-tracker')}
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Growth Scan Tracker</h2>
        </div>

        {/* Scan Information Form */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Scan Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scanDate">Scan Date</Label>
                <Input
                  id="scanDate"
                  type="date"
                  value={scanData.date}
                  onChange={(e) => setScanData({...scanData, date: e.target.value})}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="gestationalAge">Gestational Age (weeks + days)</Label>
                <Input
                  id="gestationalAge"
                  placeholder="e.g., 32+4"
                  value={scanData.gestationalAge}
                  onChange={(e) => setScanData({...scanData, gestationalAge: e.target.value})}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Baby Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Estimated Weight (grams)</Label>
                <Input
                  id="weight"
                  placeholder="e.g., 1800"
                  value={scanData.estimatedWeight}
                  onChange={(e) => setScanData({...scanData, estimatedWeight: e.target.value})}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="biparietal">Biparietal Diameter (mm)</Label>
                <Input
                  id="biparietal"
                  placeholder="e.g., 82"
                  value={scanData.biparietal}
                  onChange={(e) => setScanData({...scanData, biparietal: e.target.value})}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="femur">Femur Length (mm)</Label>
                <Input
                  id="femur"
                  placeholder="e.g., 58"
                  value={scanData.femurLength}
                  onChange={(e) => setScanData({...scanData, femurLength: e.target.value})}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="abdominal">Abdominal Circumference (mm)</Label>
                <Input
                  id="abdominal"
                  placeholder="e.g., 290"
                  value={scanData.abdominalCircumference}
                  onChange={(e) => setScanData({...scanData, abdominalCircumference: e.target.value})}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="notes">Doctor's Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any notes from the sonographer or doctor..."
                value={scanData.notes}
                onChange={(e) => setScanData({...scanData, notes: e.target.value})}
                className="border-purple-200 focus:border-purple-400 min-h-24"
              />
            </div>
            <div>
              <Label htmlFor="nextScan">Next Scheduled Scan</Label>
              <Input
                id="nextScan"
                type="date"
                value={scanData.nextScan}
                onChange={(e) => setScanData({...scanData, nextScan: e.target.value})}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSave}
            className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg"
          >
            Save Scan Data
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation('/baby-tracker')}
            className="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}