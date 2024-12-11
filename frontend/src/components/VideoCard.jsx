import React from "react";
import "../styles/VideoCard.css";

const VideoCard = ({ video }) => {
  return (
    <div className="video-card">
      <p>Title: {video.title}</p>
      <p>Transcription: {video.transcription}</p>
      <h5>Files:</h5>
      <ul>
        {video.files.map((file) => (
          <li key={file.id}>
            <a
              href={`${import.meta.env.VITE_API_URL}${file.file}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.file}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoCard;
