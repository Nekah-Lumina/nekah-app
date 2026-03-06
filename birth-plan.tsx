import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Heart, Users, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function BirthPlan() {
  const [, setLocation] = useLocation();
  const [birthPlan, setBirthPlan] = useState({
    preferredHospital: '',
    birthPartner: '',
    laborPreferences: {
      naturalBirth: false,
      epidural: false,
      waterBirth: false,
      movementDuringLabor: false,
      musicPlaying: false
    },
    deliveryPreferences: {
      immediateSkintToSkin: false,
      delayedCordClamping: false,
      birthPhotography: false,
      whoCanBeCut: ''
    },
    postBirthPreferences: {
      breastfeeding: false,
      roommingIn: false,
      visitationLimits: ''
    },
    specialRequests: '',
    emergencyContacts: {
      primary: '',
      secondary: ''
    }
  });

  const handleSave = () => {
    localStorage.setItem('nekah_birth_plan', JSON.stringify(birthPlan));
    alert('Birth plan saved successfully!');
    setLocation('/baby-tracker');
  };

  const updatePreference = (category: keyof typeof birthPlan.laborPreferences | keyof typeof birthPlan.deliveryPreferences | keyof typeof birthPlan.postBirthPreferences, preference: string, checked: boolean) => {
    setBirthPlan(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [preference]: checked
      }
    }));
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
          <h2 className="text-2xl font-bold text-gray-800">Birth Plan</h2>
        </div>

        {/* Hospital & Support */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Hospital & Support Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="hospital">Preferred Hospital/Birth Center</Label>
              <Input
                id="hospital"
                placeholder="Enter hospital name"
                value={birthPlan.preferredHospital}
                onChange={(e) => setBirthPlan({...birthPlan, preferredHospital: e.target.value})}
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
            <div>
              <Label htmlFor="partner">Birth Partner</Label>
              <Input
                id="partner"
                placeholder="Who will support you during labor?"
                value={birthPlan.birthPartner}
                onChange={(e) => setBirthPlan({...birthPlan, birthPartner: e.target.value})}
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Labor Preferences */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Labor Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                naturalBirth: 'Natural birth (no interventions)',
                epidural: 'Epidural for pain relief',
                waterBirth: 'Water birth option',
                movementDuringLabor: 'Freedom to move during labor',
                musicPlaying: 'Play music during labor'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={birthPlan.laborPreferences[key as keyof typeof birthPlan.laborPreferences]}
                    onCheckedChange={(checked) => updatePreference('laborPreferences', key, checked as boolean)}
                    className="border-blue-300"
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Preferences */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Delivery Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                immediateSkintToSkin: 'Immediate skin-to-skin contact',
                delayedCordClamping: 'Delayed cord clamping',
                birthPhotography: 'Birth photography allowed'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={birthPlan.deliveryPreferences[key as keyof typeof birthPlan.deliveryPreferences]}
                    onCheckedChange={(checked) => updatePreference('deliveryPreferences', key, checked as boolean)}
                    className="border-green-300"
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="cordCutting">Who can cut the umbilical cord?</Label>
              <Input
                id="cordCutting"
                placeholder="e.g., Partner, Me, Doctor"
                value={birthPlan.deliveryPreferences.whoCanBeCut}
                onChange={(e) => setBirthPlan(prev => ({
                  ...prev,
                  deliveryPreferences: {
                    ...prev.deliveryPreferences,
                    whoCanBeCut: e.target.value
                  }
                }))}
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Special Requests */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Special Requests & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="requests">Special Requests</Label>
              <Textarea
                id="requests"
                placeholder="Any special requests, cultural considerations, or important notes for your medical team..."
                value={birthPlan.specialRequests}
                onChange={(e) => setBirthPlan({...birthPlan, specialRequests: e.target.value})}
                className="border-purple-200 focus:border-purple-400 min-h-24"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary">Primary Emergency Contact</Label>
                <Input
                  id="primary"
                  placeholder="Name and phone number"
                  value={birthPlan.emergencyContacts.primary}
                  onChange={(e) => setBirthPlan(prev => ({
                    ...prev,
                    emergencyContacts: {
                      ...prev.emergencyContacts,
                      primary: e.target.value
                    }
                  }))}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div>
                <Label htmlFor="secondary">Secondary Emergency Contact</Label>
                <Input
                  id="secondary"
                  placeholder="Name and phone number"
                  value={birthPlan.emergencyContacts.secondary}
                  onChange={(e) => setBirthPlan(prev => ({
                    ...prev,
                    emergencyContacts: {
                      ...prev.emergencyContacts,
                      secondary: e.target.value
                    }
                  }))}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSave}
            className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg"
          >
            Save Birth Plan
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