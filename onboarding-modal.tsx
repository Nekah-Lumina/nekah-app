import { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LocalStorageService } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    maritalStatus: '',
    isPregnant: '',
    pregnancyWeek: '',
    numberOfChildren: '',
    hospitalInfo: '',
    emergencyContact: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if all required fields are filled for button enabling
  const isFormComplete = () => {
    return formData.name.trim() && 
           formData.contact.trim() && 
           formData.maritalStatus && 
           formData.isPregnant;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormComplete()) {
      return;
    }
    
    try {
      const profile: UserProfile = {
        id: Date.now().toString(),
        name: formData.name,
        contact: formData.contact,
        maritalStatus: formData.maritalStatus as any,
        isPregnant: formData.isPregnant === 'yes',
        pregnancyWeek: formData.isPregnant === 'yes' ? parseInt(formData.pregnancyWeek) || undefined : undefined,
        numberOfChildren: parseInt(formData.numberOfChildren) || 0,
        hospitalInfo: formData.hospitalInfo,
        emergencyContact: formData.emergencyContact,
        createdAt: new Date()
      };
      
      // Add a small delay to ensure smooth UX and prevent hanging
      await new Promise(resolve => setTimeout(resolve, 200));
      
      LocalStorageService.setUserProfile(profile);
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6">
      <Card className="w-full max-w-md md:max-w-lg max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-hidden mb-16 sm:mb-0">
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to NEKAH!</h3>
                <p className="text-gray-600">Let's get to know you better to personalize your experience</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-4"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-180px)] p-4 sm:p-6 smooth-scroll">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact" className="text-sm font-medium text-gray-700">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Marital Status</Label>
                <Select onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="relationship">In a relationship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Are you currently pregnant?</Label>
                <RadioGroup
                  value={formData.isPregnant}
                  onValueChange={(value) => handleInputChange('isPregnant', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pregnant-yes" />
                    <Label htmlFor="pregnant-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pregnant-no" />
                    <Label htmlFor="pregnant-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.isPregnant === 'yes' && (
                <div>
                  <Label htmlFor="pregnancyWeek" className="text-sm font-medium text-gray-700">How many weeks pregnant?</Label>
                  <Input
                    id="pregnancyWeek"
                    type="number"
                    placeholder="Enter weeks"
                    min="1"
                    max="42"
                    value={formData.pregnancyWeek}
                    onChange={(e) => handleInputChange('pregnancyWeek', e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="children" className="text-sm font-medium text-gray-700">Number of Children</Label>
                <Input
                  id="children"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.numberOfChildren}
                  onChange={(e) => handleInputChange('numberOfChildren', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="hospital" className="text-sm font-medium text-gray-700">Hospital/Clinic Information</Label>
                <Input
                  id="hospital"
                  type="text"
                  placeholder="Your preferred hospital"
                  value={formData.hospitalInfo}
                  onChange={(e) => handleInputChange('hospitalInfo', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="emergency" className="text-sm font-medium text-gray-700">Emergency Contact</Label>
                <Input
                  id="emergency"
                  type="text"
                  placeholder="Emergency contact name and number"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="mt-1"
                />
              </div>


            </form>
          </div>
        </CardContent>
      </Card>
      
      {/* Submit Button - Universal Device Friendly */}
      <div className="fixed bottom-4 left-4 right-4 z-60 sm:bottom-6 sm:left-auto sm:right-6 md:bottom-8 md:right-8 sm:w-auto">
        <Button
          onClick={(e) => handleSubmit(e as any)}
          disabled={!isFormComplete()}
          className="w-full h-12 sm:w-auto sm:h-16 sm:min-w-[120px] rounded-full bg-gradient-to-r from-primary to-gold-accent hover:from-primary/90 hover:to-gold-accent/90 text-white shadow-2xl font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          style={{
            background: 'linear-gradient(to right, hsl(180, 65%, 55%), hsl(45, 90%, 65%))'
          }}
        >
          <Heart className="w-5 h-5 mr-2 sm:w-6 sm:h-6 sm:mr-2" />
          <span className="font-medium">Submit</span>
        </Button>
      </div>
    </div>
  );
}
