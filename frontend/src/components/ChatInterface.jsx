import { useState } from "react";
import { Send, Sparkles, AlertCircle, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChat } from "@/hooks/useChat";
import { useUser } from "@/hooks/useUser";

/**
 * ChatInterface Component
 * 
 * Provides a modern chat interface integrated with the backend multi-agent system.
 * Features real-time messaging, session management, and beautiful UI.
 * 
 * @param {object} props
 * @param {string} props.workspaceId - UUID of the workspace
 */
const ChatInterface = ({ workspaceId }) => {
  const [inputMessage, setInputMessage] = useState("");
  
  // Use our custom chat hook for all chat functionality
  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    isLoadingSessions,
    isSending,
    error,
    createNewSession,
    selectSession,
    sendMessage,
    clearError
  } = useChat(workspaceId);

  // Get user information for profile display
  const { user, getProfileImageUrl, getUserInitials } = useUser();

  /**
   * Handle sending a new message
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const messageToSend = inputMessage;
    setInputMessage(""); // Clear input immediately for better UX

    try {
      await sendMessage(messageToSend);
    } catch (err) {
      // Error is handled by the hook, just restore input if needed
      setInputMessage(messageToSend);
    }
  };

  /**
   * Handle Enter key press for sending messages
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle creating a new chat session
   */
  const handleNewChat = async () => {
    try {
      await createNewSession();
    } catch (err) {
      // Error handled by hook
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  /**
   * Render user avatar
   */
  const renderUserAvatar = () => {
    const profileImageUrl = getProfileImageUrl();
    const initials = getUserInitials();

    return (
      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
        {profileImageUrl ? (
          <img 
            src={profileImageUrl} 
            alt="User" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {initials}
            </span>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render AI avatar
   */
  const renderAIAvatar = (agentType) => {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0">
        <Bot className="h-5 w-5 text-white" />
      </div>
    );
  };

  // Show loading state while sessions are being loaded
  if (isLoadingSessions) {
    return (
      <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading chat sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      {/* Error Alert */}
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
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

      {/* Session Info */}
      {currentSession && (
        <div className="mb-4 p-3 bg-white/60 rounded-lg border border-gray-200/50">
          <p className="text-sm font-medium text-gray-900">{currentSession.title}</p>
          <p className="text-xs text-gray-500">
            Session: {currentSession.id.slice(0, 8)}...
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto mb-6 px-2" style={{ scrollbarWidth: 'thin' }}>
        {!currentSession || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {!currentSession ? "Start a New Conversation" : "Ready to help you learn!"}
            </p>
            <p className="text-gray-600 mb-4">
              {!currentSession 
                ? "Create a new chat session to begin asking questions about your study materials."
                : "Ask me anything about your uploaded study materials."
              }
            </p>
            {!currentSession && (
              <Button 
                onClick={handleNewChat}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start New Chat
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => {
              const isUser = message.sender === 'user';
              
              return (
                <div key={message.id} className="w-full">
                  {/* Message Row */}
                  <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isUser ? renderUserAvatar() : renderAIAvatar(message.agent_type)}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-4 py-3 rounded-2xl ${
                        isUser 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed break-words">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Timestamp and Agent Type */}
                      <div className={`mt-1 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </p>
                        {message.agent_type && !isUser && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {message.agent_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading indicator for message sending */}
        {isSending && (
          <div className="w-full mt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {renderAIAvatar()}
              </div>
              <div className="flex-1 max-w-[80%] text-left">
                <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100 text-gray-900">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex space-x-3">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            currentSession 
              ? "Ask me anything about your study materials..." 
              : "Create a chat session to start messaging..."
          }
          className="flex-1 h-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:bg-white/90 transition-all duration-200 rounded-xl"
          disabled={isSending || !currentSession}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !inputMessage.trim() || !currentSession}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;