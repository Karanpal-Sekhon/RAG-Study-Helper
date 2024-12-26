import React, { useState } from "react";
import "../styles/RightSidebar.css";
import api from "../api";

const RightSidebar = ({ workspaceId, onMaterialAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "notes", "videos", or "slides"
  const [materialName, setMaterialName] = useState("");
  const [materialFile, setMaterialFile] = useState(null);

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setMaterialName("");
    setMaterialFile(null);
  };

  const handleAddMaterial = async () => {
    if (!materialName.trim()) {
      alert("Material name cannot be empty.");
      return;
    }

    try {
      const endpoint =
        modalType === "notes"
          ? `api/workspace/${workspaceId}/create_note`
          : modalType === "videos"
          ? `api/workspace/${workspaceId}/create_video`
          : `api/workspace/${workspaceId}/create_slide`;

      const response = await api.post(endpoint, { title: materialName });
      const createdMaterial = response.data;

      if (materialFile) {
        const fileUploadEndpoint =
          modalType === "notes"
            ? `api/workspace/${workspaceId}/note/${createdMaterial.id}/upload_file`
            : modalType === "videos"
            ? `api/workspace/${workspaceId}/video/${createdMaterial.id}/upload_file`
            : `api/workspace/${workspaceId}/slide/${createdMaterial.id}/upload_file`;

        const formData = new FormData();
        formData.append("files", materialFile);

        await api.post(fileUploadEndpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onMaterialAdded(modalType); // Notify parent to update left sidebar
      handleCloseModal();
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Failed to add material. Please try again.");
    }
  };

  return (
    <div className="right-sidebar">
      <div className="content">
        <button className="add-button" onClick={() => handleOpenModal("notes")}>
          <span className="button__text">Add Notes</span>
          <span className="button__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
              height="24"
              fill="none"
              className="svg"
            >
              <line y2="19" y1="5" x2="12" x1="12"></line>
              <line y2="12" y1="12" x2="19" x1="5"></line>
            </svg>
          </span>
        </button>
        <button
          className="add-button"
          onClick={() => handleOpenModal("videos")}
        >
          <span className="button__text">Add Videos</span>
          <span className="button__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
              height="24"
              fill="none"
              className="svg"
            >
              <line y2="19" y1="5" x2="12" x1="12"></line>
              <line y2="12" y1="12" x2="19" x1="5"></line>
            </svg>
          </span>
        </button>
        <button
          className="add-button"
          onClick={() => handleOpenModal("slides")}
        >
          <span className="button__text">Add Slides</span>
          <span className="button__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
              height="24"
              fill="none"
              className="svg"
            >
              <line y2="19" y1="5" x2="12" x1="12"></line>
              <line y2="12" y1="12" x2="19" x1="5"></line>
            </svg>
          </span>
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              Add {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>
            <input
              type="text"
              placeholder="Enter Name"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setMaterialFile(e.target.files[0])}
            />
            <div className="modal-actions">
              <button onClick={handleAddMaterial}>Add</button>
              <button onClick={handleCloseModal} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
