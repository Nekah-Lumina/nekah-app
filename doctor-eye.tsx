import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Star, Clock, Video, Phone, MessageCircle, Heart, Shield, Award, MapPin, Languages } from 'lucide-react';
import { Link } from 'wouter';

// No payment processing - direct consultation booking

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  consultationTypes: ('audio' | 'video' | 'chat')[];
  availability: {
    isOnline: boolean;
    nextAvailable: string;
    timeSlots: string[];
  };
  rates: {
    audio: number;
    video: number;
    chat: number;
  };
  languages: string[];
  profileImage: string;
  bio: string;
  hospitalAffiliation?: string;
  medicalLicense: string;
  verified: boolean;
  responseTime: string;
}

interface ConsultationRequest {
  doctorId: string;
  patientName: string;
  patientEmail: string;
  consultationType: 'audio' | 'video' | 'chat';
  preferredDateTime: string;
  duration: number;
  healthConcern: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  medicalHistory?: string;
  currentMedications?: string[];
  allergies?: string[];
  pregnancyWeek?: number;
  specialNotes?: string;
}

function formatPrice(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function DoctorCard({ doctor, onBookConsultation }: { doctor: Doctor; onBookConsultation: (doctor: Doctor) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-2xl font-semibold text-teal-800">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </div>
            {doctor.availability.isOnline && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{doctor.name}</CardTitle>
              {doctor.verified && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm text-gray-600">
              {doctor.specialization}
            </CardDescription>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{doctor.rating}</span>
                <span>({doctor.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{doctor.experience} years</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Qualifications</h4>
          <div className="flex flex-wrap gap-1">
            {doctor.qualifications.map((qual, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {qual}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">About</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
        </div>

        {doctor.hospitalAffiliation && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{doctor.hospitalAffiliation}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Languages className="w-4 h-4" />
          <span>{doctor.languages.join(', ')}</span>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Consultation Options</h4>
          <div className="flex gap-2">
            {doctor.consultationTypes.map((type) => {
              const Icon = type === 'video' ? Video : type === 'audio' ? Phone : MessageCircle;
              return (
                <div key={type} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  <Icon className="w-3 h-3" />
                  <span className="capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {doctor.availability.isOnline ? 'Online now' : 'Next available: ' + new Date(doctor.availability.nextAvailable).toLocaleTimeString()}
            </span>
          </div>
          <Button 
            onClick={() => onBookConsultation(doctor)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ConsultationBookingForm({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const [formData, setFormData] = useState<Partial<ConsultationRequest>>({
    doctorId: doctor.id,
    consultationType: doctor.consultationTypes[0],
    duration: 30,
    urgencyLevel: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const bookConsultationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/consultations/book', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Consultation Booked Successfully!",
        description: "You will receive a confirmation email with details. The doctor will contact you at the scheduled time.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Failed to book consultation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.patientEmail || !formData.healthConcern) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    bookConsultationMutation.mutate({
      doctorId: doctor.id,
      consultationType: formData.consultationType,
      duration: formData.duration,
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      healthConcern: formData.healthConcern,
      urgencyLevel: formData.urgencyLevel,
      pregnancyWeek: formData.pregnancyWeek,
      medicalHistory: formData.medicalHistory,
      specialNotes: formData.specialNotes,
      preferredDateTime: formData.preferredDateTime
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book Consultation</h2>
        <p className="text-gray-600">Dr. {doctor.name} - {doctor.specialization}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientName">Full Name *</Label>
            <Input
              id="patientName"
              value={formData.patientName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="patientEmail">Email Address *</Label>
            <Input
              id="patientEmail"
              type="email"
              value={formData.patientEmail || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="consultationType">Consultation Type *</Label>
            <Select 
              value={formData.consultationType} 
              onValueChange={(value: 'audio' | 'video' | 'chat') => 
                setFormData(prev => ({ ...prev, consultationType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctor.consultationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {type === 'video' && <Video className="w-4 h-4" />}
                      {type === 'audio' && <Phone className="w-4 h-4" />}
                      {type === 'chat' && <MessageCircle className="w-4 h-4" />}
                      <span className="capitalize">{type} Consultation</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select 
              value={formData.duration?.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="healthConcern">Health Concern *</Label>
          <Textarea
            id="healthConcern"
            value={formData.healthConcern || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, healthConcern: e.target.value }))}
            placeholder="Describe your health concern or reason for consultation..."
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="urgencyLevel">Urgency Level</Label>
            <Select 
              value={formData.urgencyLevel} 
              onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                setFormData(prev => ({ ...prev, urgencyLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Routine</SelectItem>
                <SelectItem value="medium">Medium - Soon</SelectItem>
                <SelectItem value="high">High - Priority</SelectItem>
                <SelectItem value="urgent">Urgent - Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pregnancyWeek">Pregnancy Week (if applicable)</Label>
            <Input
              id="pregnancyWeek"
              type="number"
              min="1"
              max="42"
              value={formData.pregnancyWeek || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                pregnancyWeek: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Week"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="specialNotes">Additional Notes</Label>
          <Textarea
            id="specialNotes"
            value={formData.specialNotes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
            placeholder="Any additional information you'd like the doctor to know..."
            rows={2}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Consultation Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Doctor:</span>
              <span>Dr. {doctor.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="capitalize">{formData.consultationType}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{formData.duration} minutes</span>
            </div>
            <div className="flex justify-between font-medium text-gray-900">
              <span>Total Cost:</span>
              <span>{formatPrice(doctor.rates[formData.consultationType!] || 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-teal-600 hover:bg-teal-700"
            disabled={bookConsultationMutation.isPending}
          >
            {bookConsultationMutation.isPending ? 'Booking...' : 'Book Consultation'}
          </Button>
        </div>
      </form>
    </div>
  );
}



export default function DoctorEye() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['/api/doctors'],
    refetchInterval: 60000, // Refresh every minute to update availability
  });

  const { data: availableDoctors } = useQuery({
    queryKey: ['/api/doctors/available'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredDoctors = doctors?.filter((doctor: Doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.bio.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleBookConsultation = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleCloseBooking = () => {
    setSelectedDoctor(null);
    setShowBookingModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Doctor's Eye</h1>
            <p className="text-gray-600">Connect with certified maternal health specialists</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{doctors?.length || 0}</h3>
                  <p className="text-gray-600">Verified Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{availableDoctors?.length || 0}</h3>
                  <p className="text-gray-600">Available Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
                  <p className="text-gray-600">Support Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search doctors by name, specialization, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Available Doctors Section */}
        {availableDoctors && availableDoctors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Available Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDoctors.map((doctor: Doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  onBookConsultation={handleBookConsultation}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Doctors */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Doctors ({filteredDoctors.length})
          </h2>
          
          {filteredDoctors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No doctors found matching your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor: Doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  onBookConsultation={handleBookConsultation}
                />
              ))}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedDoctor && (
              <ConsultationBookingForm 
                doctor={selectedDoctor} 
                onClose={handleCloseBooking}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}