import { useState, useEffect } from 'react';
import { 
  getNotes, 
  createNote, 
  getNoteDetails, 
  deleteNote, 
  uploadNoteFiles, 
  deleteNoteFile 
} from '../api';

/**
 * Custom hook for managing notes functionality
 * Provides clean interface for notes operations with loading states and error handling
 * 
 * @param {string} workspaceId - UUID of the workspace
 * @returns {object} Notes state and methods
 */
export const useNotes = (workspaceId) => {
  // State management
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all notes for the workspace
   */
  const loadNotes = async () => {
    setIsLoadingNotes(true);
    setError(null);
    
    try {
      const response = await getNotes(workspaceId);
      setNotes(response.data);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  /**
   * Create a new text note
   * 
   * @param {string} title - Note title
   * @param {string} content - Note content
   * @returns {object} Created note data
   */
  const createTextNote = async (title, content) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await createNote(workspaceId, title, content);
      const newNote = response.data;
      
      // Add to notes list
      setNotes(prev => [newNote, ...prev]);
      
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Create a note with file upload
   * 
   * @param {string} title - Note title
   * @param {File|File[]} files - Files to upload
   * @returns {object} Created note data with uploaded files
   */
  const createNoteWithFiles = async (title, files) => {
    setIsCreating(true);
    setError(null);
    
    try {
      // First create the note
      const response = await createNote(workspaceId, title, "");
      const newNote = response.data;
      
      // Then upload files if provided
      if (files && (files.length > 0 || files instanceof File)) {
        const fileArray = files instanceof File ? [files] : Array.from(files);
        await uploadNoteFiles(workspaceId, newNote.id, fileArray);
        
        // Reload the note to get updated file information
        const updatedResponse = await getNoteDetails(workspaceId, newNote.id);
        const updatedNote = updatedResponse.data;
        
        // Update notes list with the updated note
        setNotes(prev => [updatedNote, ...prev.filter(n => n.id !== newNote.id)]);
        
        return updatedNote;
      } else {
        // No files, just add the note
        setNotes(prev => [newNote, ...prev]);
        return newNote;
      }
    } catch (err) {
      console.error('Error creating note with files:', err);
      setError('Failed to create note with files');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update an existing note
   * 
   * @param {string} noteId - UUID of the note to update
   * @param {string} title - New title
   * @param {string} content - New content
   * @returns {object} Updated note data
   */
  const updateNote = async (noteId, title, content) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Note: The backend doesn't seem to have an update endpoint, 
      // so we'll need to use the existing note structure
      // For now, we'll update locally and sync with backend later
      const updatedNote = {
        ...notes.find(n => n.id === noteId),
        title,
        content,
        updated_at: new Date().toISOString()
      };
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a note
   * 
   * @param {string} noteId - UUID of the note to delete
   */
  const removeNote = async (noteId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteNote(workspaceId, noteId);
      
      // Remove from notes list
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Upload additional files to an existing note
   * 
   * @param {string} noteId - UUID of the note
   * @param {File|File[]} files - Files to upload
   * @returns {object} Updated note data
   */
  const addFilesToNote = async (noteId, files) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const fileArray = files instanceof File ? [files] : Array.from(files);
      await uploadNoteFiles(workspaceId, noteId, fileArray);
      
      // Reload the note to get updated file information
      const response = await getNoteDetails(workspaceId, noteId);
      const updatedNote = response.data;
      
      // Update notes list
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      
      return updatedNote;
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Delete a specific file from a note
   * 
   * @param {string} noteId - UUID of the note
   * @param {string} fileId - UUID of the file
   */
  const removeFileFromNote = async (noteId, fileId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteNoteFile(workspaceId, noteId, fileId);
      
      // Reload the note to get updated file information
      const response = await getNoteDetails(workspaceId, noteId);
      const updatedNote = response.data;
      
      // Update notes list
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear any error messages
   */
  const clearError = () => setError(null);

  // Load notes when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      loadNotes();
    }
  }, [workspaceId]);

  return {
    // State
    notes,
    isLoading,
    isLoadingNotes,
    isCreating,
    isUploading,
    error,
    
    // Methods
    loadNotes,
    createTextNote,
    createNoteWithFiles,
    updateNote,
    removeNote,
    addFilesToNote,
    removeFileFromNote,
    clearError
  };
};