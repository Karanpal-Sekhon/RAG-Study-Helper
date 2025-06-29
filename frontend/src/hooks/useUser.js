import { useState, useEffect } from 'react';
import api from '../api';

/**
 * Custom hook for managing user data and authentication state
 * Provides user information, profile image, and related functionality
 */
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user information from the API
   */
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/user_info');
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError(err.response?.data?.detail || 'Failed to fetch user information');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = () => {
    fetchUser();
  };

  /**
   * Get user initials for avatar fallback
   */
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  /**
   * Get profile image URL or null
   */
  const getProfileImageUrl = () => {
    return user?.profile_image || null;
  };

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
    refreshUser,
    getUserInitials,
    getProfileImageUrl,
  };
};