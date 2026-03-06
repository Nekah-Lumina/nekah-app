import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Send, Phone, Video, Paperclip, Clock, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'doctor';
  content: string;
  timestamp: Date;
  delivered: boolean;
  read: boolean;
}

interface ConsultationChatProps {
  consultationId: string;
  userId: string;
  userName: string;
  doctor: Doctor;
  onEndConsultation: () => void;
}

export function ConsultationChat({
  consultationId,
  userId,
  userName,
  doctor,
  onEndConsultation
}: ConsultationChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [doctorOnline, setDoctorOnline] = useState(doctor.isOnline);
  const [consultationStatus, setConsultationStatus] = useState<'connecting' | 'active' | 'ended'>('connecting');
  const [sessionTime, setSessionTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('/', {
      query: {
        consultationId,
        userId,
        userType: 'patient'
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConsultationStatus('active');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('doctorJoined', () => {
      setDoctorOnline(true);
      setConsultationStatus('active');
      
      // Add system message
      const systemMessage: Message = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        senderType: 'doctor',
        content: `Dr. ${doctor.name} has joined the consultation.`,
        timestamp: new Date(),
        delivered: true,
        read: true
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('doctorLeft', () => {
      setDoctorOnline(false);
      setConsultationStatus('ended');
    });

    newSocket.on('consultationEnded', () => {
      setConsultationStatus('ended');
    });

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => {
      newSocket.disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [consultationId, userId, doctor.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || consultationStatus === 'ended') return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      senderType: 'user',
      content: newMessage.trim(),
      timestamp: new Date(),
      delivered: false,
      read: false
    };

    socket.emit('sendMessage', {
      consultationId,
      message
    });

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endConsultation = () => {
    if (socket) {
      socket.emit('endConsultation', { consultationId });
    }
    onEndConsultation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
      
      {/* Header */}
      <Card className="rounded-none border-b shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={endConsultation}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                <AvatarFallback>
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={doctorOnline ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {doctorOnline ? "Online" : "Offline"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {doctor.specialization}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatTime(sessionTime)}</span>
              </div>
              <Badge
                variant={consultationStatus === 'active' ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {consultationStatus === 'connecting' ? 'Connecting...' : 
                 consultationStatus === 'active' ? 'Active Session' : 'Session Ended'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4 pb-4">
            
            {/* Welcome Message */}
            <div className="text-center py-4">
              <Card className="inline-block bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-sm">
                  <p className="text-blue-800 font-medium">Consultation Started</p>
                  <p className="text-blue-600 mt-1">
                    Welcome to your consultation with Dr. {doctor.name}. 
                    Feel free to ask any questions about your pregnancy health.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderType === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.senderType === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.senderId === 'system'
                      ? 'bg-muted text-muted-foreground text-center italic'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  {message.senderType === 'doctor' && message.senderId !== 'system' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Dr. {doctor.name}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm">{message.content}</p>
                  
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.senderType === 'user' && message.delivered && (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={consultationStatus === 'ended'}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                consultationStatus === 'ended' 
                  ? 'Consultation has ended'
                  : doctorOnline 
                  ? 'Type your message...'
                  : 'Waiting for doctor to join...'
              }
              disabled={consultationStatus === 'ended' || !isConnected}
              className="flex-1"
            />
            
            <Button
              type="submit"
              disabled={!newMessage.trim() || consultationStatus === 'ended' || !isConnected}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-2 text-center">
              <Badge variant="destructive" className="text-xs">
                Reconnecting...
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* End Consultation Button */}
      {consultationStatus === 'active' && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <Button
            onClick={endConsultation}
            variant="destructive"
            className="w-full"
          >
            End Consultation
          </Button>
        </div>
      )}
    </div>
  );
}