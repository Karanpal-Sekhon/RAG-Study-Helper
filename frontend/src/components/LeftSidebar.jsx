import React, { useState } from "react";
import "../styles/LeftSidebar.css";

const LeftSidebar = () => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isVideosOpen, setIsVideosOpen] = useState(false);

  return (
    <div className="left-sidebar">
      <input
        type="text"
        placeholder="Search notes, videos, or slides"
        className="search-bar"
      />

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
            <li>Note Set 1</li>
            <li>Note Set 2</li>
            <li>Note Set 3</li>
          </ul>
        )}
      </div>

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
            <li>Video Set 1</li>
            <li>Video Set 2</li>
            <li>Video Set 3</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
