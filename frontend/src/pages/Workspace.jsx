import React, { useState } from "react";
import Header from "../components/Header";
import Chat from "../components/Chat";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import "../styles/Workspace.css";
import { useParams } from "react-router-dom";

function Workspace() {
  const [materialsUpdated, setMaterialsUpdated] = useState(false);

  const handleMaterialAdded = () => {
    setMaterialsUpdated(!materialsUpdated); // Toggle state to trigger re-fetch
  };

  const { id: workspaceId } = useParams();

  return (
    <div>
      <Header />
      <div className="app">
        <LeftSidebar
          workspaceId={workspaceId}
          materialsUpdated={materialsUpdated}
        />
        <div className="main-content">
          <Chat workspaceId={workspaceId} />
        </div>
        <RightSidebar
          workspaceId={workspaceId}
          onMaterialAdded={handleMaterialAdded}
        />
      </div>
    </div>
  );
}

export default Workspace;
