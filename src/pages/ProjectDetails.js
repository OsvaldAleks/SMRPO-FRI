import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getProject, getSprintsForProject } from "../api";
import './style/ProjectDetails.css';
import AddSprintForm from "./AddSprintForm";

const ProjectDetails = () => {
  const { projectName } = useParams();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isScrumMaster, setIsScrumMaster] = useState(false);
  const [isProductManager, setIsProductManager] = useState(false);
  const [showAddSprintForm, setShowAddSprintForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsScrumMaster(false);
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
    }
  }, [project]);

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
      <div className="sprints-grid">
        {sprints.length > 0 ? (
          sprints.map((sprint, index) => (
            <div
              key={sprint.id}
              className="sprint-box"
              onClick={() => handleSprintClick(sprint.id)}
            >
              <h2>Sprint #{index + 1}</h2>
              <p>
                <strong>Start Date:</strong>{" "}
                {sprint.start_date
                  ? sprint.start_date
                  : "No start date available"}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {sprint.end_date
                  ? sprint.end_date
                  : "No end date available"}
              </p>
            </div>
          ))
        ) : !isScrumMaster && (
          <p>No sprints found for this project.</p>
        )}

        {/* Add Sprint Button */}
        {isScrumMaster && (
          <button
            className="add-sprint-button"
            onClick={() => setShowAddSprintForm(!showAddSprintForm)}
          >
            <span className={showAddSprintForm ? "rotated" : ""}>+</span>
          </button>

        )}
      </div>

      <div>
      <h2>Stories</h2>
      <div className="sprints-grid">
        {/* Add Sprint Button */}
        {(isScrumMaster || isProductManager) && (
          <button
            className="add-sprint-button"
          >
            +
          </button>
        )}
        </div>
      </div>
      </div>
    </div>
    {showAddSprintForm && (
      <AddSprintForm
        projectName={projectName}
        onSprintAdded={() => {
          setShowAddSprintForm(false);
          fetchSprints();
        }}
      />
    )}

    </>
  );
};

export default ProjectDetails;