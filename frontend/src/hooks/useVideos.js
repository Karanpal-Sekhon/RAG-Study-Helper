import { useState, useEffect } from 'react';
import { 
  getVideos, 
  createVideo, 
  deleteVideo, 
  uploadVideoFiles,
  deleteVideoFile 
} from '@/api';

/**
 * Custom hook for video management with full CRUD operations
 * @param {string} workspaceId - UUID of the workspace
 * @returns {object} - Videos state and management functions
 */
export const useVideos = (workspaceId) => {
  // State management
  const [videos, setVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load videos when workspace changes
  useEffect(() => {
    if (workspaceId) {
      loadVideos();
    }
  }, [workspaceId]);

  /**
   * Load all videos for the workspace
   */
  const loadVideos = async () => {
    if (!workspaceId) return;
    
    try {
      setIsLoadingVideos(true);
      setError(null);
      const response = await getVideos(workspaceId);
      setVideos(response.data || []);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please try again.');
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  /**
   * Create a new video with title only
   * @param {string} title - Video title
   * @returns {Promise<object>} - Created video object
   */
  const createTextVideo = async (title) => {
    if (!workspaceId || !title) return null;
    
    try {
      setIsCreating(true);
      setError(null);
      const response = await createVideo(workspaceId, title);
      const newVideo = response.data;
      
      // Add to local state
      setVideos(prev => [newVideo, ...prev]);
      return newVideo;
    } catch (err) {
      console.error('Error creating video:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to create video. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Create a video with file uploads
   * @param {string} title - Video title
   * @param {FileList|File[]} files - Video files to upload
   * @returns {Promise<object>} - Created video object
   */
  const createVideoWithFiles = async (title, files) => {
    if (!workspaceId || !title || !files?.length) return null;
    
    try {
      setIsCreating(true);
      setError(null);
      
      // First create the video
      const videoResponse = await createVideo(workspaceId, title);
      const newVideo = videoResponse.data;
      
      // Then upload files to it
      const uploadResponse = await uploadVideoFiles(workspaceId, newVideo.id, files);
      
      // Update video with file information
      const updatedVideo = {
        ...newVideo,
        files: uploadResponse.data.files || []
      };
      
      // Add to local state
      setVideos(prev => [updatedVideo, ...prev]);
      return updatedVideo;
    } catch (err) {
      console.error('Error creating video with files:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to create video with files. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Add files to an existing video
   * @param {string} videoId - UUID of the video
   * @param {FileList|File[]} files - Files to add
   * @returns {Promise<object>} - Updated video object
   */
  const addFilesToVideo = async (videoId, files) => {
    if (!workspaceId || !videoId || !files?.length) return null;
    
    try {
      setIsUploading(true);
      setError(null);
      
      const response = await uploadVideoFiles(workspaceId, videoId, files);
      
      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, files: [...(video.files || []), ...(response.data.files || [])] }
          : video
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error adding files to video:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to add files to video. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove a video
   * @param {string} videoId - UUID of the video to remove
   */
  const removeVideo = async (videoId) => {
    if (!workspaceId || !videoId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteVideo(workspaceId, videoId);
      
      // Remove from local state
      setVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (err) {
      console.error('Error deleting video:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to delete video. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a file from a video
   * @param {string} videoId - UUID of the video
   * @param {string} fileId - UUID of the file to remove
   */
  const removeFileFromVideo = async (videoId, fileId) => {
    if (!workspaceId || !videoId || !fileId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await deleteVideoFile(workspaceId, videoId, fileId);
      
      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, files: video.files?.filter(file => file.id !== fileId) || [] }
          : video
      ));
    } catch (err) {
      console.error('Error deleting video file:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to delete video file. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Refresh videos from server
   */
  const refreshVideos = () => {
    loadVideos();
  };

  return {
    // State
    videos,
    isLoadingVideos,
    isCreating,
    isUploading,
    isLoading,
    error,
    
    // Actions
    createTextVideo,
    createVideoWithFiles,
    addFilesToVideo,
    removeVideo,
    removeFileFromVideo,
    clearError,
    refreshVideos
  };
};