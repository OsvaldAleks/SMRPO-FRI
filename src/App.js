import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { updateUserStatus } from "./api";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import EditAccount from "./pages/EditAccount";
import Navbar from "./components/Navbar";
import CreateProject from "./pages/CreateProject";
import AddUserForm from "./pages/AddUserForm";
import ManageUsers from "./pages/ManageUsers";
import UserProjects from "./pages/UserProjects";
import ProjectDetails from "./pages/ProjectDetails";
import AddSprintForm from "./pages/AddSprintForm";
import { ProjectsProvider } from "./context/ProjectsContext";
import SprintDetails from "./pages/SprintDetails";
import UserStoryForm from "./pages/UserStoryForm";
import "./App.css";

// New Component to Handle User Status
function UserStatusHandler() {
  const { user } = useAuth(); // Now this is inside a component that is wrapped by AuthProvider

  useEffect(() => {
    console.log(user)
    if (user) {
      updateUserStatus(user.uid, "online"); // Set user online

      const handleUnload = () => {
        updateUserStatus(user.uid, "offline"); // Set user offline when they leave
      };

      window.addEventListener("beforeunload", handleUnload);

      return () => {
        updateUserStatus(user.id, "offline"); // Also update when component unmounts
        window.removeEventListener("beforeunload", handleUnload);
      };
    }
  }, [user]);

  return null; // This component doesn't render anything
}

function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <Router>
          <UserStatusHandler /> {/*Moved useAuth here */}
          <Navbar />
          <main>
            <div className="center--container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/EditAccount" element={<PrivateRoute><EditAccount /></PrivateRoute>} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/newProject" element={<AdminRoute><CreateProject /></AdminRoute>} />
                <Route path="/manageUsers" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                <Route path="/addUser" element={<AdminRoute><AddUserForm /></AdminRoute>} />
                <Route path="/userProjects" element={<PrivateRoute><UserProjects /></PrivateRoute>} />
                <Route path="/project/:projectName" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
                <Route path="/userStoryForm" element={<AdminRoute><UserStoryForm /></AdminRoute>} />
                <Route 
                  path="/project/:projectName/sprint/:sprintId"
                  element={<PrivateRoute><SprintDetails /></PrivateRoute>} 
                />
              </Routes>
            </div>
          </main>
        </Router>
      </ProjectsProvider>
    </AuthProvider>
  );
}

export default App;
