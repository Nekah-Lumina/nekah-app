import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, Hospital, UserRound, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LocalStorageService } from '@/lib/storage';
import { EmergencyContact, NearbyClinic } from '@/lib/types';

// Mock nearby clinics data
const mockNearbyClinics: NearbyClinic[] = [
  {
    id: '1',
    name: 'Lagos University Teaching Hospital',
    address: '1-5 Idi Araba, Surulere, Lagos',
    phone: '+234 901 876 5432',
    distance: 2.3,
    type: 'hospital'
  },
  {
    id: '2',
    name: 'St. Nicholas Hospital',
    address: '57 Campbell Street, Lagos Island',
    phone: '+234 809 123 4567',
    distance: 3.7,
    type: 'hospital'
  },
  {
    id: '3',
    name: 'First Cardiology Consultants',
    address: '7b Ogbara Close, Victoria Island',
    phone: '+234 803 456 7890',
    distance: 5.1,
    type: 'clinic'
  }
];

export default function Emergency() {
  const [, setLocation] = useLocation();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<NearbyClinic[]>([]);
  const [userLocation, setUserLocation] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const contacts = LocalStorageService.getEmergencyContacts();
    setEmergencyContacts(contacts);
  }, []);

  const handleECIS = async () => {
    setIsLocating(true);
    
    try {
      // Request location permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
            setNearbyClinics(mockNearbyClinics);
            setIsLocating(false);
          },
          (error) => {
            console.error('Location error:', error);
            // Still show clinics even if location fails
            setNearbyClinics(mockNearbyClinics);
            setUserLocation('Location unavailable - showing general results');
            setIsLocating(false);
          }
        );
      } else {
        setNearbyClinics(mockNearbyClinics);
        setUserLocation('Geolocation not supported - showing general results');
        setIsLocating(false);
      }
    } catch (error) {
      console.error('ECIS error:', error);
      setIsLocating(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const sendMedicalInfo = (clinicName: string) => {
    alert(`Medical information would be sent to ${clinicName}. This feature connects to your health records and notifies the clinic of your arrival.`);
  };

  return (
    <div className="screen-container">
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Emergency</h2>
        </div>

        {/* Emergency Options */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={handleECIS}
            disabled={isLocating}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl p-6 h-auto text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {isLocating ? 'Locating...' : 'ECIS - Emergency Care'}
                </h3>
                <p className="text-red-100">
                  Find nearest clinics and emergency contacts
                </p>
              </div>
              <Hospital className="w-12 h-12" />
            </div>
          </Button>

          <Button
            onClick={() => setLocation('/doctor-eye-advanced')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-6 h-auto text-left"
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-xl font-bold mb-2">Doctor's Eye - Real-time Consultations</h3>
                <p className="text-blue-100">
                  Connect with certified maternal health specialists - from ₦2,000
                </p>
              </div>
              <UserRound className="w-12 h-12" />
            </div>
          </Button>
        </div>

        {/* Location Info */}
        {userLocation && (
          <Card className="card-shadow mb-6">
            <CardContent className="p-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{userLocation}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby Clinics */}
        {nearbyClinics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Medical Facilities</h3>
            <div className="space-y-4">
              {nearbyClinics.map((clinic) => (
                <Card key={clinic.id} className="card-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{clinic.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{clinic.address}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{clinic.distance} km away</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{clinic.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => handleCall(clinic.phone)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button
                        onClick={() => sendMedicalInfo(clinic.name)}
                        size="sm"
                        variant="outline"
                      >
                        Send Medical Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Emergency Contacts */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Emergency Contacts</h3>
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-gray-600 text-sm">{contact.phone}</p>
                  </div>
                  <Button
                    onClick={() => handleCall(contact.phone)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
