import React, { useEffect, useState } from "react";
import { getUsers } from "../api";  // Import the getAllUsers function

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
  };

  const handleRoleChange = (userId, role) => {
    setRoleAssignments((prev) => {
      const updatedAssignments = { ...prev };
      // Remove the user from all roles
      Object.keys(updatedAssignments).forEach((key) => {
        updatedAssignments[key] = updatedAssignments[key].filter(
          (id) => id !== userId
        );
      });
      // Add the user to the new role
      updatedAssignments[role] = [...updatedAssignments[role], userId];
      return updatedAssignments;
    });
  };

  return (
    <div>
      <h1>Create new project</h1>
      <form>
        <div>
          <label>Ime projekta:</label>
          <input
            type="text"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
          <button>Create project</button>
        </div>
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
