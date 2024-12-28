import React, { useState, useEffect } from "react";
import "../styles/LeftSidebar.css";
import api from "../api";

const LeftSidebar = ({ workspaceId, materialsUpdated }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isVideosOpen, setIsVideosOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, [workspaceId, materialsUpdated]); // Re-fetch materials when workspaceId or materialsUpdated changes

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

  const handleDeleteNoteFile = async (noteId, fileId) => {
    try {
      await api.delete(
        `api/workspace/${workspaceId}/note/${noteId}/file/${fileId}/delete`
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                files: note.files.filter((file) => file.id !== fileId),
              }
            : note
        )
      );
    } catch (error) {
      console.error("Error deleting note file:", error);
      alert("Failed to delete note file. Please try again.");
    }
  };

  const handleDeleteVideoFile = async (videoId, fileId) => {
    try {
      await api.delete(
        `api/workspace/${workspaceId}/video/${videoId}/file/${fileId}/delete`
      );
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                files: video.files.filter((file) => file.id !== fileId),
              }
            : video
        )
      );
    } catch (error) {
      console.error("Error deleting video file:", error);
      alert("Failed to delete video file. Please try again.");
    }
  };

  const handleUploadNoteFile = async (noteId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await api.post(
        `api/workspace/${workspaceId}/note/${noteId}/upload_file`,
        formData
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? { ...note, files: [...note.files, ...response.data] }
            : note
        )
      );
    } catch (error) {
      console.error("Error uploading note files:", error);
      alert("Failed to upload note files. Please try again.");
    }
  };

  const handleUploadVideoFile = async (videoId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await api.post(
        `api/workspace/${workspaceId}/video/${videoId}/upload_file`,
        formData
      );
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? { ...video, files: [...video.files, ...response.data] }
            : video
        )
      );
    } catch (error) {
      console.error("Error uploading video files:", error);
      alert("Failed to upload video files. Please try again.");
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
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteNoteFile(note.id, file.id)}
                      >
                        Delete File
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleUploadNoteFile(note.id, Array.from(e.target.files))
                  }
                />
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
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteVideoFile(video.id, file.id)}
                      >
                        Delete File
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleUploadVideoFile(video.id, Array.from(e.target.files))
                  }
                />
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
