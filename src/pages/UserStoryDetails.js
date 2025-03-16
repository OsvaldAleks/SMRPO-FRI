import { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserStory } from "../api.js";
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

  useEffect(() => {
    if (!storyId) return;

    // Fetch the user story
    getUserStory(storyId)
      .then((data) => {
        setStory(data);

        // Wait for projects to be available before checking
        if (projects.length === 0) {
          console.log("Projects not loaded yet");
          return;
        }

        const currentProject = projects.find(project => project.projectId === data.projectId);

        if (currentProject) {
          setRole(currentProject.userRole);
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
    <StoryDetailsComponent story={story} userRole={role}/>
  );
};

export default UserStoryDetails;
