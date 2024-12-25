import Header from "../components/Header";
import Chat from "../components/Chat";
import LeftSidebar from "../components/LeftSidebar";
import "../styles/Workspace.css";
import RightSidebar from "../components/RightSidebar";
import { useParams } from "react-router-dom";

function Workspace() {
  const { id: currentWorkspaceId } = useParams();

  return (
    <div>
      <Header />
      <div className="app">
        <LeftSidebar workspaceId={currentWorkspaceId} />
        <div className="main-content">
          <Chat />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}

export default Workspace;
