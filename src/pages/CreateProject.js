import React, { useEffect, useState } from "react";
import { getUsers, createProject } from "../api";  // Import the getAllUsers function

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
  const [error, setError] = useState("");  // State to store the error message
  const [success, setSuccess] = useState("");  // State to store the success message

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        if (!data.error) {
          setUsers(data);
        } else {
          console.error('Error fetching users:', data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('Network error:', error);
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
    e.preventDefault();  // Prevent default form submission behavior

    // Extract users from roleAssignments based on the selected roles
    const devs = roleAssignments.devs;
    const scrumMasters = roleAssignments.scrumMasters;
    const productManagers = roleAssignments.productManagers;

    // Create the project data object with the proper structure
    const projectData = {
      name: input1, // project name
      devs, // list of devs
      scrumMasters, // list of scrumMasters
      productManagers, // list of productManagers
    };

    try {
      const result = await createProject(projectData);

      if (result.error) {
        setError(result.error);  // Set the error message from server
        setSuccess("");  // Clear any previous success message
      } else {
        setSuccess("Project created successfully!");  // Set success message
        setError("");  // Clear any previous error message
      }
    } catch (err) {
      setError(err.message || "Error creating project");
      setSuccess("");  // Clear any previous success message
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
        {error && <p style={{ color: "red" }}>{error}</p>}  {/* Display the error message */}
        {success && <p style={{ color: "green" }}>{success}</p>}  {/* Display success message */}
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
