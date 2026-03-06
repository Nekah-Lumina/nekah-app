import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, Filter, Star, Clock, MessageCircle, CreditCard, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StripePayment } from '@/components/stripe-payment';
import { ConsultationChat } from '@/components/consultation-chat';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  imageUrl?: string;
  isOnline: boolean;
  consultationRate: number;
}

type ViewState = 'doctors' | 'payment' | 'consultation';

export default function DoctorEyeAdvanced() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<ViewState>('doctors');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(true);

  // Fetch healthcare providers
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['/api/doctors', { online_only: onlineOnly }],
    enabled: currentView === 'doctors'
  });

  // Mock user ID - in real implementation, this would come from authentication
  const userId = 'user-123';
  const userName = 'Expecting Mother';

  const handleDoctorSelect = (doctor: Doctor) => {
    if (!doctor.isOnline) {
      alert('This doctor is currently offline. Please select an online doctor for immediate consultation.');
      return;
    }
    setSelectedDoctor(doctor);
    setCurrentView('payment');
  };

  const handlePaymentSuccess = (newConsultationId: string) => {
    setConsultationId(newConsultationId);
    setCurrentView('consultation');
  };

  const handleBackToDoctors = () => {
    setCurrentView('doctors');
    setSelectedDoctor(null);
  };

  const handleConsultationEnd = () => {
    setCurrentView('doctors');
    setSelectedDoctor(null);
    setConsultationId(null);
  };

  const filteredDoctors = (doctors as Doctor[]).filter((doctor: Doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render current view
  if (currentView === 'consultation' && selectedDoctor && consultationId) {
    return (
      <ConsultationChat
        consultationId={consultationId}
        userId={userId}
        userName={userName}
        doctor={selectedDoctor}
        onEndConsultation={handleConsultationEnd}
      />
    );
  }

  if (currentView === 'payment' && selectedDoctor) {
    return (
      <StripePayment
        doctor={selectedDoctor}
        userId={userId}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={handleBackToDoctors}
      />
    );
  }

  // Main doctors list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/emergency')}
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Doctor's Eye</h2>
        </div>

        {/* Service Header */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Stethoscope className="w-8 h-8 text-primary mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Professional Medical Consultation</h3>
                <p className="text-sm text-gray-600">Connect with certified maternal health specialists</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <span>30-minute session</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                <span>Real-time chat</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CreditCard className="w-4 h-4 mr-2 text-primary" />
                <span>Starting from ₦2,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search doctors by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={onlineOnly ? "default" : "outline"}
                onClick={() => setOnlineOnly(!onlineOnly)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Online Only</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <div className="space-y-4">
          {loadingDoctors ? (
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading healthcare providers...</p>
              </CardContent>
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No doctors found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredDoctors.map((doctor: Doctor) => (
              <Card key={doctor.id} className="card-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                      <AvatarFallback className="text-lg">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₦{doctor.consultationRate.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">per consultation</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{doctor.experience} years exp.</span>
                        </div>
                        <Badge
                          variant={doctor.isOnline ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {doctor.isOnline ? "Available Now" : "Offline"}
                        </Badge>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>Real-time consultation</span>
                        </div>
                        <Button
                          onClick={() => handleDoctorSelect(doctor)}
                          disabled={!doctor.isOnline}
                          className="px-6"
                        >
                          {doctor.isOnline ? 'Book Consultation' : 'Currently Offline'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}