import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import EditAccount from "./pages/EditAccount";
import Navbar from "./components/Navbar";
import CreateProject from "./pages/CreateProject";
import AddUserForm from "./pages/AddUserForm";
import ProjectDocumentation from "./components/ProjectDocumentation";
import ManageUsers from "./pages/ManageUsers";
import UserProjects from "./pages/UserProjects";
import ProjectDetails from "./pages/ProjectDetails";
import AddSprintForm from "./pages/AddSprintForm";
import { ProjectsProvider } from "./context/ProjectsContext";
import SprintDetails from "./pages/SprintDetails";
import UserStoryForm from "./pages/UserStoryForm";
import UserStoryDetails from "./pages/UserStoryDetails";
import UserStatusHandler from "./utils/UserStatusHandler"; // Import the new component
import Documentation from "./pages/Documentation";
import WorkTimePage from "./pages/WorkTimePage";
import ProjectWall from "./pages/ProjectWall";
import "./App.css";
import { HashRouter } from "react-router-dom";


function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <HashRouter>
          <UserStatusHandler /> {/* This handles the online/offline status */}
          <Navbar />
          <main>
            <div className="center--container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/EditAccount" element={<PrivateRoute><EditAccount /></PrivateRoute>} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/SMRPO-FRI" element={<Dashboard />} />
                <Route path="/userDocumentation" element={<Documentation />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/newProject" element={<AdminRoute><CreateProject /></AdminRoute>} />
                <Route path="/manageUsers" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                <Route path="/addUser" element={<AdminRoute><AddUserForm /></AdminRoute>} />
                <Route path="/userProjects" element={<PrivateRoute><UserProjects /></PrivateRoute>} />
                <Route path="/project/:projectName" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
                <Route path="/story/:storyId" element={<PrivateRoute><UserStoryDetails /></PrivateRoute>} />
                <Route path="/userStoryForm" element={<PrivateRoute><UserStoryForm /></PrivateRoute>} />
                <Route path="/project/:projectName/sprint/:sprintId" element={<PrivateRoute><SprintDetails /></PrivateRoute>} />
                <Route path="/projects/:projectId/documentation" element={<ProjectDocumentation />} />
                <Route path="/workTimePage" element={<WorkTimePage />} />
                <Route path="/projects/:projectId/wall" element={<PrivateRoute><ProjectWall /></PrivateRoute>} />
              </Routes>
            </div>
          </main>
        </HashRouter>
      </ProjectsProvider>
    </AuthProvider>
  );
}

export default App;
