import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Send, MoreHorizontal, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LocalStorageService } from '@/lib/storage';
import { CommunityPost, PostComment } from '@/lib/types';
import { FacebookReactions } from '@/components/facebook-reactions';
import nekahLogo from '@assets/image_1754317512268.png';

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load community posts from storage
    const storedPosts = LocalStorageService.getCommunityPosts();
    setPosts(storedPosts);
  }, []);

  const formatTimestamp = (timestamp: Date | string | number) => {
    const now = new Date();
    const timeDate = typeof timestamp === 'string' || typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    
    // Check if the date is valid
    if (!timeDate || isNaN(timeDate.getTime())) {
      return 'Just now';
    }
    
    const diff = now.getTime() - timeDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleReaction = (postId: string, reactionType: string) => {
    const userProfile = LocalStorageService.getUserProfile();
    const userId = userProfile?.id || 'current-user';
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentReactions = post.reactions || {};
        const userReaction = post.userReaction;
        
        // Remove previous reaction if exists
        if (userReaction && currentReactions[userReaction]) {
          currentReactions[userReaction] = Math.max(0, currentReactions[userReaction] - 1);
          if (currentReactions[userReaction] === 0) {
            delete currentReactions[userReaction];
          }
        }
        
        let newUserReaction = reactionType;
        
        // If same reaction, remove it (toggle off)
        if (userReaction === reactionType) {
          newUserReaction = '';
        } else {
          // Add new reaction
          currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1;
        }
        
        return {
          ...post,
          reactions: currentReactions,
          userReaction: newUserReaction || undefined
        };
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

  return (
    <div className="screen-container">
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={nekahLogo} 
              alt="NEKAH" 
              className="w-8 h-8"
            />
            <h2 className="text-2xl font-bold text-gray-800">Community</h2>
          </div>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="bg-primary text-white rounded-full p-3 glow-effect"
            size="icon"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤱</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to the Community!
            </h3>
            <p className="text-gray-600 mb-6">
              Connect with other mothers on their journey. Share experiences, ask questions, and support each other.
            </p>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Share Your First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {post.author.name}
                        {post.author.pregnancyWeek && `, ${post.author.pregnancyWeek} weeks`}
                        {post.author.isPostpartum && ', Postpartum'}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {formatTimestamp(post.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <img
                      src={post.mediaUrls[0]}
                      alt="Community post"
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                  )}
                  
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  
                  <div className="flex items-center gap-4 border-t pt-4 mt-4">
                    <FacebookReactions
                      reactions={post.reactions || {}}
                      userReaction={post.userReaction}
                      onReact={(reactionType) => handleReaction(post.id, reactionType)}
                      size="sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments?.length || 0} Comment{(post.comments?.length || 0) !== 1 ? 's' : ''}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-primary">
                      <Share className="w-4 h-4" />
                      Share
                    </Button>
                  </div>

                  {showComments[post.id] && (
                    <div className="border-t pt-4 mt-4 space-y-4">
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
                                <Heart className="w-3 h-3 mr-1" />
                                {comment.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs">
                                Reply
                              </Button>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(comment.timestamp)}
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
        )}

        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Share with the Community
                </h3>
                <textarea
                  placeholder="What's on your mind, Mama?"
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none h-32 focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreatePost(false);
                      // In a real app, this would save the post
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
