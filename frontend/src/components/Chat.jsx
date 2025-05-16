import React, { useState, useRef, useEffect } from "react";
import "../styles/Chat.css";
import api, { 
  getChatSessions, 
  createChatSession, 
  getChatSessionDetails, 
  sendChatMessage 
} from "../api";

const Chat = ({ workspaceId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [workspace, setWorkspace] = useState({});
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Fetch workspace details
  const fetchWorkspace = async () => {
    try {
      const response = await api.get(`api/workspace/${workspaceId}/detail`);
      setWorkspace(response.data);
    } catch (error) {
      console.error("Error fetching workspace detail", error);
      setError("Failed to load workspace");
    }
  };

  // Load chat sessions for this workspace
  const loadChatSessions = async () => {
    if (!workspaceId) return;
    
    try {
      const response = await getChatSessions(workspaceId);
      setSessions(response.data);
      
      // If there are sessions and no current session selected, select the most recent one
      if (response.data.length > 0 && !currentSession) {
        setCurrentSession(response.data[0]);
        loadSessionMessages(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading chat sessions", error);
      setError("Failed to load chat sessions");
    }
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      const response = await getChatSessionDetails(workspaceId, sessionId);
      
      // Format messages for display
      const formattedMessages = response.data.messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.is_user_message ? "User" : msg.agent_type || "Assistant",
        timestamp: new Date(msg.created_at),
        is_user_message: msg.is_user_message
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages", error);
      setError("Failed to load messages");
    }
  };

  // Create a new chat session
  const handleCreateSession = async () => {
    try {
      const response = await createChatSession(workspaceId, "New Conversation");
      setSessions(prev => [response.data, ...prev]);
      setCurrentSession(response.data);
      setMessages([]);
    } catch (error) {
      console.error("Error creating chat session", error);
      setError("Failed to create new chat");
    }
  };

  // Send a message and get response from the multi-agent system
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return;
    
    // Create a new session if none exists
    if (!currentSession) {
      await handleCreateSession();
    }
    
    const userMessage = {
      text: inputValue,
      sender: "User",
      is_user_message: true,
      timestamp: new Date()
    };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue(""); // Clear input field
    setIsLoading(true);
    
    try {
      // Send message to the API
      const response = await sendChatMessage(
        workspaceId,
        currentSession.id,
        inputValue
      );
      
      // Get the AI response
      const aiMessage = response.data.messages[1]; // Second message is the AI response
      
      // Add AI message to UI
      setMessages(prev => [
        ...prev, 
        {
          text: aiMessage.content,
          sender: aiMessage.agent_type || "Assistant",
          is_user_message: false,
          timestamp: new Date(aiMessage.created_at)
        }
      ]);
      
    } catch (error) {
      console.error("Error sending message", error);
      setError("Failed to get response");
      
      // Add error message to UI
      setMessages(prev => [
        ...prev, 
        {
          text: "Sorry, I encountered an error processing your request.",
          sender: "Error",
          is_user_message: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle switching between sessions
  const handleSessionChange = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      loadSessionMessages(sessionId);
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load workspace and sessions when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
      loadChatSessions();
    }
  }, [workspaceId]);

  return (
    <div className="chat">
      <div className="chat-header">
        <h2>{workspace.name}</h2>
        <div className="chat-actions">
          <button onClick={handleCreateSession}>New Chat</button>
          {sessions.length > 0 && (
            <select 
              value={currentSession?.id || ""}
              onChange={(e) => handleSessionChange(e.target.value)}
            >
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.is_user_message ? "user-message" : "assistant-message"}`}
          >
            <div className="message-header">
              <span className="sender">{msg.sender}</span>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p>{msg.text}</p>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message assistant-message loading">
            <p>Thinking...</p>
            <div className="loading-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="chat-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me anything!"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
