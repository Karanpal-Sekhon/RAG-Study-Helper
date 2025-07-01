import { useState } from "react";
import { useParams } from "react-router-dom";
import { Book, Plus, MessageCircle, ArrowLeft, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import ChatSessionSelector from "@/components/ChatSessionSelector";
import NotesSection from "@/components/NotesSection";
import VideosSection from "@/components/VideosSection";
import FlashcardsSection from "@/components/FlashcardsSection";
import ResourcesSection from "@/components/ResourcesSection";
import { useChat } from "@/hooks/useChat";
import { useUser } from "@/hooks/useUser";

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  
  // Get chat functionality - single source of truth for all child components
  const chatState = useChat(id);
  const { createNewSession, isLoading: isChatLoading } = chatState;
  
  // Get user information for profile display
  const { user, getProfileImageUrl, getUserInitials } = useUser();

  /**
   * Handle creating a new chat session from header button
   */
  const handleNewChat = async () => {
    try {
      await createNewSession();
      setActiveTab("chat"); // Switch to chat tab
    } catch (error) {
      console.error("Failed to create new chat session:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Book className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Workspace {id}</h1>
              <p className="text-sm text-gray-600">AI-powered study assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleNewChat}
              disabled={isChatLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <ChatSessionSelector 
              workspaceId={id} 
              chatState={chatState}
              onSessionChange={() => setActiveTab("chat")}
            />
            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  {getProfileImageUrl() ? (
                    <img 
                      src={getProfileImageUrl()} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}
                </div>
                {user && (
                  <span className="text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white/70 backdrop-blur-sm border-r border-gray-200/50 min-h-screen">
          <div className="p-4">
            <Input
              placeholder="Search your materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-6 bg-white/70 backdrop-blur-sm border-gray-200/50 focus:bg-white/90 transition-all duration-200"
            />
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === "chat" 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md" 
                    : "hover:bg-white/70 text-gray-700"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">AI Chat</span>
              </button>
              
              <button
                onClick={() => setActiveTab("notes")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mt-4 ${
                  activeTab === "notes" 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md" 
                    : "hover:bg-white/70 text-gray-700"
                }`}
              >
                <span className="font-medium">Notes</span>
              </button>

              <button
                onClick={() => setActiveTab("videos")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === "videos" 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md" 
                    : "hover:bg-white/70 text-gray-700"
                }`}
              >
                <span className="font-medium">Videos</span>
              </button>

              <button
                onClick={() => setActiveTab("flashcards")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === "flashcards" 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md" 
                    : "hover:bg-white/70 text-gray-700"
                }`}
              >
                <span className="font-medium">Flashcards</span>
              </button>

              <button
                onClick={() => setActiveTab("resources")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeTab === "resources" 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md" 
                    : "hover:bg-white/70 text-gray-700"
                }`}
              >
                <span className="font-medium">Resources</span>
              </button>
            </nav>
          </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="chat">
              <ChatInterface workspaceId={id || "1"} chatState={chatState} />
            </TabsContent>
            
            <TabsContent value="notes">
              <NotesSection workspaceId={id || "1"} />
            </TabsContent>
            
            <TabsContent value="videos">
              <VideosSection workspaceId={id || "1"} />
            </TabsContent>
            
            <TabsContent value="flashcards">
              <FlashcardsSection workspaceId={id || "1"} />
            </TabsContent>
            
            <TabsContent value="resources">
              <ResourcesSection workspaceId={id || "1"} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Workspace;