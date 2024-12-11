import React from "react";
import "../styles/NoteCard.css";

const NoteCard = ({ note }) => {
  return (
    <div className="note-card">
      <p>Title: {note.title}</p>
      <p>Extracted Text: {note.file_text}</p>
      <h5>Files:</h5>
      <ul>
        {note.files.map((file) => (
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

export default NoteCard;
