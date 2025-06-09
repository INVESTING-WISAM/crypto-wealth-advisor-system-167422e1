
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Play, Eye, ThumbsUp, MessageCircle, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import CategoryManager from "./CategoryManager";

interface VideoContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
}

const ContentCreator = ({ currentUser }: { currentUser: string }) => {
  const { isAdmin } = useAdminAccess(currentUser);
  
  const [videos, setVideos] = useState<VideoContent[]>([
    {
      id: '1',
      title: 'Crypto Trading Basics: Getting Started',
      description: 'Learn the fundamentals of cryptocurrency trading, including how to read charts and understand market movements.',
      videoUrl: 'https://example.com/video1',
      thumbnail: '/placeholder.svg',
      category: 'Trading Basics',
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
      category: 'Technical Analysis',
      views: 856,
      likes: 67,
      comments: 15,
      uploadDate: '2024-01-20'
    }
  ]);

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: 'Trading Basics',
    videoFile: null as File | null
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB in bytes
      if (file.size > maxSize) {
        toast.error("Video file must be smaller than 500MB");
        return;
      }

      // Check file type
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid video file (MP4, MOV, AVI, WebM)");
        return;
      }

      setNewVideo({ ...newVideo, videoFile: file });
      toast.success(`Video file selected: ${file.name}`);
    }
  };

  const simulateUpload = (): Promise<string> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
            setIsUploading(false);
            resolve(URL.createObjectURL(newVideo.videoFile!));
          }, 500);
        } else {
          setUploadProgress(progress);
        }
      }, 200);
    });
  };

  const uploadVideo = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can upload videos");
      return;
    }

    if (!newVideo.title || !newVideo.description || !newVideo.videoFile) {
      toast.error("Please fill all fields and select a video file");
      return;
    }

    setIsUploading(true);
    toast.info("Uploading video...");

    try {
      const videoUrl = await simulateUpload();
      
      const video: VideoContent = {
        id: Date.now().toString(),
        title: newVideo.title,
        description: newVideo.description,
        videoUrl: videoUrl,
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
        category: 'Trading Basics',
        videoFile: null
      });

      // Reset file input
      const fileInput = document.getElementById('videoFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast.success("Video uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload video. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Trading Basics': 'bg-blue-100 text-blue-800',
      'Technical Analysis': 'bg-green-100 text-green-800',
      'Trading Strategies': 'bg-purple-100 text-purple-800',
      'Market Analysis': 'bg-orange-100 text-orange-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Admin Badge */}
      {isAdmin && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Administrator Access</span>
              <Badge className="bg-yellow-500 text-white">Admin</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Management - Admin Only */}
      {isAdmin && (
        <CategoryManager currentUser={currentUser} />
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Educational Content</span>
            {!isAdmin && <Badge variant="outline">Admin Only</Badge>}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Share your trading knowledge and help others learn cryptocurrency trading"
              : "Only administrators can upload content. Contact an admin for access."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && (
            <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
              <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Video upload is restricted to administrators</p>
            </div>
          )}

          {isAdmin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoTitle">Video Title</Label>
                  <Input
                    id="videoTitle"
                    placeholder="e.g., How to Trade Bitcoin Safely"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded-md"
                    value={newVideo.category}
                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                    disabled={isUploading}
                  >
                    <option value="Trading Basics">Trading Basics</option>
                    <option value="Technical Analysis">Technical Analysis</option>
                    <option value="Trading Strategies">Trading Strategies</option>
                    <option value="Market Analysis">Market Analysis</option>
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
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label htmlFor="videoFile">Upload Video</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="videoFile"
                    accept="video/mp4,video/mov,video/avi,video/webm"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="videoFile" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                    <Video className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload video or drag and drop</p>
                    <p className="text-sm text-gray-500">MP4, MOV, AVI, WebM (max 500MB)</p>
                  </label>
                  {newVideo.videoFile && (
                    <p className="mt-2 text-green-600">Selected: {newVideo.videoFile.name}</p>
                  )}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={uploadVideo} className="w-full" disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </>
          )}
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
                    {video.category}
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
