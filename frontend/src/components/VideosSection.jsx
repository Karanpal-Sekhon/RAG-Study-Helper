import { useState } from "react";
import { Plus, Video, Play, Edit, Trash2, Upload, File, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVideos } from "@/hooks/useVideos";

/**
 * VideosSection Component
 * 
 * Provides a comprehensive video management interface with file uploads and transcriptions.
 * Features real-time CRUD operations, file upload/management, and beautiful UI.
 * 
 * @param {object} props
 * @param {string} props.workspaceId - UUID of the workspace
 */
const VideosSection = ({ workspaceId }) => {
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");

  // Use our custom videos hook for all video functionality
  const {
    videos,
    isLoading,
    isLoadingVideos,
    isCreating,
    isUploading,
    error,
    createTextVideo,
    createVideoWithFiles,
    removeVideo,
    addFilesToVideo,
    removeFileFromVideo,
    clearError
  } = useVideos(workspaceId);

  /**
   * Handle creating a new video with files
   */
  const handleUploadFiles = async () => {
    if (!selectedFiles.length || !videoTitle.trim()) return;

    try {
      await createVideoWithFiles(videoTitle, selectedFiles);
      resetForm();
    } catch (err) {
      // Error handled by hook
    }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    
    // Auto-fill title if not set and only one file
    if (!videoTitle && files.length === 1) {
      const fileName = files[0].name;
      setVideoTitle(fileName.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  /**
   * Handle deleting a video
   */
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      try {
        await removeVideo(videoId);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    setVideoTitle("");
    setSelectedFiles([]);
    setIsDialogOpen(false);
  };

  /**
   * Format timestamp for display
   */
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Get file type icon and color
   */
  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
      return <Video className="h-5 w-5 text-blue-500" />;
    }
    
    const ext = fileName.toLowerCase();
    if (ext.includes('.mp4') || ext.includes('.avi') || ext.includes('.mov') || ext.includes('.mkv')) {
      return <Play className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  /**
   * Handle opening/downloading a file
   */
  const handleOpenFile = (fileUrl, fileName) => {
    if (!fileUrl) {
      console.error('No file URL provided');
      return;
    }
    
    // Create a link and click it to download/view the file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state while videos are being loaded
  if (isLoadingVideos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-2 h-auto p-1 text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Videos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-title">Title</Label>
                <Input
                  id="video-title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="video-upload">Upload Video Files</Label>
                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedFiles.length > 0 
                      ? `${selectedFiles.length} file(s) selected: ${selectedFiles.map(f => f.name).join(', ')}`
                      : "Click to upload or drag and drop your video files"
                    }
                  </p>
                  <Input
                    id="video-upload"
                    type="file"
                    multiple
                    accept=".mp4,.avi,.mov,.mkv,.wmv,.flv,.webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    Choose Video Files
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleUploadFiles} 
                className="w-full"
                disabled={isCreating || !selectedFiles.length || !videoTitle.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Videos"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {video.files && video.files.length > 0 && video.files[0]?.name ? (
                      getFileIcon(video.files[0].name)
                    ) : (
                      <Video className="h-5 w-5 text-blue-500" />
                    )}
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {video.files && video.files.length > 0 ? (
                  // Video with files
                  <>
                    <div className="space-y-2 mb-3">
                      {video.files.map((file, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 font-medium">{file?.name || 'Unnamed Video'}</p>
                          <Button
                            size="sm"
                            onClick={() => handleOpenFile(file?.url, file?.name || 'video')}
                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={!file?.url}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Play Video
                          </Button>
                        </div>
                      ))}
                    </div>
                    {video.transcription && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-xs text-gray-500 mb-1">Transcription Preview:</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{video.transcription}</p>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <File className="h-3 w-3" />
                      <span>Created {formatDate(video.created_at)}</span>
                    </div>
                  </>
                ) : (
                  // Video without files (placeholder)
                  <>
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No video files uploaded yet</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Video className="h-3 w-3" />
                      <span>Created {formatDate(video.created_at)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
          <p className="text-gray-500 mb-4">Upload your first video to get started with AI-powered transcriptions!</p>
        </div>
      )}
    </div>
  );
};

export default VideosSection;