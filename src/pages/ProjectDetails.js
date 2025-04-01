import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getProject, getSprintsForProject, getStoriesForProject } from "../api";
import { getUserStatus, deleteProject } from "../api";
import { formatDate } from "../utils/storyUtils.js";
import Button from '../components/Button.js';
import Card from '../components/Card.js';
import './style/ProjectDetails.css';
import AddSprintForm from "./AddSprintForm";
import UserStoryForm from "./UserStoryForm";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


const ProjectDetails = () => {
  const { user } = useAuth();
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrumMaster, setIsScrumMaster] = useState(false);
  const [isProductManager, setIsProductManager] = useState(false);
  const [showForm, setShowForm] = useState(0);
  const [userStatuses, setUserStatuses] = useState({});
  const [showWontHaveStories, setShowWontHaveStories] = useState(false);
  const [showUncompletedStories, setShowUncompletedStories] = useState(true);
  const [showCompletedStories, setShowCompletedStories] = useState(true);
  const [realized, setRealized] = useState([]);
  const [assignedToActive, setAssignedToActive] = useState([]);
  const [unassigned, setUnassigned] = useState([]);


  const navigate = useNavigate();

  useEffect(() => {
    setProject(null);
    setSprints([]);
    setStories([]);
    setIsScrumMaster(false);
    setIsProductManager(false);
    setLoading(true);
    setError(null);
  }, [projectName]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && projectName) {
        fetchProject(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [projectName]);

  useEffect(() => {
    if (project) {
      fetchSprints();
      fetchStories();
      handleToggleForm(0);
    }
  }, [project]);

  useEffect(() => {
    if (!stories || !project) return;
  
    const activeSprintId = project.activeSprintId;
  
    const realizedStories = stories.filter(s => s.status === "Done" && s.isAccepted === true);
    const assigned = stories.filter(s => s.sprintId === activeSprintId && !(s.status === "Done" && s.isAccepted));
    const unassigned = stories.filter(s => (!s.sprintId || s.sprintId !== activeSprintId) && !(s.status === "Done" && s.isAccepted));
  
    setRealized(realizedStories);
    setAssignedToActive(assigned);
    setUnassigned(unassigned);
  }, [stories, project]);

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

  const fetchProject = async (uid) => {
    try {
      if (!projectName) {
        throw new Error("Project name is undefined");
      }

      const projectData = await getProject(projectName, uid);

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

  const wontHaveStories = stories.filter(
    (story) => story.priority?.toLowerCase() === "won't have this time"
  );

  const filteredStories = stories.filter(
    (story) => story.priority?.toLowerCase() !== "won't have this time"
  );

  const completedStories = filteredStories.filter((story) => story.status === "Completed");
  const storiesWithSprint = filteredStories.filter(
    (story) => story.sprintId && story.sprintId.length > 0 && story.status !== "Completed"
  );
  const storiesWithoutSprint = filteredStories.filter(
    (story) => (!story.sprintId || story.sprintId.length === 0) && story.status !== "Completed"
  );

  return (
    <>
      <div className="center--box">
            <div className="card--header">
              <h1>{project.name}</h1>
              {/* Show edit icon only for SCRUM masters or project managers when story has no sprintId */}
              <div className="icons">
                {(user?.system_rights === 'Admin' || isScrumMaster) && (
                  <>
                    <FaEdit 
                      title="Edit User Story" 
                    />
                  </>
                )}
              </div>
            </div>
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
            <h2>Product Owner</h2>
            <ul>
              {project.productManagers && project.productManagers.length > 0 ? (
                project.productManagers.map(renderUserWithStatus)
              ) : (
                <li>No Product Owner assigned</li>
              )}
            </ul>
          </div>

          {/* SCRUM Masters */}
          <div>
            <h2>SCRUM Master</h2>
            <ul>
              {project.scrumMasters && project.scrumMasters.length > 0 ? (
                project.scrumMasters.map(renderUserWithStatus)
              ) : (
                <li>No SCRUM Master assigned</li>
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
        <div className="block--element">
          <div className="header-with-button">
            <h2>Sprints</h2>
            {isScrumMaster && (
              <Button
                variant={"secondary"}
                onClick={() => handleToggleForm(1)}
                className={showForm === 1 ? "add-button selected" : "add-button"}
              >
                <span className={showForm === 1 ? "rotated" : ""}>+</span>
              </Button>
            )}
          </div>
          </div>
          <div className="project-list">
            {sprints.length > 0 ? (
              sprints.map((sprint, index) => (
                <Card
                  key={sprint.id}
                  title={'Sprint #'+(index + 1)}
                  onClick={() => handleSprintClick(sprint.id)}
                  colorScheme="card--secondary"
                  extraText={["Start Date: ", "End Date: "]}
                  extraContent={[formatDate(sprint.start_date), formatDate(sprint.end_date)]}
                />
            ))
            ) : (
              <p>No sprints found for this project.</p>
            )}
        </div>
          {/* --- Stories --- */}
          <div className="block--element">
            <div className="header-with-button">
              <h2>Stories</h2>
              {(isScrumMaster || isProductManager) && (
                <Button
                  variant={"secondary"}
                  onClick={() => handleToggleForm(2)}
                  className={showForm === 2 ? "add-button selected" : "add-button"}
                >
                  <span className={showForm === 2 ? "rotated" : ""}>+</span>
                </Button>
              )}
            </div>
            </div>

            {/* UNCOMPLETED STORIES DROPDOWN */}
            {(storiesWithSprint.length > 0 || storiesWithoutSprint.length > 0 || wontHaveStories.length > 0) && (
              <>
            <div style={{ marginBottom: "1rem" }}>
              <h2
                style={{ cursor: "pointer" }}
                onClick={() => setShowUncompletedStories(!showUncompletedStories)}
              >
                {showUncompletedStories ? "▼" : "▶"} UNCOMPLETED
              </h2>

                {showUncompletedStories && wontHaveStories.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <h3
                    style={{ cursor: "pointer"}}
                    onClick={() => setShowWontHaveStories(!showWontHaveStories)}
                  >
                    {showWontHaveStories ? "▼" : "▶"} Won't Have This Time Stories
                  </h3>
                  {showWontHaveStories && (
                    <div className="project-list">
                      {wontHaveStories.length > 0 && (
                        wontHaveStories.map((story) => (
                          <Card
                            key={story.id}
                            title={story.name}
                            description={story.description}
                            onClick={() => handleStoryClick(story.id)}
                            colorScheme="card--primary"
                            />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}


              {showUncompletedStories && (
                <>
                  {storiesWithoutSprint.length > 0 && (
                    <>
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
                            colorScheme="card--primary"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {storiesWithSprint.length > 0 && (
                    <>
                      <h3>Stories in Sprints</h3>
                      <div className="project-list">
                        {storiesWithSprint.map((story) => (
                          <Card
                            key={story.id}
                            title={story.name}
                            description={story.description}
                            onClick={() => handleStoryClick(story.id)}
                            colorScheme="card--primary"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            </>
          )}
            {/* COMPLETED STORIES DROPDOWN */}
            {completedStories.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <h2
                style={{ cursor: "pointer" }}
                onClick={() => setShowCompletedStories(!showCompletedStories)}
              >
                {showCompletedStories ? "▼" : "▶"} COMPLETED
              </h2>
              
              {showCompletedStories && (
                <div className="project-list">
                  {completedStories.map((story) => {
                    const sprint = sprints.find((sprint) => sprint.id == story.sprintId);
                    const sprintTitle = sprint ? `Sprint #${sprints.indexOf(sprint) + 1}` : "unset";
                    return (
                      <Card
                        key={story.id}
                        title={story.name}
                        description={story.description}
                        onClick={() => handleStoryClick(story.id)}
                        colorScheme="card--primary"
                        extraText={'Completed: '}
                        extraContent={sprintTitle}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            )}
            {stories.length == 0 &&  
              <p>No stories found for this project.</p>
            }
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