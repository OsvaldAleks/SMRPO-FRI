import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getProject, getSprintsForProject, getStoriesForProject } from "../api";
import { formatDate } from "../utils/storyUtils.js";
import './style/ProjectDetails.css';
import AddSprintForm from "./AddSprintForm";
import UserStoryForm from "./UserStoryForm";

const ProjectDetails = () => {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]); // Add state for stories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isScrumMaster, setIsScrumMaster] = useState(false);
  const [isProductManager, setIsProductManager] = useState(false);
  const [showForm, setShowForm] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    setIsScrumMaster(false);
    setIsProductManager(false);
  }, [projectName]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && projectName) {
        setUser(currentUser);
        fetchProject(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [projectName]);

  useEffect(() => {
    if (project) {
      fetchSprints();
      fetchStories(); // Fetch stories when project is available
    }
  }, [project]);

  const handleToggleForm = (formType) => {
    setShowForm((prev) => (prev === formType ? 0 : formType));
  };

  const fetchProject = async (uid) => {
    try {
      if (!projectName) {
        throw new Error("Project name is undefined");
      }

      const projectData = await getProject(projectName, uid);

      if (projectData.project.scrumMasters?.some((sm) => sm.id === uid)) {
        setIsScrumMaster(true);
      }
      if (projectData.project.productManagers?.some((sm) => sm.id === uid)) {
        setIsProductManager(true);
      }

      setProject(projectData.project);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError("Failed to load project data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSprints = async () => {
    try {
      if (!project) {
        throw new Error("Project data is not available.");
      }

      const sprintsData = await getSprintsForProject(project.id);

      const sortedSprints = (sprintsData.sprint || []).sort((a, b) => {
        return a.start_date.localeCompare(b.start_date);
      });

      setSprints(sortedSprints);
    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      setError("Failed to load sprints. Please try again later.");
    }
  };

  const fetchStories = async () => {
    try {
      if (!project) {
        throw new Error("Project data is not available.");
      }

      const storiesData = await getStoriesForProject(project.id); // Assuming this API exists

      const sortedStories = (storiesData.stories || []).sort((a, b) => {
        return a.name.localeCompare(b.name); // You can adjust sorting logic based on your needs
      });

      setStories(sortedStories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      setError("Failed to load stories. Please try again later.");
    }
  };

  const handleSprintClick = (sprintId) => {
    navigate(`/project/${projectName}/sprint/${sprintId}`);
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
    <>
      <div className="center--box">
        <h1>{project.name}</h1>
        <h2>Members</h2>
        <div className="roles-grid">
          {/* Product Managers */}
          <div>
            <h2>Project Managers</h2>
            <ul>
              {project.productManagers && project.productManagers.length > 0 ? (
                project.productManagers.map((user) => (
                  <li key={user.id}>{user.username}</li>
                ))
              ) : (
                <li>No managers assigned</li>
              )}
            </ul>
          </div>

          {/* SCRUM Masters */}
          <div>
            <h2>SCRUM Masters</h2>
            <ul>
              {project.scrumMasters && project.scrumMasters.length > 0 ? (
                project.scrumMasters.map((user) => (
                  <li key={user.id}>{user.username}</li>
                ))
              ) : (
                <li>No SCRUM Masters assigned</li>
              )}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h2>Developers</h2>
            <ul>
              {project.devs && project.devs.length > 0 ? (
                project.devs.map((user) => (
                  <li key={user.id}>{user.username}</li>
                ))
              ) : (
                <li>No developers assigned</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <h2>Sprints</h2>
          <div className="grid-container">
            {sprints.length > 0 ? (
              sprints.map((sprint, index) => (
                <div
                  key={sprint.id}
                  className="grid-item sprint"
                  onClick={() => handleSprintClick(sprint.id)}
                >
                  <h2>Sprint #{index + 1}</h2>
                  <p><strong>Start Date:</strong> {formatDate(sprint.start_date)}</p>
                  <p><strong>End Date:</strong> {formatDate(sprint.end_date)}</p>
                </div>
              ))
            ) : (
              <p>No sprints found for this project.</p>
            )}
            {/* Add Sprint Button */}
            {(isScrumMaster || isProductManager) && (
                <button
                  className={showForm === 1 ? "add-button selected" : "add-button"}
                  onClick={() => handleToggleForm(1)}
                >
                  <span className={showForm === 1 ? "rotated" : ""}>+</span>
                </button>
              )}
          </div>

          <div>
            <h2>Stories</h2>
            <div className="grid-container">
              {stories.length > 0 ? (
                stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="grid-item story"
                  >
                    <h2>{story.name}</h2>
                    <p>{story.description}</p>
                  </div>
                ))
              ) : (
                <p>No stories found for this project.</p>
              )}
              {/* Add Story Button */}
              {(isScrumMaster || isProductManager) && (
                <button
                  className={showForm === 2 ? "add-button selected" : "add-button"}
                  onClick={() => handleToggleForm(2)}
                >
                  <span className={showForm === 2 ? "rotated" : ""}>+</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm === 1 && (
        <AddSprintForm
          projectName={projectName}
          onSprintAdded={() => {
            setShowForm(0);
            fetchSprints();
          }}
        />
      )}

      {showForm === 2 && (
        <UserStoryForm
          projectId={project.id}
          onStoryAdded={() => {
            setShowForm(0);
            fetchStories();
          }}
        />
      )}
    </>
  );
};

export default ProjectDetails;
