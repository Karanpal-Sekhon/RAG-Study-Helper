import { useState, useEffect } from 'react';
import { 
  getChatSessions, 
  createChatSession, 
  getChatSessionDetails, 
  sendChatMessage,
  deleteChatSession 
} from '../api';

/**
 * Custom hook for managing chat functionality
 * Provides clean interface for chat operations with loading states and error handling
 * 
 * @param {string} workspaceId - UUID of the workspace
 * @returns {object} Chat state and methods
 */
export const useChat = (workspaceId) => {
  // State management
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all chat sessions for the workspace
   */
  const loadSessions = async () => {
    setIsLoadingSessions(true);
    setError(null);
    
    try {
      const response = await getChatSessions(workspaceId);
      setSessions(response.data);
      
      // Auto-select first session if available and no current session
      if (response.data.length > 0 && !currentSession) {
        await selectSession(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
      setError('Failed to load chat sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  /**
   * Create a new chat session
   * 
   * @param {string} title - Optional title for the session
   * @returns {object} Created session data
   */
  const createNewSession = async (title = "New Chat") => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createChatSession(workspaceId, title);
      const newSession = response.data;
      
      // Update sessions list
      setSessions(prev => [newSession, ...prev]);
      
      // Auto-select the new session
      await selectSession(newSession.id);
      
      return newSession;
    } catch (err) {
      console.error('Error creating chat session:', err);
      setError('Failed to create chat session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select and load a specific chat session
   * 
   * @param {string} sessionId - UUID of the session to select
   */
  const selectSession = async (sessionId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getChatSessionDetails(workspaceId, sessionId);
      const sessionData = response.data;
      
      setCurrentSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (err) {
      console.error('Error loading session details:', err);
      setError('Failed to load session details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a message to the current session
   * 
   * @param {string} messageContent - The message to send
   * @returns {object} Response from the API
   */
  const sendMessage = async (messageContent) => {
    if (!currentSession || !messageContent.trim()) {
      throw new Error('No active session or empty message');
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await sendChatMessage(
        workspaceId, 
        currentSession.id, 
        messageContent
      );

      // The API returns both user and agent messages
      const newMessages = response.data.messages || [];
      
      // Update messages state with new messages
      setMessages(prev => [...prev, ...newMessages]);
      
      return response.data;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Delete a chat session
   * 
   * @param {string} sessionId - UUID of the session to delete
   */
  const deleteSession = async (sessionId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteChatSession(workspaceId, sessionId);
      
      // Remove from sessions list
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // Clear current session if it was deleted
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        
        // Auto-select first remaining session
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await selectSession(remainingSessions[0].id);
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear any error messages
   */
  const clearError = () => setError(null);

  // Load sessions when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      loadSessions();
    }
  }, [workspaceId]);

  return {
    // State
    sessions,
    currentSession,
    messages,
    isLoading,
    isLoadingSessions,
    isSending,
    error,
    
    // Methods
    loadSessions,
    createNewSession,
    selectSession,
    sendMessage,
    deleteSession,
    clearError
  };
};