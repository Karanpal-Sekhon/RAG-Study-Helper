import React, { useState } from "react";
import "../styles/ClassCard.css";

const ClassCard = ({
  title,
  description,
  notes,
  videos,
  onDelete,
  onStudy,
  onAddMaterial,
  onDeleteMaterial, // This callback is passed from Home.jsx
  workspaceId,
}) => {
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [materialType, setMaterialType] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleAddMaterial = () => {
    if (!materialType || !materialName.trim()) {
      alert("Please select a type and provide a name.");
      return;
    }
    onAddMaterial(materialType, materialName, selectedFile);
    setIsAddingMaterial(false);
    setMaterialType("");
    setMaterialName("");
    setSelectedFile(null);
  };

  // Deleting notes
  const handleDeleteNote = (noteId) => {
    onDeleteMaterial("note", noteId); // Pass the note ID and type to the parent callback
  };

  // Deleting videos
  const handleDeleteVideo = (videoId) => {
    onDeleteMaterial("video", videoId); // Pass the video ID and type to the parent callback
  };

  return (
    <div className="class-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="card-buttons">
        <button onClick={onStudy}>Study</button>
        <button onClick={onDelete} className="delete-btn">
          Delete
        </button>
        <button onClick={() => setIsAddingMaterial(true)}>
          Create Note/Video
        </button>
      </div>

      {isAddingMaterial && (
        <div className="popup">
          <div className="popup-content">
            <h3>Create Note/Video</h3>
            <label>
              <input
                type="radio"
                value="note"
                checked={materialType === "note"}
                onChange={() => setMaterialType("note")}
              />
              Note
            </label>
            <label>
              <input
                type="radio"
                value="video"
                checked={materialType === "video"}
                onChange={() => setMaterialType("video")}
              />
              Video
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button onClick={handleAddMaterial} className="popup-btn">
              Submit
            </button>
            <button
              onClick={() => setIsAddingMaterial(false)}
              className="popup-btn cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Render Notes */}
      <div className="materials">
        <h3>Notes</h3>
        {notes.map((note) => (
          <div key={note.id} className="material">
            <h4>{note.title}</h4>
            <ul>
              {note.files.map((file) => (
                <li key={file.id}>
                  <a href={file.file} target="_blank" rel="noopener noreferrer">
                    {file.file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
            <button>Edit Files</button>
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="delete-btn"
            >
              Delete Note
            </button>
          </div>
        ))}
      </div>

      {/* Render Videos */}
      <div className="materials">
        <h3>Videos</h3>
        {videos.map((video) => (
          <div key={video.id} className="material">
            <h4>{video.title}</h4>
            <ul>
              {video.files.map((file) => (
                <li key={file.id}>
                  <a href={file.file} target="_blank" rel="noopener noreferrer">
                    {file.file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
            <button>Edit Files</button>
            <button
              onClick={() => handleDeleteVideo(video.id)}
              className="delete-btn"
            >
              Delete Video
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ClassCard;
