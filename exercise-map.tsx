import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import '../types/google-maps.d.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Play, 
  Pause, 
  Square, 
  Timer, 
  Activity, 
  Route,
  Target,
  Zap
} from 'lucide-react';

interface ExerciseSession {
  id: string;
  type: 'walking' | 'prenatal-yoga' | 'swimming' | 'stretching';
  duration: number;
  distance?: number;
  calories?: number;
  path: google.maps.LatLng[];
  startTime: Date;
  endTime?: Date;
}

interface ExerciseMapProps {
  challengeId: string;
  exerciseType: 'walking' | 'prenatal-yoga' | 'swimming' | 'stretching';
  onComplete: (session: ExerciseSession) => void;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">Loading Google Maps...</p>
      </div>;
    case Status.FAILURE:
      return <div className="bg-red-50 border border-red-200 rounded-lg h-64 flex items-center justify-center">
        <p className="text-red-600">Error loading maps. Please check your connection.</p>
      </div>;
    default:
      return <div className="bg-gray-100 rounded-lg h-64" />;
  }
};

function ExerciseMapComponent({ 
  challengeId, 
  exerciseType, 
  onComplete 
}: ExerciseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<Partial<ExerciseSession> | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [path, setPath] = useState<google.maps.LatLng[]>([]);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (mapRef.current && !map) {
      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(location);

          const newMap = new google.maps.Map(mapRef.current!, {
            center: location,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          // Add user location marker
          const userMarker = new google.maps.Marker({
            position: location,
            map: newMap,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#FF6B9D',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8
            }
          });

          setMap(newMap);
          setMarker(userMarker);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to a general location if geolocation fails
          const defaultLocation = new google.maps.LatLng(40.7128, -74.0060);
          setUserLocation(defaultLocation);

          const newMap = new google.maps.Map(mapRef.current!, {
            center: defaultLocation,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });
          setMap(newMap);
        }
      );
    }
  }, [mapRef, map]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        
        // Simulate GPS tracking for demo purposes
        if (userLocation && Math.random() > 0.3) {
          const newLat = userLocation.lat() + (Math.random() - 0.5) * 0.0001;
          const newLng = userLocation.lng() + (Math.random() - 0.5) * 0.0001;
          const newLocation = new google.maps.LatLng(newLat, newLng);
          
          setPath(prevPath => {
            const newPath = [...prevPath, newLocation];
            
            // Calculate distance
            if (newPath.length > 1) {
              const lastPoint = newPath[newPath.length - 2];
              const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
                lastPoint,
                newLocation
              );
              setDistance(prev => prev + segmentDistance);
            }
            
            return newPath;
          });
          
          setUserLocation(newLocation);
          
          // Update marker position
          if (marker) {
            marker.setPosition(newLocation);
          }
          
          // Update map center
          if (map) {
            map.setCenter(newLocation);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, isPaused, userLocation, marker, map]);

  useEffect(() => {
    if (map && path.length > 1) {
      // Remove existing polyline
      if (polyline) {
        polyline.setMap(null);
      }
      
      // Create new polyline
      const newPolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF6B9D',
        strokeOpacity: 1.0,
        strokeWeight: 4
      });
      
      newPolyline.setMap(map);
      setPolyline(newPolyline);
    }
  }, [map, path]);

  const startTracking = () => {
    if (!userLocation) return;
    
    setIsTracking(true);
    setIsPaused(false);
    setCurrentSession({
      id: `session_${Date.now()}`,
      type: exerciseType,
      startTime: new Date(),
      path: [userLocation]
    });
    setPath([userLocation]);
    setDuration(0);
    setDistance(0);
  };

  const pauseTracking = () => {
    setIsPaused(true);
  };

  const resumeTracking = () => {
    setIsPaused(false);
  };

  const stopTracking = () => {
    if (!currentSession) return;
    
    setIsTracking(false);
    setIsPaused(false);
    
    const completedSession: ExerciseSession = {
      ...currentSession,
      endTime: new Date(),
      duration,
      distance: Math.round(distance),
      calories: Math.round((duration / 60) * getCaloriesPerMinute(exerciseType)),
      path
    } as ExerciseSession;
    
    onComplete(completedSession);
    setCurrentSession(null);
  };

  const getCaloriesPerMinute = (type: string): number => {
    switch (type) {
      case 'walking': return 4;
      case 'prenatal-yoga': return 3;
      case 'swimming': return 6;
      case 'stretching': return 2;
      default: return 3;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {exerciseType.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')} Tracker
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative rounded-lg overflow-hidden">
          <div ref={mapRef} className="w-full h-64" />
          
          {/* Tracking Overlay */}
          {isTracking && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-bold text-primary">{formatDuration(duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="font-bold text-blue-600">{formatDistance(distance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Calories</p>
                    <p className="font-bold text-green-600">
                      {Math.round((duration / 60) * getCaloriesPerMinute(exerciseType))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isTracking ? (
            <Button
              onClick={startTracking}
              disabled={!userLocation}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Exercise
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button
                  onClick={pauseTracking}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeTracking}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button
                onClick={stopTracking}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Finish
              </Button>
            </>
          )}
        </div>

        {/* Exercise Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <Target className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Target: 30 min</p>
            <p className="font-semibold text-purple-700">
              {duration >= 1800 ? '✅ Completed' : `${Math.round((duration / 1800) * 100)}%`}
            </p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
            <Zap className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Intensity</p>
            <p className="font-semibold text-orange-700">
              {exerciseType === 'walking' ? 'Moderate' : 
               exerciseType === 'swimming' ? 'High' : 'Low'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExerciseMap(props: ExerciseMapProps) {
  // Use a demo key for development - in production, this should be from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key';
  
  if (apiKey === 'demo-key') {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
            <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">GPS Exercise Tracking</h3>
            <p className="text-gray-600 text-sm mb-4">
              Real-time location tracking with Google Maps integration for your workout sessions.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live GPS tracking</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Route visualization</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Performance metrics</span>
              </div>
            </div>
            <Button 
              onClick={() => {
                // Simulate exercise completion for demo
                const session = {
                  id: `demo_${Date.now()}`,
                  type: props.exerciseType,
                  duration: 1800, // 30 minutes
                  distance: 2500, // 2.5km
                  calories: 120,
                  path: [],
                  startTime: new Date(Date.now() - 1800000),
                  endTime: new Date()
                } as any;
                props.onComplete(session);
              }}
              className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              Start Exercise Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={['geometry']}>
      <ExerciseMapComponent {...props} />
    </Wrapper>
  );
}