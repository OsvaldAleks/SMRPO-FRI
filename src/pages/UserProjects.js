import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProjects } from "../api"; 
import { Link } from 'react-router-dom';

const ProjectDetails = () => {
    const [user, setUser] = useState(null);
    const [userProjects, setUserProjects] = useState([]); // State to store user projects

    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
  
        if (currentUser) {
          getUserProjects(currentUser.uid).then((projects) => {
            setUserProjects(projects);
          }).catch((error) => {
            console.error("Error fetching user projects:", error);
          });
        } else {
          setUserProjects([]);
        }
      });
  
      return () => unsubscribe();
    }, []);

    /*
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!project) {
    return <div>No projects found.</div>;
  }
*/

  return (
    <div>
      <h1>Your projects</h1>
      {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <p key={project.projectId}>
                    <Link to={`../project/`+project.projectName}>{project.projectName}</Link>
                  </p>
                ))
              ) : (
                <li>No projects found</li>
              )}
    </div>
  );
};

export default ProjectDetails;