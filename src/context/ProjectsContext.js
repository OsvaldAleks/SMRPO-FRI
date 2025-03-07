import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProjects } from "../api";

export const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userProjects = await getUserProjects(currentUser.uid);
          setProjects(userProjects);
        } catch (error) {
          console.error("Failed to fetch user projects:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setProjects([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, setProjects, loading }}>
      {children}
    </ProjectsContext.Provider>
  );
};