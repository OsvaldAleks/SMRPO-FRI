import React, { useEffect, useState, useContext } from "react";
import { getUser, createProject, getUserProjects, getUsers } from "../api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Button from '../components/Button';
import Input from '../components/Input';
import { ProjectsContext } from "../context/ProjectsContext";

const CreateProject = ({ project, onSubmit }) => {
  const [input1, setInput1] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [users, setUsers] = useState([]);
  const [checkedUsers, setCheckedUsers] = useState({});
  const [roleAssignments, setRoleAssignments] = useState({
    devs: project?.devs || [],
    scrumMasters: project?.scrumMasters || [],
    productOwners: project?.productOwners || [],
  });
  const [selectedRoles, setSelectedRoles] = useState({});
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState("");
  const { projects, setProjects } = useContext(ProjectsContext);

  const auth = getAuth();

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
      }
    };

    fetchUsers();
  }, []);

  const handleCheckboxChange = (userId) => {
    setCheckedUsers((prev) => {
      const isChecked = !prev[userId];
      const updatedCheckedUsers = { ...prev, [userId]: isChecked };

      if (isChecked) {
        // If user was previously assigned a role, use that
        const previousRole = selectedRoles[userId] || "devs";
        setRoleAssignments((prevRoles) => ({
          ...prevRoles,
          [previousRole]: [...prevRoles[previousRole], userId]
        }));
        setSelectedRoles((prev) => ({ ...prev, [userId]: previousRole }));
      } else {
        setRoleAssignments((prevRoles) => {
          const updatedRoles = { ...prevRoles };
          Object.keys(updatedRoles).forEach((role) => {
            updatedRoles[role] = updatedRoles[role].filter((id) => id !== userId);
          });
          return updatedRoles;
        });
        setSelectedRoles((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }

      return updatedCheckedUsers;
    });
  };

  const handleRoleChange = (userId, role) => {
    setRoleAssignments((prev) => {
      const updatedAssignments = { ...prev };

      // Remove user from all roles before assigning a new one
      Object.keys(updatedAssignments).forEach((key) => {
        updatedAssignments[key] = updatedAssignments[key].filter((id) => id !== userId);
      });

      updatedAssignments[role] = [...updatedAssignments[role], userId];
      return updatedAssignments;
    });

    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
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
      description,
      devs: [...new Set([...roleAssignments.devs, ...roleAssignments.scrumMasters])],
      scrumMasters: roleAssignments.scrumMasters,
      productOwners: roleAssignments.productOwners,
      owner: user.uid,
    };

    try {
      /*const result = project
        ? await updateProject(projectData) // Use an updateProject function here
        : await createProject(projectData);
*/const result = await createProject(projectData);
      if (result.error) {
        setError(result.message || "An error occurred while updating/creating the project.");
      } else {
        setSuccess("Project updated successfully!");
        setError("");
        const updatedProjects = await getUserProjects(user.uid);
        setProjects(updatedProjects);
        setInput1("");
        setDescription("");
        setCheckedUsers({});
        setRoleAssignments({ devs: [], scrumMasters: [], productOwners: [] });
        setSelectedRoles({});
      }
    } catch (err) {
      setError(err.message || "Network error occurred while creating/updating project.");
    }
  };

  const getAvailableRoles = (userId) => {
    const availableRoles = [
      { value: "devs", label: "Developer" },
    ];

    if (
      roleAssignments.scrumMasters.length === 0 ||
      roleAssignments.scrumMasters.includes(userId)
    ) {
      availableRoles.push({ value: "scrumMasters", label: "SCRUM Master" });
    }

    if (
      roleAssignments.productOwners.length === 0 ||
      roleAssignments.productOwners.includes(userId)
    ) {
      availableRoles.push({ value: "productOwners", label: "Product Owner" });
    }

    return availableRoles;
  };

  useEffect(() => {
    if (project) {
      const initialCheckedUsers = {};
      const initialSelectedRoles = {};

      // Mark users as checked and set their roles
      project.devs?.forEach(userId => {
        initialCheckedUsers[userId] = true;
        initialSelectedRoles[userId] = "devs";
      });

      project.scrumMasters?.forEach(userId => {
        initialCheckedUsers[userId] = true;
        initialSelectedRoles[userId] = "scrumMasters";
      });

      project.productOwners?.forEach(userId => {
        initialCheckedUsers[userId] = true;
        initialSelectedRoles[userId] = "productOwners";
      });

      setCheckedUsers(initialCheckedUsers);
      setSelectedRoles(initialSelectedRoles);
    }
  }, [project]);


  return (
    <div className="center--box">
      <h1>{project ? "Edit Project" : "Create New Project"}</h1>
      <form onSubmit={handleSubmit}>
        <div className="block--element grid">
          <label className="block--element">Project Name:</label>
          <Input
            type="text"
            className="block--element"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
        </div>
        <div className="block--element grid">
          <label className="block--element">Project Description:</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Enter project description..."
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <Button type="submit">{project ? "Update Project" : "Create Project"}</Button>

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
              users.map((user) => {
                // Check if user is assigned to any role
                const isAssigned = 
                  roleAssignments.devs.includes(user.id) ||
                  roleAssignments.scrumMasters.includes(user.id) ||
                  roleAssignments.productOwners.includes(user.id);
                
                // Determine current role
                let currentRole = selectedRoles[user.id];
                if (!currentRole) {
                  if (roleAssignments.scrumMasters.includes(user.id)) {
                    currentRole = "scrumMasters";
                  } else if (roleAssignments.productOwners.includes(user.id)) {
                    currentRole = "productOwners";
                  } else if (roleAssignments.devs.includes(user.id)) {
                    currentRole = "devs";
                  }
                }

                return (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isAssigned || checkedUsers[user.id]}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.surname}</td>
                    <td>{user.email}</td>
                    <td>
                      {isAssigned || checkedUsers[user.id] ? (
                        <div className="select-container">
                          <select
                            className="select select--short"
                            value={currentRole || "devs"}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          >
                            {getAvailableRoles(user.id).map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span>Select to assign role</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      </form>
    </div>
  );
};

export default CreateProject;