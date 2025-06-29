// Here we write the interceptor (axios interceptor)
// Every time we send a request, will check if we have an access token, if we do, auto add to the request
/*
Will intercept any requests that we will send, and will auto add the correct headers
So that we do not have to manually add the headers each time we send a request
*/

import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})


api.interceptors.request.use(
    (config) => {
        // look in local storage, check if we have an access token, if we do, add to request header
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.log(error)
        return Promise.reject(error)
    }
)

// Chat API Functions

/**
 * Get all chat sessions for a workspace
 * @param {string} workspaceId - UUID of the workspace
 * @returns {Promise} - Response with chat sessions
 */
export const getChatSessions = (workspaceId) => {
    return api.get(`api/workspace/${workspaceId}/chat/sessions/`);
};

/**
 * Create a new chat session
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} title - Session title (optional)
 * @returns {Promise} - Response with created session
 */
export const createChatSession = (workspaceId, title = "New Chat") => {
    return api.post(`api/workspace/${workspaceId}/chat/sessions/`, { title });
};

/**
 * Get details of a chat session with messages
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} sessionId - UUID of the chat session
 * @returns {Promise} - Response with session details and messages
 */
export const getChatSessionDetails = (workspaceId, sessionId) => {
    return api.get(`api/workspace/${workspaceId}/chat/session/${sessionId}/`);
};

/**
 * Update a chat session (e.g., change title)
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} sessionId - UUID of the chat session
 * @param {string} title - New title for the session
 * @returns {Promise} - Response with updated session
 */
export const updateChatSession = (workspaceId, sessionId, title) => {
    return api.put(`api/workspace/${workspaceId}/chat/session/${sessionId}/`, { title });
};

/**
 * Delete a chat session
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} sessionId - UUID of the chat session
 * @returns {Promise} - Response from deletion
 */
export const deleteChatSession = (workspaceId, sessionId) => {
    return api.delete(`api/workspace/${workspaceId}/chat/session/${sessionId}/`);
};

/**
 * Send a message to the multi-agent system and get response
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} sessionId - UUID of the chat session
 * @param {string} message - Message content to send
 * @returns {Promise} - Response with user and agent messages
 */
export const sendChatMessage = (workspaceId, sessionId, message) => {
    return api.post(`api/workspace/${workspaceId}/chat/session/${sessionId}/message/`, 
        { message }
    );
};

// Notes API Functions

/**
 * Get all notes for a workspace
 * @param {string} workspaceId - UUID of the workspace
 * @returns {Promise} - Response with notes list
 */
export const getNotes = (workspaceId) => {
    return api.get(`api/workspace/${workspaceId}/notes`);
};

/**
 * Create a new note
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} title - Note title
 * @param {string} content - Note content (optional for file-only notes)
 * @returns {Promise} - Response with created note
 */
export const createNote = (workspaceId, title, content = "") => {
    return api.post(`api/workspace/${workspaceId}/create_note`, { 
        title, 
        content 
    });
};

/**
 * Get details of a specific note
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} noteId - UUID of the note
 * @returns {Promise} - Response with note details
 */
export const getNoteDetails = (workspaceId, noteId) => {
    return api.get(`api/workspace/${workspaceId}/note/${noteId}`);
};

/**
 * Delete a note
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} noteId - UUID of the note
 * @returns {Promise} - Response from deletion
 */
export const deleteNote = (workspaceId, noteId) => {
    return api.delete(`api/workspace/${workspaceId}/note/${noteId}`);
};

/**
 * Upload file(s) to a note
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} noteId - UUID of the note
 * @param {FileList|File[]} files - Files to upload
 * @returns {Promise} - Response from file upload
 */
export const uploadNoteFiles = (workspaceId, noteId, files) => {
    const formData = new FormData();
    
    // Handle both FileList and array of files
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
        formData.append('files', file);
    });
    
    return api.post(`api/workspace/${workspaceId}/note/${noteId}/upload_file`, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data' 
        }
    });
};

/**
 * Delete a specific file from a note
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} noteId - UUID of the note
 * @param {string} fileId - UUID of the file
 * @returns {Promise} - Response from file deletion
 */
export const deleteNoteFile = (workspaceId, noteId, fileId) => {
    return api.delete(`api/workspace/${workspaceId}/note/${noteId}/file/${fileId}/delete`);
};

// Videos API Functions

/**
 * Get all videos for a workspace
 * @param {string} workspaceId - UUID of the workspace
 * @returns {Promise} - Response with videos list
 */
export const getVideos = (workspaceId) => {
    return api.get(`api/workspace/${workspaceId}/videos`);
};

/**
 * Create a new video
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} title - Video title
 * @returns {Promise} - Response with created video
 */
export const createVideo = (workspaceId, title) => {
    return api.post(`api/workspace/${workspaceId}/create_video`, { 
        title 
    });
};

/**
 * Get details of a specific video
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} videoId - UUID of the video
 * @returns {Promise} - Response with video details
 */
export const getVideoDetails = (workspaceId, videoId) => {
    return api.get(`api/workspace/${workspaceId}/video/${videoId}`);
};

/**
 * Delete a video
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} videoId - UUID of the video
 * @returns {Promise} - Response from deletion
 */
export const deleteVideo = (workspaceId, videoId) => {
    return api.delete(`api/workspace/${workspaceId}/video/${videoId}`);
};

/**
 * Upload file(s) to a video
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} videoId - UUID of the video
 * @param {FileList|File[]} files - Video files to upload
 * @returns {Promise} - Response from file upload
 */
export const uploadVideoFiles = (workspaceId, videoId, files) => {
    const formData = new FormData();
    
    // Handle both FileList and array of files
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
        formData.append('files', file);
    });
    
    return api.post(`api/workspace/${workspaceId}/video/${videoId}/upload_file`, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data' 
        }
    });
};

/**
 * Delete a specific file from a video
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} videoId - UUID of the video
 * @param {string} fileId - UUID of the file
 * @returns {Promise} - Response from file deletion
 */
export const deleteVideoFile = (workspaceId, videoId, fileId) => {
    return api.delete(`api/workspace/${workspaceId}/video/${videoId}/file/${fileId}/delete`);
};

export default api