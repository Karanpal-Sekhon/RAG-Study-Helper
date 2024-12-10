import React from "react";
import "../styles/ClassCard.css";

const ClassCard = ({
  title,
  description,
  onAddMaterial,
  onDelete,
  onStudy,
}) => {
  return (
    <div className="class-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="card-buttons">
        <button onClick={onStudy}>Study</button>
        <button onClick={onDelete} className="delete-btn">
          Delete
        </button>
        <button onClick={onAddMaterial}>Add Material</button>
      </div>
    </div>
  );
};

export default ClassCard;
