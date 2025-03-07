import React, { useEffect, useState, useContext } from "react";
import { getUsers, createProject, getUserProjects } from "../api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        if (!data.error) {
          setUsers(data);
        } else {
          console.error("Error fetching users:", data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error("Network error:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);



  const handleCheckboxChange = (userId) => {
    setCheckedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
    handleRoleChange(userId, 'devs');
  };

  const handleRoleChange = (userId, role) => {
    setRoleAssignments((prev) => {
      const updatedAssignments = { ...prev };

      if (!Array.isArray(updatedAssignments[role])) {
        updatedAssignments[role] = [];
      }

      Object.keys(updatedAssignments).forEach((key) => {
        updatedAssignments[key] = updatedAssignments[key].filter((id) => id !== userId);
      });

      updatedAssignments[role] = [...updatedAssignments[role], userId];

      return updatedAssignments;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!input1) {
      setError("Project name is required.");
      return;
    }
  
    const devs = roleAssignments.devs;
    const scrumMasters = roleAssignments.scrumMasters;
    const productManagers = roleAssignments.productManagers;
  
    const projectData = {
      name: input1,
      devs,
      scrumMasters,
      productManagers,
    };
  
    try {
      const result = await createProject(projectData);
  
      if (result.error) {
        setError(result.error);
        setSuccess("");
      } else {
        setSuccess("Project created successfully!");
        setError("");
  
        const updatedProjects = await getUserProjects(user.uid);
        setProjects(updatedProjects);
        console.log(updatedProjects);

        setInput1("");
        setCheckedUsers({});
        setRoleAssignments({
          devs: [],
          scrumMasters: [],
          productManagers: [],
        });
      }
    } catch (err) {
      setError(err.message || "Error creating project");
      setSuccess("");
    }
  };


  return (
    <div>
      <h1>Create new project</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ime projekta:</label>
          <input
            type="text"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
          <button type="submit">Create project</button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <table>
          <thead>
            <tr>
              <th>Include user</th>
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
                        <option value="scrumMasters">SCRUM master</option>
                      </select>
                    ) : (
                      <span>Select user to assign a role</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default CreateProject;
