import Header from "../components/Header";
import Chat from "../components/Chat";
import LeftSidebar from "../components/LeftSidebar";
import "../styles/Workspace.css";
import RightSidebar from "../components/RightSidebar";
function Workspace() {
  return (
    <div>
      <Header />
      <div className="app">
        <LeftSidebar />
        <div className="main-content">
          <Chat />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}

export default Workspace;
