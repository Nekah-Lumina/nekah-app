import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, Heart, Camera, Sparkles, MessageCircle, AlertTriangle,
  Phone, Shield, Send, Volume2, VolumeX, Plus, Image, Video,
  ThumbsUp, Share, MoreHorizontal, Eye, Play, Pause, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocalStorageService } from '@/lib/storage';
import { MoodEntry, CommunityPost, PostComment } from '@/lib/types';
import { CameraModal } from '@/components/camera-modal';
import { VideoRecorder } from '@/components/video-recorder';
import { useToast } from '@/hooks/use-toast';

const postpartumMoodOptions = [
  { id: 'happy', emoji: '😊', label: 'Happy', bg: 'bg-yellow-100 hover:bg-yellow-200', color: 'text-yellow-600' },
  { id: 'confident', emoji: '💪', label: 'Confident', bg: 'bg-green-100 hover:bg-green-200', color: 'text-green-600' },
  { id: 'tired', emoji: '😴', label: 'Exhausted', bg: 'bg-blue-100 hover:bg-blue-200', color: 'text-blue-600' },
  { id: 'worried', emoji: '😰', label: 'Anxious', bg: 'bg-orange-100 hover:bg-orange-200', color: 'text-orange-600' },
  { id: 'overwhelmed', emoji: '😵‍💫', label: 'Overwhelmed', bg: 'bg-red-100 hover:bg-red-200', color: 'text-red-600' },
  { id: 'isolated', emoji: '😔', label: 'Isolated', bg: 'bg-purple-100 hover:bg-purple-200', color: 'text-purple-600' },
  { id: 'hopeless', emoji: '😞', label: 'Hopeless', bg: 'bg-gray-100 hover:bg-gray-200', color: 'text-gray-600' },
  { id: 'guilty', emoji: '😣', label: 'Guilty', bg: 'bg-pink-100 hover:bg-pink-200', color: 'text-pink-600' },
  { id: 'numb', emoji: '😶', label: 'Numb', bg: 'bg-slate-100 hover:bg-slate-200', color: 'text-slate-600' }
];

const postpartumSupport = {
  hopeless: {
    affirmations: [
      "You are not alone in this darkness. This feeling will pass, and you deserve support.",
      "Your baby needs you alive and well. Reaching out for help is brave, not weak.",
      "These overwhelming feelings are temporary. Professional help can make a real difference."
    ],
    resources: [
      "Call Postpartum Support International: 1-944-4PSI-HLP",
      "Text HOME to 741741 for Crisis Text Line",
      "Contact your healthcare provider immediately",
      "Reach out to a trusted friend or family member today"
    ],
    immediate: "If you're having thoughts of harming yourself or your baby, please call 911 or go to your nearest emergency room immediately."
  },
  isolated: {
    affirmations: [
      "Connection is healing. You deserve to feel supported and understood.",
      "Many moms feel this way - you're not broken, you're human.",
      "Small steps toward connection can make a big difference."
    ],
    resources: [
      "Join local new mom support groups",
      "Connect with other moms in our community",
      "Schedule regular check-ins with friends",
      "Consider online therapy or support groups"
    ]
  },
  guilty: {
    affirmations: [
      "You're doing your best in an incredibly challenging time.",
      "Perfect mothers don't exist - loving, trying mothers do.",
      "Your worth isn't measured by how 'well' you handle motherhood."
    ],
    resources: [
      "Practice self-compassion exercises",
      "Talk to other moms about their struggles",
      "Consider counseling to work through guilt",
      "Remember: asking for help makes you a good mother"
    ]
  },
  overwhelmed: {
    affirmations: [
      "You don't have to do this alone. Support is available and you deserve it.",
      "Breaking tasks into tiny steps can make things feel manageable.",
      "Your feelings are valid and temporary."
    ],
    resources: [
      "Ask specific people for specific help",
      "Create a simple daily routine",
      "Consider hired help if possible",
      "Practice saying 'no' to non-essential tasks"
    ]
  }
};

