import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search as SearchIcon, ArrowLeft, BookOpen, Play, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Educational content types
interface ContentItem {
  id: number;
  type: 'article' | 'video';
  title: string;
  description: string;
  author: string;
  readTime?: string;
  duration?: string;
  category: string;
  tags: string[];
  thumbnail: string;
}

// Sample educational content for maternal health
const educationalContent: ContentItem[] = [
  {
    id: 1,
    type: 'article',
    title: 'Understanding Pregnancy Nutrition: What Your Body Needs',
    description: 'Essential nutrients for a healthy pregnancy and how to get them through diet.',
    author: 'Dr. Sarah Johnson',
    readTime: '5 min read',
    category: 'Nutrition',
    tags: ['nutrition', 'vitamins', 'healthy eating'],
    thumbnail: '📚'
  },
  {
    id: 2,
    type: 'video',
    title: 'Safe Exercise During Pregnancy - First Trimester',
    description: 'Gentle exercises and movements that are safe during early pregnancy.',
    author: 'Pregnancy Fitness Coach',
    duration: '12 min',
    category: 'Exercise',
    tags: ['exercise', 'first trimester', 'fitness'],
    thumbnail: '🎥'
  },
  {
    id: 3,
    type: 'article',
    title: 'Managing Morning Sickness: Natural Remedies That Work',
    description: 'Evidence-based natural approaches to reduce nausea and vomiting.',
    author: 'Dr. Maria Rodriguez',
    readTime: '7 min read',
    category: 'Symptoms',
    tags: ['morning sickness', 'nausea', 'natural remedies'],
    thumbnail: '📚'
  },
  {
    id: 4,
    type: 'video',
    title: 'Preparing for Labor: Breathing Techniques',
    description: 'Learn effective breathing methods for managing labor pain.',
    author: 'Certified Midwife',
    duration: '15 min',
    category: 'Labor',
    tags: ['labor', 'breathing', 'pain management'],
    thumbnail: '🎥'
  },
  {
    id: 5,
    type: 'article',
    title: 'Baby Development Week by Week: Second Trimester',
    description: 'What to expect as your baby grows during weeks 13-27.',
    author: 'Dr. Jennifer Lee',
    readTime: '10 min read',
    category: 'Development',
    tags: ['baby development', 'second trimester', 'milestones'],
    thumbnail: '📚'
  },
  {
    id: 6,
    type: 'video',
    title: 'Mental Health During Pregnancy: Self-Care Tips',
    description: 'Maintaining emotional wellness throughout your pregnancy journey.',
    author: 'Licensed Therapist',
    duration: '18 min',
    category: 'Mental Health',
    tags: ['mental health', 'self-care', 'emotional wellness'],
    thumbnail: '🎥'
  }
];

const categories = ['All', 'Nutrition', 'Exercise', 'Symptoms', 'Labor', 'Development', 'Mental Health'];

export default function Search() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredContent, setFilteredContent] = useState(educationalContent);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterContent(query, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterContent(searchQuery, category);
  };

  const filterContent = (query: string, category: string) => {
    let filtered = educationalContent;

    // Filter by category
    if (category !== 'All') {
      filtered = filtered.filter(item => item.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredContent(filtered);
  };

  return (
    <div className="screen-container w-full overflow-x-hidden">
      {/* Header - Universal Device Responsive */}
      <div className="gradient-bg px-4 py-4 sm:px-6 sm:py-6 md:py-8 lg:desktop-padding rounded-b-3xl mb-4 sm:mb-6 landscape-adjust">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log('Navigating from search to home');
              setLocation('/home');
            }}
            className="text-white hover:bg-white/20 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Search Articles & Videos</h1>
            <p className="text-white/80 text-sm">Educational content for your pregnancy journey</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mobile-padding px-4 sm:px-6 mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search articles, videos, topics..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 rounded-full border-2 border-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mobile-padding px-4 sm:px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter(category)}
              className={`whitespace-nowrap flex-shrink-0 ${
                selectedCategory === category 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mobile-padding px-4 sm:px-6 mb-4">
        <p className="text-sm text-gray-600">
          {filteredContent.length} {filteredContent.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {/* Content Grid - Universal Device Responsive */}
      <div className="mobile-padding px-4 sm:px-6 md:tablet-padding lg:desktop-padding mb-20 space-y-4">
        {filteredContent.length === 0 ? (
          <div className="text-center py-8">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-500">Try searching with different keywords or browse all categories.</p>
          </div>
        ) : (
          filteredContent.map((item) => (
            <Card key={item.id} className="flo-card cursor-pointer hover:shadow-md transition-shadow touch-target">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">{item.thumbnail}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
                        {item.title}
                      </h3>
                      {item.type === 'video' ? (
                        <Play className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-3">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.type === 'video' ? item.duration : item.readTime}</span>
                      </div>
                      <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}