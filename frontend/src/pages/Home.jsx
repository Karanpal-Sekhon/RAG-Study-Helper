import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ClassCard from "../components/ClassCard";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";
import api from "../api";

function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  // Fetch workspaces on component mount
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

  return (
    <div>
      <Header />
      <main className="dashboard">
        <h2>My Classes</h2>
        <button
          onClick={() => setIsAddingClass(true)}
          className="add-class-btn"
        >
          Add Class
        </button>

        {/* Add Class Popup */}
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
              <button onClick={handleAddClass} className="popup-btn">
                Add
              </button>
              <button
                onClick={() => setIsAddingClass(false)}
                className="popup-btn cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Render Workspaces */}
        {workspaces.map((workspace) => (
          <ClassCard
            key={workspace.id}
            title={workspace.name}
            description={`Workspace ID: ${workspace.id}`}
            onAddMaterial={() => alert("Add Material clicked!")}
            onDelete={() => handleDeleteClass(workspace.id)}
            onStudy={() => alert(`Studying ${workspace.name}`)}
          />
        ))}
      </main>
      <Footer />
    </div>
  );
}

export default Home;
