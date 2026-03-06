import { useState, useEffect } from 'react';
import { User, Edit, Bell, Shield, HelpCircle, ChevronRight, Save, X, Calendar, Mail, Phone, Baby, Heart, MessageCircle, ExternalLink, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LocalStorageService } from '@/lib/storage';
import { UserProfile, NotificationSettings, PrivacySettings } from '@/lib/types';
import { ProfilePhotoUploader } from '@/components/profile-photo-uploader';
import nekahLogo from '@assets/image_1754317512268.png';

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [photoUploaderOpen, setPhotoUploaderOpen] = useState(false);
  const { toast } = useToast();

  const handlePhotoUploaded = (photoUrl: string) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, profilePhotoUrl: photoUrl };
      setUserProfile(updatedProfile);
      LocalStorageService.setUserProfile(updatedProfile);
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
    }
  };

  useEffect(() => {
    const profile = LocalStorageService.getUserProfile();
    const notifications = LocalStorageService.getNotificationSettings();
    const privacy = LocalStorageService.getPrivacySettings();
    setUserProfile(profile);
    setNotificationSettings(notifications);
    setPrivacySettings(privacy);
  }, []);

  const calculateDueDate = (pregnancyWeek?: number) => {
    if (!pregnancyWeek) return 'Not specified';
    const today = new Date();
    const weeksRemaining = 40 - pregnancyWeek;
    const dueDate = new Date(today.getTime() + (weeksRemaining * 7 * 24 * 60 * 60 * 1000));
    return dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const profileOptions = [
    {
      icon: Edit,
      label: 'Edit Profile',
      color: 'text-primary',
      action: () => setEditProfileOpen(true)
    },
    {
      icon: Bell,
      label: 'Notifications',
      color: 'text-secondary',
      action: () => setNotificationsOpen(true)
    },
    {
      icon: Shield,
      label: 'Privacy Settings',
      color: 'text-green-500',
      action: () => setPrivacyOpen(true)
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      color: 'text-accent',
      action: () => setHelpOpen(true)
    }
  ];

  return (
    <div className="screen-container">
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src={nekahLogo} 
            alt="NEKAH" 
            className="w-8 h-8"
          />
          <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        </div>
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-rose-gold rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile?.profilePhotoUrl ? (
                  <img 
                    src={userProfile.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Profile photo failed to load:', userProfile.profilePhotoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => console.log('Profile photo loaded successfully:', userProfile.profilePhotoUrl)}
                  />
                ) : (
                  <User className="w-8 h-8" />
                )}
                {!userProfile?.profilePhotoUrl && <User className="w-8 h-8" />}
              </div>
              <button
                onClick={() => setPhotoUploaderOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {userProfile?.name || 'Your Name'}
              </h3>
              <p className="text-white/90">
                {userProfile?.isPregnant && userProfile?.pregnancyWeek 
                  ? `${userProfile.pregnancyWeek} weeks pregnant • Due ${calculateDueDate(userProfile.pregnancyWeek)}`
                  : 'Update your pregnancy details'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {userProfile && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {userProfile.numberOfChildren}
                </div>
                <div className="text-sm text-gray-600">Children</div>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {userProfile.pregnancyWeek || 0}
                </div>
                <div className="text-sm text-gray-600">Weeks</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Options */}
        <div className="space-y-4">
          {profileOptions.map((option, index) => (
            <Card key={index} className="card-shadow">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  onClick={option.action}
                  className="w-full flex items-center justify-between p-0 h-auto"
                >
                  <div className="flex items-center">
                    <option.icon className={`w-5 h-5 ${option.color} mr-4`} />
                    <span className="font-medium text-gray-800">{option.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Contact Info */}
        {userProfile?.emergencyContact && (
          <Card className="card-shadow mt-6">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Emergency Contact</h4>
              <p className="text-gray-600">{userProfile.emergencyContact}</p>
            </CardContent>
          </Card>
        )}

        {/* Hospital Info */}
        {userProfile?.hospitalInfo && (
          <Card className="card-shadow mt-4">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Hospital/Clinic</h4>
              <p className="text-gray-600">{userProfile.hospitalInfo}</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Profile Modal */}
        <EditProfileModal 
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          userProfile={userProfile}
          onSave={(updatedProfile) => {
            LocalStorageService.setUserProfile({ ...updatedProfile, updatedAt: new Date() });
            setUserProfile({ ...updatedProfile, updatedAt: new Date() });
            toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
            setEditProfileOpen(false);
          }}
        />

        {/* Notifications Modal */}
        <NotificationsModal 
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          settings={notificationSettings}
          onSave={(settings) => {
            LocalStorageService.setNotificationSettings(settings);
            setNotificationSettings(settings);
            toast({ title: "Notifications Updated", description: "Your notification preferences have been saved." });
            setNotificationsOpen(false);
          }}
        />

        {/* Privacy Settings Modal */}
        <PrivacyModal 
          open={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
          settings={privacySettings}
          onSave={(settings) => {
            LocalStorageService.setPrivacySettings(settings);
            setPrivacySettings(settings);
            toast({ title: "Privacy Settings Updated", description: "Your privacy preferences have been saved." });
            setPrivacyOpen(false);
          }}
        />

        {/* Profile Photo Uploader */}
        <ProfilePhotoUploader
          isOpen={photoUploaderOpen}
          onClose={() => setPhotoUploaderOpen(false)}
          onPhotoUploaded={handlePhotoUploaded}
          currentPhotoUrl={userProfile?.profilePhotoUrl}
        />

        {/* Help & Support Modal */}
        <HelpSupportModal 
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
        />
      </div>
    </div>
  );
}

// Edit Profile Modal Component
function EditProfileModal({ 
  open, 
  onClose, 
  userProfile, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  userProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (userProfile && open) {
      setFormData(userProfile);
    }
  }, [userProfile, open]);

  const handleSave = () => {
    if (!userProfile || !formData.name || !formData.contact) {
      return;
    }
    onSave({
      ...userProfile,
      ...formData,
      updatedAt: new Date()
    } as UserProfile);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your personal information and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="contact">Phone Number</Label>
            <Input
              id="contact"
              value={formData.contact || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select 
              value={formData.maritalStatus} 
              onValueChange={(value: 'single' | 'married' | 'relationship') => 
                setFormData(prev => ({ ...prev, maritalStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="relationship">In a Relationship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pregnancyWeek">Current Pregnancy Week</Label>
            <Input
              id="pregnancyWeek"
              type="number"
              min="1"
              max="42"
              value={formData.pregnancyWeek || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                pregnancyWeek: e.target.value ? parseInt(e.target.value) : undefined,
                isPregnant: e.target.value ? true : prev.isPregnant
              }))}
              placeholder="Enter current week"
            />
          </div>

          <div>
            <Label htmlFor="numberOfChildren">Number of Children</Label>
            <Input
              id="numberOfChildren"
              type="number"
              min="0"
              value={formData.numberOfChildren || 0}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                numberOfChildren: parseInt(e.target.value) || 0
              }))}
            />
          </div>

          <div>
            <Label htmlFor="hospitalInfo">Hospital Information</Label>
            <Textarea
              id="hospitalInfo"
              value={formData.hospitalInfo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hospitalInfo: e.target.value }))}
              placeholder="Enter your preferred hospital details"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Textarea
              id="emergencyContact"
              value={formData.emergencyContact || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              placeholder="Enter emergency contact details"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Notifications Modal Component  
function NotificationsModal({ 
  open, 
  onClose, 
  settings, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  settings: NotificationSettings | null;
  onSave: (settings: NotificationSettings) => void;
}) {
  const [formData, setFormData] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: false,
    reminderFrequency: 'daily',
    appointmentReminders: true,
    healthTips: true,
    communityUpdates: false
  });

  useEffect(() => {
    if (settings && open) {
      setFormData(settings);
    }
  }, [settings, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Manage how you receive updates and reminders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive alerts on your device</p>
            </div>
            <Switch
              checked={formData.pushNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>

          <div>
            <Label>Reminder Frequency</Label>
            <Select 
              value={formData.reminderFrequency} 
              onValueChange={(value: 'daily' | 'weekly' | 'never') => 
                setFormData(prev => ({ ...prev, reminderFrequency: value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
            </div>
            <Switch
              checked={formData.appointmentReminders}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, appointmentReminders: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Health Tips</Label>
              <p className="text-sm text-gray-600">Receive weekly health tips</p>
            </div>
            <Switch
              checked={formData.healthTips}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, healthTips: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Community Updates</Label>
              <p className="text-sm text-gray-600">Get updates from community posts</p>
            </div>
            <Switch
              checked={formData.communityUpdates}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, communityUpdates: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} className="flex-1 bg-secondary hover:bg-secondary/90">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Privacy Settings Modal Component
function PrivacyModal({ 
  open, 
  onClose, 
  settings, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  settings: PrivacySettings | null;
  onSave: (settings: PrivacySettings) => void;
}) {
  const [formData, setFormData] = useState<PrivacySettings>({
    profileVisibility: 'private',
    shareHealthData: false,
    sharePregnancyJourney: true,
    allowDoctorAccess: true,
    dataAnalytics: false
  });

  useEffect(() => {
    if (settings && open) {
      setFormData(settings);
    }
  }, [settings, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Control how your information is shared and used
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Profile Visibility</Label>
            <Select 
              value={formData.profileVisibility} 
              onValueChange={(value: 'public' | 'private' | 'friends-only') => 
                setFormData(prev => ({ ...prev, profileVisibility: value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends-only">Friends Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Share Health Data</Label>
              <p className="text-sm text-gray-600">Allow anonymized health data sharing for research</p>
            </div>
            <Switch
              checked={formData.shareHealthData}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shareHealthData: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Share Pregnancy Journey</Label>
              <p className="text-sm text-gray-600">Share your journey with the community</p>
            </div>
            <Switch
              checked={formData.sharePregnancyJourney}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sharePregnancyJourney: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Doctor Access</Label>
              <p className="text-sm text-gray-600">Let healthcare providers access your data</p>
            </div>
            <Switch
              checked={formData.allowDoctorAccess}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowDoctorAccess: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Data Analytics</Label>
              <p className="text-sm text-gray-600">Help improve the app with usage analytics</p>
            </div>
            <Switch
              checked={formData.dataAnalytics}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dataAnalytics: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} className="flex-1 bg-green-600 hover:bg-green-700">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Help & Support Modal Component
function HelpSupportModal({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void; 
}) {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat Support',
      description: 'Chat with our support team',
      action: () => window.open('https://help.nekah.app/chat', '_blank')
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email',
      action: () => window.open('mailto:support@nekah.app', '_blank')
    },
    {
      icon: ExternalLink,
      title: 'Help Center',
      description: 'Browse our help articles',
      action: () => window.open('https://help.nekah.app', '_blank')
    },
    {
      icon: Phone,
      title: 'Emergency Hotline',
      description: 'For urgent medical concerns',
      action: () => window.open('tel:+234-800-NEKAH-911')
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Get help and support for your NEKAH experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {supportOptions.map((option, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={option.action}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}

          <Separator />

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">App Information</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Version: 1.2.0</p>
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                <p>Build: Production</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
