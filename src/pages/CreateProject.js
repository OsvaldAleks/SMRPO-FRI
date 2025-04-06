import React, { useEffect, useState, useContext } from "react";
import { getUser, createProject, getUserProjects, getUsers, updateProject } from "../api";
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
    productManagers: project?.productManagers || [],
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
      productOwners: roleAssignments.productManagers,
      owner: user.uid,
    };

    try {
      let result = ""
      if (project) {
        projectData.id = project.id;
        result = await updateProject(projectData);
      } else {
        result = await createProject(projectData);
      }
      if (result.error) {
        setError(result.message || "An error occurred while updating/creating the project.");
      } else {
        if (project) {
          onSubmit(projectData);
        } else {
        setSuccess("Project updated successfully!");
        setError("");
        const updatedProjects = await getUserProjects(user.uid);
        setProjects(updatedProjects);
        setInput1("");
        setDescription("");
        setCheckedUsers({});
        setRoleAssignments({ devs: [], scrumMasters: [], productManagers: [] });
        setSelectedRoles({});
        }
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
      roleAssignments.productManagers.length === 0 ||
      roleAssignments.productManagers.includes(userId)
    ) {
      availableRoles.push({ value: "productManagers", label: "Product Owner" });
    }
    return availableRoles;
  };

  useEffect(() => {
    if (project) {
      const initialCheckedUsers = {};
      const initialSelectedRoles = {};
      const newAssignments = { devs: [], scrumMasters: [], productManagers: [] };
  
      project.devs?.forEach(user => {
        initialCheckedUsers[user.id] = true;
        initialSelectedRoles[user.id] = "devs";
        newAssignments.devs.push(user.id);
      });
      project.scrumMasters?.forEach(user => {
        initialCheckedUsers[user.id] = true;
        initialSelectedRoles[user.id] = "scrumMasters";
        newAssignments.scrumMasters.push(user.id);
      });
      project.productManagers?.forEach(user => {
        initialCheckedUsers[user.id] = true;
        initialSelectedRoles[user.id] = "productManagers";
        newAssignments.productManagers.push(user.id);
      });
  
      console.log("Initial checked users:", initialCheckedUsers);
      setCheckedUsers(initialCheckedUsers);
      setSelectedRoles(initialSelectedRoles);
      setRoleAssignments(newAssignments);
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
                  const currentRole = selectedRoles[user.id] || "devs";
                  return (
                    <tr key={user.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checkedUsers[user.id] || false}
                          onChange={() => handleCheckboxChange(user.id)}                        
                            disabled={
                            project && 
                            user.id === auth.currentUser?.uid && 
                            roleAssignments.scrumMasters.includes(user.id) &&
                            selectedRoles[user.id] === "scrumMasters"
                          }
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.name}</td>
                      <td>{user.surname}</td>
                      <td>{user.email}</td>
                      <td>
                        {checkedUsers[user.id] ? (
                          <div className="select-container">
                          <select
                            className="select select--short"
                            value={selectedRoles[user.id] || "devs"}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={
                              project && 
                              user.id === auth.currentUser?.uid && 
                              roleAssignments.scrumMasters.includes(user.id) &&
                              selectedRoles[user.id] === "scrumMasters"
                            }
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
