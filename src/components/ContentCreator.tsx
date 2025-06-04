
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Play, Eye, ThumbsUp, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface VideoContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  category: 'basics' | 'technical' | 'strategies' | 'market-analysis';
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
}

const ContentCreator = ({ currentUser }: { currentUser: string }) => {
  const [videos, setVideos] = useState<VideoContent[]>([
    {
      id: '1',
      title: 'Crypto Trading Basics: Getting Started',
      description: 'Learn the fundamentals of cryptocurrency trading, including how to read charts and understand market movements.',
      videoUrl: 'https://example.com/video1',
      thumbnail: '/placeholder.svg',
      category: 'basics',
      views: 1250,
      likes: 89,
      comments: 23,
      uploadDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Technical Analysis: RSI and MACD Indicators',
      description: 'Master the most important technical indicators for successful crypto trading.',
      videoUrl: 'https://example.com/video2',
      thumbnail: '/placeholder.svg',
      category: 'technical',
      views: 856,
      likes: 67,
      comments: 15,
      uploadDate: '2024-01-20'
    }
  ]);

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: 'basics' as 'basics' | 'technical' | 'strategies' | 'market-analysis',
    videoFile: null as File | null
  });

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVideo({ ...newVideo, videoFile: file });
      toast.success("Video file selected");
    }
  };

  const uploadVideo = () => {
    if (!newVideo.title || !newVideo.description || !newVideo.videoFile) {
      toast.error("Please fill all fields and select a video file");
      return;
    }

    const video: VideoContent = {
      id: Date.now().toString(),
      title: newVideo.title,
      description: newVideo.description,
      videoUrl: URL.createObjectURL(newVideo.videoFile),
      thumbnail: '/placeholder.svg',
      category: newVideo.category,
      views: 0,
      likes: 0,
      comments: 0,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setVideos([video, ...videos]);
    setNewVideo({
      title: '',
      description: '',
      category: 'basics',
      videoFile: null
    });

    toast.success("Video uploaded successfully!");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-green-100 text-green-800';
      case 'strategies': return 'bg-purple-100 text-purple-800';
      case 'market-analysis': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'basics': return 'Trading Basics';
      case 'technical': return 'Technical Analysis';
      case 'strategies': return 'Trading Strategies';
      case 'market-analysis': return 'Market Analysis';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Educational Content</span>
          </CardTitle>
          <CardDescription>
            Share your trading knowledge and help others learn cryptocurrency trading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="videoTitle">Video Title</Label>
              <Input
                id="videoTitle"
                placeholder="e.g., How to Trade Bitcoin Safely"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full p-2 border rounded-md"
                value={newVideo.category}
                onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value as any })}
              >
                <option value="basics">Trading Basics</option>
                <option value="technical">Technical Analysis</option>
                <option value="strategies">Trading Strategies</option>
                <option value="market-analysis">Market Analysis</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what viewers will learn from this video..."
              value={newVideo.description}
              onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="videoFile">Upload Video</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <label htmlFor="videoFile" className="cursor-pointer">
                <Video className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Click to upload video or drag and drop</p>
                <p className="text-sm text-gray-500">MP4, MOV, AVI (max 500MB)</p>
              </label>
              {newVideo.videoFile && (
                <p className="mt-2 text-green-600">Selected: {newVideo.videoFile.name}</p>
              )}
            </div>
          </div>

          <Button onClick={uploadVideo} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </CardContent>
      </Card>

      {/* Video Library */}
      <Card>
        <CardHeader>
          <CardTitle>Educational Video Library</CardTitle>
          <CardDescription>Browse and learn from trading educational content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                    <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </div>
                  <Badge className={`absolute top-2 left-2 ${getCategoryColor(video.category)}`}>
                    {getCategoryLabel(video.category)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {video.views}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {video.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {video.comments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-8">
              <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No videos uploaded yet. Start sharing your trading knowledge!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentCreator;
