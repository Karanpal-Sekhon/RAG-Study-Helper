import { useState } from "react";
import { Plus, FileText, Edit, Trash2, Upload, File, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotes } from "@/hooks/useNotes";

/**
 * NotesSection Component
 * 
 * Provides a comprehensive notes management interface with text notes and file uploads.
 * Features real-time CRUD operations, file upload/management, and beautiful UI.
 * 
 * @param {object} props
 * @param {string} props.workspaceId - UUID of the workspace
 */
const NotesSection = ({ workspaceId }) => {
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("create");

  // Use our custom notes hook for all notes functionality
  const {
    notes,
    isLoading,
    isLoadingNotes,
    isCreating,
    isUploading,
    error,
    createTextNote,
    createNoteWithFiles,
    updateNote,
    removeNote,
    addFilesToNote,
    removeFileFromNote,
    clearError
  } = useNotes(workspaceId);

  /**
   * Handle creating a new text note
   */
  const handleCreateNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    try {
      await createTextNote(noteTitle, noteContent);
      resetForm();
    } catch (err) {
      // Error handled by hook
    }
  };

  /**
   * Handle uploading files as a note
   */
  const handleUploadFiles = async () => {
    if (!selectedFiles.length || !noteTitle.trim()) return;

    try {
      await createNoteWithFiles(noteTitle, selectedFiles);
      resetForm();
    } catch (err) {
      // Error handled by hook
    }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    
    // Auto-fill title if not set and only one file
    if (!noteTitle && files.length === 1) {
      const fileName = files[0].name;
      setNoteTitle(fileName.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  /**
   * Handle editing a note
   */
  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content || "");
    setActiveTab("create");
    setIsDialogOpen(true);
  };

  /**
   * Handle updating a note
   */
  const handleUpdateNote = async () => {
    if (!editingNote || !noteTitle.trim() || !noteContent.trim()) return;

    try {
      await updateNote(editingNote.id, noteTitle, noteContent);
      resetForm();
    } catch (err) {
      // Error handled by hook
    }
  };

  /**
   * Handle deleting a note
   */
  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      try {
        await removeNote(noteId);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setSelectedFiles([]);
    setIsDialogOpen(false);
  };

  /**
   * Format timestamp for display
   */
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Get file type icon and color
   */
  const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
      return <FileText className="h-5 w-5 text-indigo-500" />;
    }
    
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return <File className="h-5 w-5 text-red-500" />;
    }
    return <FileText className="h-5 w-5 text-indigo-500" />;
  };

  /**
   * Handle opening a file
   */
  const handleOpenFile = (fileUrl, fileName) => {
    if (!fileUrl) {
      console.error('No file URL provided');
      return;
    }
    
    // Create a link and click it to download/view the file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state while notes are being loaded
  if (isLoadingNotes) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
            </DialogHeader>
            
            {!editingNote && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create Note</TabsTrigger>
                  <TabsTrigger value="upload">Upload Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="space-y-4">
                  <div>
                    <Label htmlFor="note-title">Title</Label>
                    <Input
                      id="note-title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Enter note title..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-content">Content</Label>
                    <Textarea
                      id="note-content"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Enter your notes here..."
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  <Button 
                    onClick={handleCreateNote} 
                    className="w-full"
                    disabled={isCreating || !noteTitle.trim() || !noteContent.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Note"
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <Label htmlFor="file-title">Title</Label>
                    <Input
                      id="file-title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Enter title for your files..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="file-upload">Upload Files</Label>
                    <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedFiles.length > 0 
                          ? `${selectedFiles.length} file(s) selected: ${selectedFiles.map(f => f.name).join(', ')}`
                          : "Click to upload or drag and drop your files"
                        }
                      </p>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUploadFiles} 
                    className="w-full"
                    disabled={isCreating || !selectedFiles.length || !noteTitle.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Files"
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            )}

            {editingNote && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-note-title">Title</Label>
                  <Input
                    id="edit-note-title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-note-content">Content</Label>
                  <Textarea
                    id="edit-note-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter your notes here..."
                    className="mt-1 min-h-[200px]"
                  />
                </div>
                <Button 
                  onClick={handleUpdateNote} 
                  className="w-full"
                  disabled={isLoading || !noteTitle.trim() || !noteContent.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Note"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {note.files && note.files.length > 0 && note.files[0]?.name ? (
                      getFileIcon(note.files[0].name)
                    ) : (
                      <FileText className="h-5 w-5 text-indigo-500" />
                    )}
                    <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    {(!note.files || note.files.length === 0) && note.content && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditNote(note)}
                        className="h-8 w-8 p-0 hover:bg-indigo-100"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {note.content ? (
                  // Text note
                  <>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{note.content}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <FileText className="h-3 w-3" />
                      <span>Updated {formatDate(note.updated_at || note.created_at)}</span>
                    </div>
                  </>
                ) : (
                  // File note
                  <>
                    {note.files && note.files.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {note.files.map((file, index) => (
                          <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 font-medium">{file?.name || 'Unnamed File'}</p>
                            <Button
                              size="sm"
                              onClick={() => handleOpenFile(file?.url, file?.name || 'file')}
                              className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white"
                              disabled={!file?.url}
                            >
                              Open File
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <File className="h-3 w-3" />
                      <span>Created {formatDate(note.created_at)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-500 mb-4">Create your first note or upload files to get started studying!</p>
        </div>
      )}
    </div>
  );
};

export default NotesSection;