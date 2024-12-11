import React from "react";
import NoteCard from "./NoteCard";
import VideoCard from "./VideoCard";
import "../styles/WorkspaceCard.css";

const WorkspaceCard = ({ workspace, onDelete, onStudy }) => {
  return (
    <div className="workspace-card">
      <h2>{workspace.name}</h2>
      <div className="workspace-actions">
        <button onClick={onStudy}>Study</button>
        <button onClick={onDelete} className="delete-btn">
          Delete
        </button>
      </div>

      {/* Notes Section */}
      {workspace.notes && workspace.notes.length > 0 && (
        <div className="notes-section">
          <h4>Notes</h4>
          {workspace.notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Videos Section */}
      {workspace.videos && workspace.videos.length > 0 && (
        <div className="videos-section">
          <h4>Videos</h4>
          {workspace.videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceCard;
