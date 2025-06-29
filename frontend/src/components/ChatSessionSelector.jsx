import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";

/**
 * ChatSessionSelector Component
 * 
 * Provides a dropdown to select and manage chat sessions
 * 
 * @param {object} props
 * @param {string} props.workspaceId - UUID of the workspace
 * @param {function} props.onSessionChange - Callback when session changes
 */
const ChatSessionSelector = ({ workspaceId, onSessionChange }) => {
  const { sessions, currentSession, selectSession, isLoadingSessions } = useChat(workspaceId);
  
  const handleSessionChange = async (event) => {
    const sessionId = event.target.value;
    if (sessionId && sessionId !== currentSession?.id) {
      await selectSession(sessionId);
      if (onSessionChange) {
        onSessionChange(sessionId);
      }
    }
  };

  if (isLoadingSessions) {
    return (
      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <select 
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      value={currentSession?.id || ""}
      onChange={handleSessionChange}
    >
      <option value="">Select Conversation</option>
      {sessions.map((session) => (
        <option key={session.id} value={session.id}>
          {session.title || `Session ${session.id.slice(0, 8)}...`}
        </option>
      ))}
    </select>
  );
};

export default ChatSessionSelector;