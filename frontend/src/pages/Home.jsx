import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ClassCard from "../components/ClassCard";
import Footer from "../components/Footer";
import "../styles/Home.css";
import api from "../api";
import Button from "../components/mainButton";
import { useNavigate } from "react-router-dom";

function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const navigate = useNavigate();

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

  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      alert("Class name cannot be empty.");
      return;
    }
    try {
      const response = await api.post("api/workspace/create", {
        name: newClassName,
      });
      setWorkspaces([...workspaces, response.data]);
      setIsAddingClass(false);
      setNewClassName("");
    } catch (error) {
      console.error("Error adding workspace:", error);
      alert("Failed to add workspace. Please try again.");
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      await api.delete(`api/workspace/${id}/detail`);
      setWorkspaces(workspaces.filter((workspace) => workspace.id !== id));
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace. Please try again.");
    }
  };

  const handleAddMaterial = async (workspaceId, type, name, file) => {
    try {
      const endpoint =
        type === "note"
          ? `api/workspace/${workspaceId}/create_note`
          : `api/workspace/${workspaceId}/create_video`;

      const response = await api.post(endpoint, { title: name });
      const createdMaterial = response.data;

      if (file) {
        const fileUploadEndpoint =
          type === "note"
            ? `api/workspace/${workspaceId}/note/${createdMaterial.id}/upload_file`
            : `api/workspace/${workspaceId}/video/${createdMaterial.id}/upload_file`;

        const formData = new FormData();
        formData.append("files", file);

        await api.post(fileUploadEndpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Fetch the updated workspace
      const updatedWorkspaceResponse = await api.get(
        `api/workspace/${workspaceId}/detail`
      );
      const updatedWorkspace = updatedWorkspaceResponse.data;

      // Update the workspace in state
      setWorkspaces(
        workspaces.map((workspace) =>
          workspace.id === workspaceId ? updatedWorkspace : workspace
        )
      );
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Failed to add material. Please try again.");
    }
  };

  const handleDeleteMaterial = async (workspaceId, type, materialId) => {
    try {
      const endpoint =
        type === "note"
          ? `api/workspace/${workspaceId}/note/${materialId}`
          : `api/workspace/${workspaceId}/video/${materialId}`;

      await api.delete(endpoint);

      // Update the state to remove the deleted material
      setWorkspaces(
        workspaces.map((workspace) =>
          workspace.id === workspaceId
            ? {
                ...workspace,
                notes:
                  type === "note"
                    ? workspace.notes.filter((note) => note.id !== materialId)
                    : workspace.notes,
                videos:
                  type === "video"
                    ? workspace.videos.filter(
                        (video) => video.id !== materialId
                      )
                    : workspace.videos,
              }
            : workspace
        )
      );
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material. Please try again.");
    }
  };

  const handleStudy = (workspaceId) => {
    navigate(`workspace/${workspaceId}`);
  };

  return (
    <div>
      <Header />
      <main className="dashboard">
        <h2>My Workspaces</h2>
        <Button onClick={() => setIsAddingClass(true)}>Add Workspace</Button>

        {isAddingClass && (
          <div className="popup">
            <div className="popup-content">
              <h3>Create a New Class</h3>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Class Name"
              />
              <button onClick={handleAddClass}>Add</button>
              <button
                onClick={() => setIsAddingClass(false)}
                className="popup-btn cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {workspaces.map((workspace) => (
          <ClassCard
            key={workspace.id}
            title={workspace.name}
            description={`Workspace ID: ${workspace.id}`}
            notes={workspace.notes}
            videos={workspace.videos}
            onDelete={() => handleDeleteClass(workspace.id)}
            onStudy={() => handleStudy(workspace.id)}
            workspaceId={workspace.id}
            onAddMaterial={(type, name, file) =>
              handleAddMaterial(workspace.id, type, name, file)
            }
            onDeleteMaterial={(type, materialId) =>
              handleDeleteMaterial(workspace.id, type, materialId)
            }
          />
        ))}
      </main>
      <Footer />
    </div>
  );
}

export default Home;
