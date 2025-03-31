import { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserStory, getProject } from "../api.js";
import { useParams } from "react-router-dom";
import StoryDetailsComponent from '../components/StoryDetailsComponent.js';
import { ProjectsContext } from "../context/ProjectsContext.js";

const UserStoryDetails = () => {
  const { user, loading: authLoading } = useAuth();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const { projects, loading: projectsLoading } = useContext(ProjectsContext);
  const [role, setRole] = useState(null);
  const [developers, setDevelopers] = useState([]);

  const updateStory = (updatedStory) => {
    setStory(updatedStory);
  };

  useEffect(() => {
    if (!storyId) return;
    getUserStory(storyId)
      .then((data) => {
        setStory(data);
        if (projects.length === 0) {
          console.log("Projects not loaded yet");
          return;
        }

        const currentProject = projects.find(project => project.projectId === data.projectId);

        if (currentProject) {
          setRole(currentProject.userRole);
          getProject(currentProject.projectName, user.uid)
            .then((projectData) => {
              setDevelopers(projectData.project.devs.map(dev => dev.username) || []);
            })
            .catch((err) => setError(err.message));
        } else {
          setRole(null);
        }
      })
      .catch((err) => setError(err.message));
  }, [storyId, projects, user.id]);

  if (authLoading || projectsLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!story) return <p>Loading story details...</p>;

  return (
    <StoryDetailsComponent story={story} userRole={role} projectDevelopers={developers} onUpdateStory={updateStory} />
  );
};

export default UserStoryDetails;