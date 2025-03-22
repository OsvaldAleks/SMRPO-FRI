import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getProject, getSprintsForProject, getStoriesForProject } from "../api";
import { getUserStatus } from "../api";
import { formatDate } from "../utils/storyUtils.js";
import Button from '../components/Button.js';
import Card from '../components/Card.js';
import './style/ProjectDetails.css';
import AddSprintForm from "./AddSprintForm";
import UserStoryForm from "./UserStoryForm";

const ProjectDetails = () => {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isScrumMaster, setIsScrumMaster] = useState(false);
  const [isProductManager, setIsProductManager] = useState(false);
  const [showForm, setShowForm] = useState(0);
  const [userStatuses, setUserStatuses] = useState({});
  const [showWontHaveStories, setShowWontHaveStories] = useState(false); // State for dropdown visibility

  const navigate = useNavigate();

  // Ob vsaki spremembi parametra projectName resetiramo state
  useEffect(() => {
    setProject(null);
    setSprints([]);
    setStories([]);
    setIsScrumMaster(false);
    setIsProductManager(false);
    setLoading(true);
    setError(null);
  }, [projectName]);

  // Ko se user spremeni (auth) ali projectName, preberemo projekt
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

  // Ko imamo project, naložimo sprinte in user stories
  useEffect(() => {
    if (project) {
      fetchSprints();
      fetchStories();
      handleToggleForm(0);
    }
  }, [project]);

  // Naložimo "online/offline" status za vse člane projekta
  useEffect(() => {
    const fetchUserStatuses = async () => {
      if (!project) return;
      const users = [
        ...(project.devs || []),
        ...(project.scrumMasters || []),
        ...(project.productManagers || []),
      ];
      const statuses = {};

      for (const usr of users) {
        const statusData = await getUserStatus(usr.id);
        statuses[usr.id] = statusData.status === "online";
      }

      setUserStatuses(statuses);
    };

    fetchUserStatuses();
  }, [project]);

  const renderUserWithStatus = (usr) => (
    <li key={usr.id}>
      <span
        style={{
          height: "10px",
          width: "10px",
          backgroundColor: userStatuses[usr.id] ? 'var(--color-secondary)' : "var(--color-accent)",
          borderRadius: "50%",
          display: "inline-block",
          marginRight: "8px",
        }}
      />
      {usr.username}
    </li>
  );

  const handleToggleForm = (formType) => {
    setShowForm((prev) => (prev === formType ? 0 : formType));
  };

  // Preberemo projekt iz backenda
  const fetchProject = async (uid) => {
    try {
      if (!projectName) {
        throw new Error("Project name is undefined");
      }

      const projectData = await getProject(projectName, uid);

      // Preverimo, ali je user Scrum Master ali Product Manager
      if (projectData.project.scrumMasters?.some((sm) => sm.id === uid)) {
        setIsScrumMaster(true);
      }
      if (projectData.project.productManagers?.some((pm) => pm.id === uid)) {
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

  // Naložimo sprinte
  const fetchSprints = async () => {
    try {
      if (!project) {
        throw new Error("Project data is not available.");
      }

      const sprintsData = await getSprintsForProject(project.id);

      const sortedSprints = (sprintsData.sprint || []).sort((a, b) =>
        a.start_date.localeCompare(b.start_date)
      );

      setSprints(sortedSprints);
    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      setError("Failed to load sprints. Please try again later.");
    }
  };

  // Naložimo user stories
  const fetchStories = async () => {
    try {
      if (!project) {
        throw new Error("Project data is not available.");
      }

      const storiesData = await getStoriesForProject(project.id);

      const sortedStories = (storiesData.stories || []).sort((a, b) => {
        return a.name.localeCompare(b.name);
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

  const handleStoryClick = (storyId) => {
    navigate(`/story/${storyId}`);
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

  // Filter stories with priority "won't have this time" (case-insensitive)
  const wontHaveStories = stories.filter(
    (story) => story.priority?.toLowerCase() === "won't have this time"
  );

  // Filter out "won't have this time" stories from other sections
  const filteredStories = stories.filter(
    (story) => story.priority?.toLowerCase() !== "won't have this time"
  );

  // Filtri za prikaz (excluding "won't have this time" stories)
  const completedStories = filteredStories.filter((story) => story.status === "Completed");
  const storiesWithSprint = filteredStories.filter(
    (story) => story.sprintId && story.sprintId.length > 0 && story.status !== "Completed"
  );
  const storiesWithoutSprint = filteredStories.filter(
    (story) => (!story.sprintId || story.sprintId.length === 0) && story.status !== "Completed"
  );

  return (
    <>
      <div className="center--box dashboard--box">
        <h1>{project.name}</h1>
        <div className="project-description-container">
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}
        </div>

        {/* --- Members --- */}
        <h2>Members</h2>
        <div className="roles-grid">
          {/* Product Managers */}
          <div>
            <h2>Product Owners</h2>
            <ul>
              {project.productManagers && project.productManagers.length > 0 ? (
                project.productManagers.map(renderUserWithStatus)
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
                project.scrumMasters.map(renderUserWithStatus)
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
                project.devs.map(renderUserWithStatus)
              ) : (
                <li>No developers assigned</li>
              )}
            </ul>
          </div>
        </div>

        {/* --- Sprints --- */}
        <div>
          <h2>Sprints</h2>
          {isScrumMaster && (
            <div className="btn-container">
              <div className="btn--left"></div>
              <div className="btn--right">
                <Button
                  variant={"secondary"}
                  onClick={() => handleToggleForm(1)}
                  className={showForm === 1 ? "add-button selected" : "add-button"}
                >
                  <span className={showForm === 1 ? "rotated" : ""}>+</span>
                </Button>
              </div>
            </div>
          )}
          <div className="grid-container">
            {sprints.length > 0 ? (
              sprints.map((sprint, index) => (
                <div
                  key={sprint.id}
                  className="grid-item sprint"
                  onClick={() => handleSprintClick(sprint.id)}
                >
                  <h2>Sprint #{index + 1}</h2>
                  <p>
                    <strong>Start Date:</strong> {formatDate(sprint.start_date)}
                  </p>
                  <p>
                    <strong>End Date:</strong> {formatDate(sprint.end_date)}
                  </p>
                </div>
              ))
            ) : (
              !isScrumMaster && <p>No sprints found for this project.</p>
            )}
          </div>

          {/* --- Stories --- */}
          <div>
            <h2>Stories</h2>
            {(isScrumMaster || isProductManager) && (
              <div className="btn-container">
                <div className="btn--left"></div>
                <div className="btn--right">
                  <Button
                    variant={"secondary"}
                    onClick={() => handleToggleForm(2)}
                    className={showForm === 2 ? "add-button selected" : "add-button"}
                  >
                    <span className={showForm === 2 ? "rotated" : ""}>+</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Dropdown for "won't have this time" stories */}
            <div style={{ marginBottom: "1rem" }}>
              <h3
                style={{ cursor: "pointer"}}
                onClick={() => setShowWontHaveStories(!showWontHaveStories)}
              >
                {showWontHaveStories ? "▼" : "▶"} Won't Have This Time Stories
              </h3>
              {showWontHaveStories && (
                <div className="project-list">
                  {wontHaveStories.length > 0 ? (
                    wontHaveStories.map((story) => (
                      <Card
                        key={story.id}
                        title={story.name}
                        description={story.description}
                        onClick={() => handleStoryClick(story.id)}
                      />
                    ))
                  ) : (
                    <p>No stories with priority "won't have this time".</p>
                  )}
                </div>
              )}
            </div>

            <h3>Stories not in Sprints</h3>
            <div className="project-list">
              {storiesWithoutSprint.map((story) => (
                <Card
                  key={story.id}
                  title={story.name}
                  description={story.description}
                  onClick={() => handleStoryClick(story.id)}
                  extraText="Story Points: "
                  extraContent={story.storyPoints || "unset"}
                />
              ))}
            </div>

            <h3>Stories in Sprints</h3>
            <div className="project-list">
              {storiesWithSprint.length > 0 ? (
                storiesWithSprint.map((story) => (
                  <Card
                    key={story.id}
                    title={story.name}
                    description={story.description}
                    onClick={() => handleStoryClick(story.id)}
                  />
                ))
              ) : (
                <p>No stories with sprint found for this project.</p>
              )}
            </div>

            {/* --- NEW: Completed Stories --- */}
            <h3>Completed Stories</h3>
            <div className="project-list">
              {completedStories.length > 0 ? (
                completedStories.map((story) => (
                  <Card
                    key={story.id}
                    title={story.name}
                    description={story.description}
                    onClick={() => handleStoryClick(story.id)}
                  />
                ))
              ) : (
                <p>No completed stories found for this project.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Add Sprint Form (pop-up) --- */}
      {showForm === 1 && (
        <AddSprintForm
          projectId={project.id}
          projectName={projectName}
          onSprintAdded={() => {
            setShowForm(0);
            fetchSprints();
          }}
        />
      )}

      {/* --- Add Story Form (pop-up) --- */}
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