import React, { useState } from "react";
import Header from "../components/Header";
import ClassCard from "../components/ClassCard";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";
import api from "../api";

function Home() {
  const [classes, setClasses] = useState([
    {
      id: 1,
      title: "Class #1",
      description:
        "Add main takeaway points, quotes, anecdotes, or a short story.",
    },
    {
      id: 2,
      title: "Class #2",
      description:
        "Add main takeaway points, quotes, anecdotes, or a short story.",
    },
    {
      id: 3,
      title: "Class #3",
      description:
        "Add main takeaway points, quotes, anecdotes, or a short story.",
    },
  ]);

  const handleAddClass = () => {
    const newClass = {
      id: classes.length + 1,
      title: `Class #${classes.length + 1}`,
      description:
        "Add main takeaway points, quotes, anecdotes, or a short story.",
    };
    setClasses([...classes, newClass]);
  };

  const handleDeleteClass = (id) => {
    setClasses(classes.filter((classItem) => classItem.id !== id));
  };

  return (
    <div>
      <Header />
      <main className="dashboard">
        <h2>My Classes</h2>
        <button onClick={handleAddClass} className="add-class-btn">
          Add Class
        </button>
        {classes.map((classItem) => (
          <ClassCard
            key={classItem.id}
            title={classItem.title}
            description={classItem.description}
            onAddMaterial={() => alert("Add Material clicked!")}
            onDelete={() => handleDeleteClass(classItem.id)}
            onStudy={() => alert(`Studying ${classItem.title}`)}
          />
        ))}
      </main>
      <Footer />
    </div>
  );
}
export default Home;
