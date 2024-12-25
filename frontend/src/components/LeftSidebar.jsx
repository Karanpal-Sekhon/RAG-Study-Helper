import React, { useState, useEffect } from "react";
import "../styles/LeftSidebar.css";
import api from "../api";

const LeftSidebar = ({ workspaceId }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isVideosOpen, setIsVideosOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, [workspaceId]);

  const fetchMaterials = async () => {
    try {
      const response = await api.get(`api/workspace/${workspaceId}/detail`);
      setNotes(response.data.notes);
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`api/workspace/${workspaceId}/note/${noteId}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await api.delete(`api/workspace/${workspaceId}/video/${videoId}`);
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.id !== videoId)
      );
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  return (
    <div className="left-sidebar">
      <input
        type="text"
        placeholder="Search notes, videos, or slides"
        className="search-bar"
      />

      {/* Notes Accordion */}
      <div className="accordion-item">
        <div
          className="accordion-header"
          onClick={() => setIsNotesOpen(!isNotesOpen)}
        >
          <h3>Notes</h3>
          <span>{isNotesOpen ? "-" : "+"}</span>
        </div>
        {isNotesOpen && (
          <ul className="accordion-content">
            {notes.map((note) => (
              <li key={note.id} className="material-item">
                <h4>{note.title}</h4>
                <ul>
                  {note.files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Delete Note
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Videos Accordion */}
      <div className="accordion-item">
        <div
          className="accordion-header"
          onClick={() => setIsVideosOpen(!isVideosOpen)}
        >
          <h3>Videos</h3>
          <span>{isVideosOpen ? "-" : "+"}</span>
        </div>
        {isVideosOpen && (
          <ul className="accordion-content">
            {videos.map((video) => (
              <li key={video.id} className="material-item">
                <h4>{video.title}</h4>
                <ul>
                  {video.files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  Delete Video
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
