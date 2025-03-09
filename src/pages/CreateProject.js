import React, { useEffect, useState, useContext } from "react";
import { getUser, createProject, getUserProjects, getUsers } from "../api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Button from '../components/Button';
import Input from '../components/Input';
import { ProjectsContext } from "../context/ProjectsContext";

const CreateProject = () => {
  const [input1, setInput1] = useState("");
  const [users, setUsers] = useState([]);
  const [checkedUsers, setCheckedUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [roleAssignments, setRoleAssignments] = useState({
    devs: [],
    scrumMasters: [],
    productManagers: [],
  });
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState("");
  const { projects, setProjects } = useContext(ProjectsContext);

  const auth = getAuth();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();

        if (data && !data.error) {
          setUsers(data);
        } else {
          console.error("Error fetching users:", data ? data.message : "No data received");
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCheckboxChange = (userId) => {
    setCheckedUsers((prev) => {
      const isChecked = !prev[userId];
      const updatedCheckedUsers = { ...prev, [userId]: isChecked };

      // Initialize the role to "devs" when the user is first checked
      if (isChecked && !roleAssignments.devs.includes(userId)) {
        setRoleAssignments((prevRoles) => {
          // Add to devs if not already included in any other role
          if (!prevRoles.devs.includes(userId) && !prevRoles.scrumMasters.includes(userId) && !prevRoles.productManagers.includes(userId)) {
            return {
              ...prevRoles,
              devs: [...prevRoles.devs, userId]
            };
          }
          return prevRoles;
        });
      } else if (!isChecked) {
        // Remove the user from all roles if unchecked
        setRoleAssignments((prevRoles) => {
          const updatedRoles = { ...prevRoles };
          Object.keys(updatedRoles).forEach((role) => {
            updatedRoles[role] = updatedRoles[role].filter((id) => id !== userId);
          });
          return updatedRoles;
        });
      }

      return updatedCheckedUsers;
    });
  };


  const handleRoleChange = (userId, role) => {
    setRoleAssignments((prev) => {
      const updatedAssignments = { ...prev };

      // Remove user from all roles before adding to the new role
      Object.keys(updatedAssignments).forEach((key) => {
        updatedAssignments[key] = updatedAssignments[key].filter((id) => id !== userId);
      });

      updatedAssignments[role] = [...updatedAssignments[role], userId];

      console.log("Role change:", role, updatedAssignments[role]);
      return updatedAssignments;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input1) {
      setError("Project name is required.");
      return;
    }

    if (!user || !user.uid) {
      setError("User is not authenticated.");
      return;
    }

    const projectData = {
      name: input1,
      devs: roleAssignments.devs,
      scrumMasters: roleAssignments.scrumMasters,
      productManagers: roleAssignments.productManagers,
      owner: user.uid,
    };

    try {
      console.log("Submitting project data:", projectData);
      const result = await createProject(projectData);

      if (result.error) {
        setError(result.message || "An error occurred while creating the project.");
        setSuccess("");
      } else {
        setSuccess("Project created successfully!");
        setError("");

        console.log("Fetching updated projects for user:", user.uid);
        const updatedProjects = await getUserProjects(user.uid);
        setProjects(updatedProjects);

        // Reset form
        setInput1("");
        setCheckedUsers({});
        setRoleAssignments({ devs: [], scrumMasters: [], productManagers: [] });
      }
    } catch (err) {
      setError(err.message || "Network error occurred while creating project.");
      setSuccess("");
    }
  };

  return (
    <div className="center--box">
      <h1>Create New Project</h1>
      <form onSubmit={handleSubmit}>
        <div className="block--element grid">
          <label className="block--element">Project Name:</label>
          <Input
            type="text"
            className="block--element"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
          <Button type="submit">Create Project</Button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <div className="responsive-table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Include</th>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedUsers[user.id] || false}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.email}</td>
                    <td>
                      {checkedUsers[user.id] ? (
                        <select
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          defaultValue="devs"
                        >
                          <option value="devs">Developer</option>
                          <option value="productManagers">Product Manager</option>
                          <option value="scrumMasters">SCRUM Master</option>
                        </select>
                      ) : (
                        <span>Select to assign role</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;