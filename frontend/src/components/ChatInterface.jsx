import { useState } from "react";
import { Send, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChat } from "@/hooks/useChat";

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
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  /**
   * Get avatar and styling for message sender
   */
  const getMessageSenderInfo = (sender, agentType) => {
    if (sender === 'user') {
      return {
        avatar: 'U',
        bgClass: 'bg-white/20',
        messageClass: 'ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
      };
    }
    
    // AI message - show agent type if available
    const agentDisplay = agentType || 'AI';
    return {
      avatar: agentDisplay.charAt(0).toUpperCase(),
      bgClass: 'bg-gradient-to-br from-indigo-600 to-purple-600',
      messageClass: 'mr-auto bg-white/80 backdrop-blur-sm'
    };
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
      <div className="flex-1 overflow-auto mb-6 space-y-4">
        {!currentSession || messages.length === 0 ? (
          <div className="text-center mt-20">
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
          messages.map((message) => {
            const senderInfo = getMessageSenderInfo(message.sender, message.agent_type);
            
            return (
              <Card key={message.id} className={`max-w-3xl shadow-lg border-0 ${senderInfo.messageClass}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${senderInfo.bgClass}`}>
                      {senderInfo.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={message.sender === "user" ? "text-white" : "text-gray-900"}>
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.sender === "user" ? "text-white/70" : "text-gray-500"
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                        {message.agent_type && message.sender !== 'user' && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            {message.agent_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Loading indicator for message sending */}
        {isSending && (
          <Card className="max-w-3xl mr-auto bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  AI
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message Input */}
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