import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import EditAccount from "./pages/EditAccount";
import Navbar from './components/Navbar';
import CreateProject from './pages/CreateProject';
import AddUserForm from "./components/AddUserForm";


function App() {
  return (
    <AuthProvider>
      <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/EditAccount" element={<EditAccount />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/newProject" element={<CreateProject />} />
          <Route path="/Add user" element={<AddUserForm />} />
        </Routes>
      </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
