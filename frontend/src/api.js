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

export default api