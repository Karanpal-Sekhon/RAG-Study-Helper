import { useState, useEffect } from "react";
import { Plus, Book, LogOut, User, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useUser } from "@/hooks/useUser";

const Home = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  // Get user information for profile display
  const { user, getProfileImageUrl, getUserInitials } = useUser();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get("api/workspaces/");
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
      try {
        const response = await api.post("api/workspace/create", {
          name: newWorkspaceName,
        });
        setWorkspaces([...workspaces, response.data]);
        setNewWorkspaceName("");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error creating workspace:", error);
        alert("Failed to create workspace. Please try again.");
      }
    }
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      await api.delete(`api/workspace/${id}/detail`);
      setWorkspaces(workspaces.filter(w => w.id !== id));
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace. Please try again.");
    }
  };

  const handleStudyWorkspace = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Book className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              RAG Study Helper
            </h1>
            <p className="text-sm text-gray-600">Learn Smarter, Not Harder!</p>
          </div>
            </div>
            <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 border-0 shadow-md"
          >
            <LogOut className="h-4 w-4 mr-2" />
            LOGOUT
          </Button>
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200/50">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            {getProfileImageUrl() ? (
              <img 
                src={getProfileImageUrl()} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-base font-semibold">
              {getUserInitials()}
                </span>
              </div>
            )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Learning Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create intelligent workspaces, upload your study materials, and let AI help you master any subject with personalized insights.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">My Workspaces</h3>
            <p className="text-gray-600 mt-1">Organize your studies by subject or course</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                ADD WORKSPACE
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div>
                  <Label htmlFor="workspace-name" className="text-sm font-medium text-gray-700">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g., Mathematics 101, Biology Notes..."
                    className="mt-2 h-11"
                  />
                </div>
                <Button 
                  onClick={handleCreateWorkspace} 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 h-11"
                >
                  Create Workspace
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workspaces Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Book className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {workspace.created_at ? new Date(workspace.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">{workspace.name}</CardTitle>
                <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded text-center">
                  ID: {workspace.id}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleStudyWorkspace(workspace.id)}
                    className="col-span-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 h-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Book className="h-4 w-4 mr-2" />
                    Study
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                    className="h-10 text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add Workspace Card */}
          <Card className="group border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors duration-200 bg-white/50 hover:bg-white/70">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div className="cursor-pointer group-hover:scale-105 transition-transform duration-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                      <Plus className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Create New Workspace</h3>
                    <p className="text-sm text-gray-600">Start organizing your study materials</p>
                  </div>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Book className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">RAG Study Helper</span>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
              >
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
              >
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>
            <p className="text-sm text-gray-600 text-center">
              © 2024 RAG Study Helper. Empowering students to learn smarter, not harder.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;