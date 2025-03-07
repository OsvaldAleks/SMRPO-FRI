import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import EditAccount from "./pages/EditAccount";
import Navbar from './components/Navbar';
import CreateProject from './pages/CreateProject';
import AddUserForm from "./pages/AddUserForm";
import ManageUsers from "./pages/ManageUsers";


function App() {
  return (
    <AuthProvider>
      <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/EditAccount" element={<PrivateRoute><EditAccount /></PrivateRoute>} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/newProject" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
          <Route path="/manageUsers" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
          <Route path="/addUser" element={<PrivateRoute><AddUserForm /></PrivateRoute>} />
        </Routes>
      </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