const riskAssessmentQuestions = [
  { id: 'sleep', question: 'How has your sleep been lately?', options: ['Very poor', 'Poor', 'Fair', 'Good'] },
  { id: 'appetite', question: 'Have you noticed changes in your appetite?', options: ['Much less', 'Less', 'Normal', 'More'] },
  { id: 'bonding', question: 'How do you feel about bonding with your baby?', options: ['Very concerned', 'Somewhat concerned', 'Neutral', 'Going well'] },
  { id: 'guilt', question: 'Do you experience overwhelming guilt about motherhood?', options: ['Always', 'Often', 'Sometimes', 'Rarely'] },
  { id: 'panic', question: 'Have you experienced panic attacks?', options: ['Daily', 'Weekly', 'Rarely', 'Never'] },
  { id: 'harm', question: 'Have you had thoughts of harming yourself or your baby?', options: ['Yes, often', 'Sometimes', 'Rarely', 'Never'] }
];

export default function GlowTalk() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<'mood' | 'assessment' | 'support' | 'create-post' | 'community'>('mood');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [emotionalLevel, setEmotionalLevel] = useState([5]);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high' | 'crisis'>('low');
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{type: 'photo' | 'video', url: string, blob?: Blob} | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load existing community posts
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = () => {
    // Load posts from local storage or use mock data
    const storedPosts = LocalStorageService.getCommunityPosts();
    
    if (storedPosts.length === 0) {
      // Initialize with sample posts if none exist
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          author: {
            id: 'user1',
            name: 'Sarah M.',
            profileImageUrl: '',
            pregnancyWeek: 0,
            isPostpartum: true
          },
          content: "It's been 3 weeks since my baby arrived and I'm struggling with the baby blues. Some days feel so overwhelming. Anyone else going through this? #postpartum #newmom #support",
          mediaUrls: [],
          mediaType: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likes: [
            { id: '1', userId: 'user2', username: 'Emma K.', timestamp: new Date() },
            { id: '2', userId: 'user3', username: 'Lisa R.', timestamp: new Date() }
          ],
          comments: [
            {
              id: '1',
              postId: '1',
              author: { id: 'user2', name: 'Emma K.', profileImageUrl: '' },
              content: "You're not alone mama. The first few weeks are incredibly hard. It does get better! 💕",
              timestamp: new Date(),
              likes: 3
            }
          ],
          isSupport: true,
          tags: ['#postpartum', '#newmom', '#support'],
          privacy: 'community'
        }
      ];
      
      // Save mock posts to storage for future use
      mockPosts.forEach(post => LocalStorageService.addCommunityPost(post));
      setPosts(mockPosts);
    } else {
      setPosts(storedPosts);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    if (['hopeless', 'numb', 'guilty', 'isolated'].includes(moodId)) {
      setCurrentStep('assessment');
    } else {
      setCurrentStep('support');
    }
  };

  const handleAssessmentComplete = () => {
    // Calculate risk level based on answers
    const riskFactors = [];
    if (assessmentAnswers.harm === 'Yes, often' || assessmentAnswers.harm === 'Sometimes') {
      riskFactors.push('high');
    }
    if (assessmentAnswers.panic === 'Daily' || assessmentAnswers.panic === 'Weekly') {
      riskFactors.push('moderate');
    }
    if (assessmentAnswers.sleep === 'Very poor' && assessmentAnswers.appetite === 'Much less') {
      riskFactors.push('moderate');
    }

    const calculatedRisk = riskFactors.includes('high') ? 'crisis' : 
                          riskFactors.includes('moderate') ? 'high' : 
                          riskFactors.length > 0 ? 'moderate' : 'low';
    
    setRiskLevel(calculatedRisk);
    setCurrentStep('support');
  };

  const saveMoodEntry = () => {
    if (!selectedMood) return;

    const entry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood as any,
      timestamp: new Date(),
      emotionalLevel: emotionalLevel[0],
      postpartumIndicators: {
        sleepQuality: assessmentAnswers.sleep === 'Good' ? 'good' : assessmentAnswers.sleep === 'Fair' ? 'fair' : 'poor',
        appetiteChanges: assessmentAnswers.appetite !== 'Normal',
        bondingConcerns: assessmentAnswers.bonding === 'Very concerned' || assessmentAnswers.bonding === 'Somewhat concerned',
        overwhelmingGuilt: assessmentAnswers.guilt === 'Always' || assessmentAnswers.guilt === 'Often',
        socialWithdrawal: selectedMood === 'isolated',
        panicAttacks: assessmentAnswers.panic === 'Daily' || assessmentAnswers.panic === 'Weekly',
        thoughtsOfHarm: assessmentAnswers.harm === 'Yes, often' || assessmentAnswers.harm === 'Sometimes'
      },
      riskAssessment: {
        level: riskLevel,
        immediateAction: riskLevel === 'crisis' ? 'Seek immediate professional help' : undefined,
        resourcesProvided: postpartumSupport[selectedMood as keyof typeof postpartumSupport]?.resources || []
      },
      deeperEmotions: {
        primaryEmotion: selectedMood,
        supportLevel: riskLevel,
        professionalHelpNeeded: riskLevel === 'high' || riskLevel === 'crisis'
      }
    };

    LocalStorageService.addMoodEntry(entry);
  };

  const handleCameraCapture = (imageData: string) => {
    setCapturedMedia({ type: 'photo', url: imageData });
    setShowCamera(false);
  };

  const handleVideoComplete = (videoBlob: Blob) => {
    const videoURL = URL.createObjectURL(videoBlob);
    setCapturedMedia({ type: 'video', url: videoURL, blob: videoBlob });
    setShowVideoRecorder(false);
    toast({
      title: "Video Recorded",
      description: "Your 10-second video message has been recorded successfully",
    });
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !capturedMedia) return;

    const userProfile = LocalStorageService.getUserProfile();
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: {
        id: userProfile?.id || 'current-user',
        name: userProfile?.name || 'You',
        profileImageUrl: '',
        pregnancyWeek: userProfile?.pregnancyWeek,
        isPostpartum: !userProfile?.isPregnant
      },
      content: newPostContent,
      mediaUrls: capturedMedia ? [capturedMedia.url] : [],
      mediaType: capturedMedia?.type || 'text',
      timestamp: new Date(),
      likes: [],
      comments: [],
      isSupport: selectedTags.includes('#support') || selectedTags.includes('#help'),
      tags: selectedTags,
      privacy: 'community'
    };

    // Save to local storage and update state
    LocalStorageService.addCommunityPost(newPost);
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setCapturedMedia(null);
    setSelectedTags([]);
    setCurrentStep('community');
    
    toast({
      title: "Post shared!",
      description: "Your post has been shared with the community."
    });
  };

  const handleLike = (postId: string) => {
    const userProfile = LocalStorageService.getUserProfile();
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.some(like => like.userId === userProfile?.id);
        if (isLiked) {
          return {
            ...post,
            likes: post.likes.filter(like => like.userId !== userProfile?.id)
          };
        } else {
          return {
            ...post,
            likes: [...post.likes, {
              id: Date.now().toString(),
              userId: userProfile?.id || 'current-user',
              username: userProfile?.name || 'You',
              timestamp: new Date()
            }]
          };
        }
      }
      return post;
    }));
  };

  const handleComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    const userProfile = LocalStorageService.getUserProfile();
    const newComment: PostComment = {
      id: Date.now().toString(),
      postId,
      author: {
        id: userProfile?.id || 'current-user',
        name: userProfile?.name || 'You',
        profileImageUrl: ''
      },
      content: text,
      timestamp: new Date(),
      likes: 0
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    setCommentText({...commentText, [postId]: ''});
  };

  const renderMoodSelection = () => (
    <Card className="card-shadow mb-8">
      <CardContent className="p-8 text-center">
        <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Hi Mama, how are you feeling today?
        </h3>
        <p className="text-gray-600 mb-6">
          Your mental health matters. Let's check in and find the support you need.
        </p>
        
        <div className="mood-grid">
          {postpartumMoodOptions.map((mood) => (
            <Button
              key={mood.id}
              variant="outline"
              className={`mood-btn ${mood.bg} rounded-2xl p-4 h-auto transition-all hover:scale-105`}
              onClick={() => handleMoodSelect(mood.id)}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className={`text-sm font-medium ${mood.color}`}>{mood.label}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAssessment = () => (
    <Card className="card-shadow mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Quick wellness check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600">
          These questions help us understand how you're feeling and provide the right support.
        </p>

        <div>
          <Label className="text-base font-medium mb-3 block">
            How intense is this feeling? (1 = mild, 10 = severe)
          </Label>
          <Slider
            value={emotionalLevel}
            onValueChange={setEmotionalLevel}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="text-center mt-2 text-sm text-gray-600">
            Level: {emotionalLevel[0]}/10
          </div>
        </div>

        {riskAssessmentQuestions.map((question) => (
          <div key={question.id}>
            <Label className="text-base font-medium mb-3 block">
              {question.question}
            </Label>
            <Select onValueChange={(value) => setAssessmentAnswers({...assessmentAnswers, [question.id]: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select your answer" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <Button onClick={handleAssessmentComplete} className="w-full">
          Get my support plan
        </Button>
      </CardContent>
    </Card>
  );

  const renderSupport = () => {
    const supportInfo = postpartumSupport[selectedMood as keyof typeof postpartumSupport];
    
    return (
      <div className="space-y-6">
        {riskLevel === 'crisis' && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Immediate Support Needed
                  </h3>
                  <p className="text-red-700 mb-4">
                    {supportInfo?.immediate}
                  </p>
                  <div className="flex gap-4">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call 911
                    </Button>
                    <Button variant="outline" className="border-red-500 text-red-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Crisis Hotline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your personalized support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {supportInfo?.affirmations?.map((affirmation, index) => (
              <div key={index} className="beauty-affirmation-card">
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-lg font-medium flex-1">{affirmation}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(affirmation);
                        speechSynthesis.speak(utterance);
                      }
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-3">Helpful resources for you:</h4>
              <ul className="space-y-2">
                {supportInfo?.resources?.map((resource, index) => (
                  <li key={index} className="text-blue-700 text-sm flex items-center gap-2">
                    <Heart className="w-3 h-3" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Button onClick={() => setCurrentStep('create-post')} className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Share with community for support
              </Button>
              <Button onClick={() => setCurrentStep('community')} variant="outline" className="w-full">
                Browse community posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCreatePost = () => (
    <Card className="card-shadow mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Share with the community
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          placeholder="Share what's on your mind... The community is here to support you. 💕"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="min-h-[120px]"
        />

        <div className="flex gap-4 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowCamera(true)}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowVideoRecorder(true)}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Record 10s Video
          </Button>
        </div>

        {capturedMedia && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              {capturedMedia.type === 'photo' ? 'Photo added' : 'Video added'}
            </p>
            {capturedMedia.type === 'photo' ? (
              <img src={capturedMedia.url} alt="Captured" className="w-32 h-32 object-cover rounded-lg" />
            ) : (
              <video src={capturedMedia.url} className="w-32 h-32 object-cover rounded-lg" controls />
            )}
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block">Add tags (optional)</Label>
          <div className="flex gap-2 flex-wrap">
            {['#postpartum', '#newmom', '#support', '#help', '#babyblues', '#mentalhealth'].map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleCreatePost} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          Share post
        </Button>
      </CardContent>
    </Card>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Community Support</h3>
        <Button onClick={() => setCurrentStep('create-post')}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {posts.map((post) => (
        <Card key={post.id} className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">{post.author.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author.name}</span>
                  {post.author.isPostpartum && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      Postpartum
                    </span>
                  )}
                  {post.isSupport && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Needs Support
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(post.timestamp).toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-gray-800 mb-4">{post.content}</p>

            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="mb-4">
                {post.mediaType === 'photo' ? (
                  <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-w-md rounded-lg" />
                ) : (
                  <video src={post.mediaUrls[0]} className="w-full max-w-md rounded-lg" controls />
                )}
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`${post.likes.some(like => like.userId === LocalStorageService.getUserProfile()?.id) ? 'text-red-500' : ''}`}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {post.likes.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.comments.length}
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>

            {showComments[post.id] && (
              <div className="border-t pt-4 space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-medium">{comment.author.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Reply
                        </Button>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-medium">Y</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a supportive comment..."
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                    />
                    <Button size="sm" onClick={() => handleComment(post.id)}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="screen-container">
      <div className="glow-talk-container">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/home')}
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">GlowTalk</h2>
            <p className="text-sm text-gray-600">Postpartum mental health support & community</p>
          </div>
        </div>

        {currentStep === 'mood' && renderMoodSelection()}
        {currentStep === 'assessment' && renderAssessment()}
        {currentStep === 'support' && renderSupport()}
        {currentStep === 'create-post' && renderCreatePost()}
        {currentStep === 'community' && renderCommunity()}

        {showCamera && (
          <CameraModal
            isOpen={showCamera}
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
          />
        )}

        <VideoRecorder
          isOpen={showVideoRecorder}
          onClose={() => setShowVideoRecorder(false)}
          onVideoComplete={handleVideoComplete}
          maxDuration={10}
        />

        {currentStep === 'support' && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                saveMoodEntry();
                setCurrentStep('community');
              }}
              variant="outline"
            >
              Continue to community
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}