import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProject } from "../api";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProjectDetails = () => {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && projectName) { // Check if projectName is defined
        setUser(currentUser);
        fetchProject(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [projectName]); // Add projectName to the dependency array

  const fetchProject = async (uid) => {
    try {
      if (!projectName) {
        throw new Error("Project name is undefined");
      }

      const projectData = await getProject(projectName, uid);

      setProject(projectData.project);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError("Failed to load project data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!projectName) {
    return <div>Project name is missing in the URL.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <h2>Project managers</h2>
      {project.productManagers && project.productManagers.length > 0 ? (
        <ul>
          {project.productManagers.map((user, index) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      ) : (
        <></>
      )}
      <h2>SCRUM masters</h2>
      {project.scrumMasters && project.scrumMasters.length > 0 ? (
        <ul>
          {project.scrumMasters.map((user, index) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      ) : (
        <></>
      )}
      <h2>Developers</h2>
      {project.devs && project.devs.length > 0 ? (
        <ul>
          {project.devs.map((user, index) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ProjectDetails;