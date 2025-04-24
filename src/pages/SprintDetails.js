import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSprintData,
  getProject,
  getStoriesForProject,
  assignUserStoryToSprint,
} from "../api.js";
import Button from '../components/Button.js';
import { formatDate } from "../utils/storyUtils.js";
import "./style/SprintDetails.css";
import './style/ProjectDetails.css';
import StoryDetailsComponent from '../components/StoryDetailsComponent.js';
import { FaEdit, FaTrash } from "react-icons/fa";
import {deleteSprint} from '../api.js'
import AddSprintForm from './AddSprintForm.js'

const SprintDetails = () => {
  const { projectName, sprintId } = useParams();
  const { user, loading } = useAuth();

  const [projectId, setProjectId] = useState(null);
  const [stories, setStories] = useState([]);
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [showIncludeStories, setShowIncludeStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sprintLoad, setSprintLoad] = useState(0);
  const navigate = useNavigate();

  // Track which user stories are selected (checked) for adding to sprint
  const [selectedStories, setSelectedStories] = useState([]);

  // Check if sprint is currently active
  const isSprintActive = () => {
    if (!sprint || !sprint.start_date || !sprint.end_date) return false;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const startDate = new Date(sprint.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(sprint.end_date); 
    endDate.setHours(1, 1, 1, 1);
  
    return currentDate >= startDate && currentDate <= endDate;
  };

  const isSprintNotStarted = () => {
    if (!sprint || !sprint.start_date) return false;
    const currentDate = new Date();
    const startDate = new Date(sprint.start_date);
    return currentDate < startDate;
  };

  useEffect(() => {
    if (sprint && role) {
      setCanEdit(role === "scrumMasters" && (isSprintNotStarted() || isSprintActive()));
    }
  }, [sprint, role]);
  
  // Calculate the total story points of stories already in the sprint
  const calculateSprintStoryPoints = () => {
    return sprintStories.reduce((total, story) => {
      return total + (story.storyPoints || 0);
    }, 0);
  };

  // Calculate the total story points of the selected stories
  const calculateSelectedStoryPoints = () => {
    return selectedStories.reduce((total, storyId) => {
      const story = stories.find((s) => s.id === storyId);
      return total + (story?.storyPoints || 0);
    }, 0);
  };

  // Check if adding a story would exceed the sprint's velocity
  const wouldExceedVelocity = (storyId) => {
    const story = stories.find((s) => s.id === storyId);
    const sprintPoints = calculateSprintStoryPoints();
    const selectedPoints = calculateSelectedStoryPoints();
    const totalPoints = sprintPoints + selectedPoints + (story?.storyPoints || 0);
    return totalPoints > sprint.velocity;
  };

  // Fetch Sprint Data
  useEffect(() => {
    if (sprintId) {
      const fetchSprintData = async () => {
        try {
          const data = await getSprintData(sprintId);
          setSprint(data.sprint);
        } catch (error) {
          setError(error.message);
        }
      };
      fetchSprintData();
    }
  }, [sprintId, isEditing]);

  // Fetch Project Info
  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        if (!projectName || !user?.uid) return;

        const projectData = await getProject(projectName, user.uid);
        setProjectId(projectData.project.id);

        setDevelopers(projectData.project.devs?.map((dev) => dev.username) || []);

        // Determine user role (prioritize Scrum Master role if user has multiple roles)
        if (projectData.project.scrumMasters?.some(sm => sm.id === user.uid)) {
          setRole("scrumMasters");
        } else if (projectData.project.productManagers?.some(pm => pm.id === user.uid)) {
          setRole("productManagers");
        } else if (projectData.project.devs?.some((dev) => dev.id === user.uid)) {
          setRole("devs");
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError("Failed to load project data. Please try again later.");
      }
    };
    fetchProjectInfo();
  }, [projectName, user]);

  // Fetch stories when projectId is available
  useEffect(() => {
    fetchStories();
  }, [projectId]);

  const fetchStories = async () => {
    if (!projectId) return;
    try {
      const { stories } = await getStoriesForProject(projectId);
      setStories(stories);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update story status
  const updateStoryStatus = (storyId) => {
    setStories((prevStories) =>
      prevStories.map((story) => {
        if (story.id === storyId) {
          let newStatus;
          if (["Backlog", "Product backlog"].includes(story.status)) {
            newStatus = "In progress";
          } else if (story.status === "In progress") {
            newStatus = "Done";
          } else {
            newStatus = "Done"; // Stays "Done" if already done
          }
          return { ...story, status: newStatus };
        }
        return story;
      })
    );
    fetchStories();
  };

  // Filter stories in the current sprint
  const sprintStories = stories.filter((story) => story.sprintId?.includes(sprintId));

  // Split stories into columns
  const todoStories = sprintStories.filter((story) =>
    ["Backlog", "Product backlog"].includes(story.status)
  );
  const doingStories = sprintStories.filter((story) => story.status === "In progress");
  const doneStories = sprintStories.filter((story) => story.status === "Done");

  useEffect(() => {
    if (sprintStories && sprintStories.length > 0) {
      const totalLoad = sprintStories.reduce((sum, story) => {
        return sum + (story.storyPoints || 0);
      }, 0);
      setSprintLoad(totalLoad);
    } else {
      setSprintLoad(0);
    }
  }, [sprintStories]);


  // Handle story click
  const handleStoryClick = (story) => {
    const active = isSprintActive();
  
    setSelectedStory((prevStory) =>
      prevStory?.id === story.id ? null : { ...story, isActive: active }
    );
  };

  // Handle checkbox change for adding stories to sprint
  const handleCheckboxChange = (storyId) => {
    if (selectedStories.includes(storyId)) {
      // Allow unselecting regardless of velocity
      setSelectedStories((prevSelected) =>
        prevSelected.filter((id) => id !== storyId)
      );
    } else {
      // Prevent selecting if it would exceed velocity
      if (!wouldExceedVelocity(storyId)) {
        setSelectedStories((prevSelected) => [...prevSelected, storyId]);
      }
    }
  };

  // Handle adding stories to sprint
  const handleAddToSprint = async () => {
    if (!sprintId || selectedStories.length === 0) return;

    try {
      for (const storyId of selectedStories) {
        await assignUserStoryToSprint(storyId, sprintId);
      }
      setSelectedStories([]);
      setShowIncludeStories(false);
      fetchStories();
    } catch (err) {
      console.error("Failed to add stories to sprint:", err);
      setError("Failed to add selected stories to sprint. Check console.");
    }
  };

  // Deselect story if it's not in the current sprint
  useEffect(() => {
    if (!showIncludeStories && selectedStory) {
      const notInAnySprint = stories.filter(
        (story) => !story.sprintId || story.sprintId.length === 0
      );
      if (notInAnySprint.some((story) => story.id === selectedStory.id)) {
        setSelectedStory(null);
      }
    }
  }, [showIncludeStories, selectedStory, stories, sprintId]);

  const getCategorizedSubtasks = () => {
    const allSubtasks = sprintStories.flatMap(story => 
      (story.subtasks || []).map(subtask => ({ 
        ...subtask, 
        storyName: story.name,
        storyId: story.id
      }))
    );
    return {
      unclaimed: allSubtasks.filter(subtask => subtask.devName==null && !subtask.isDone),
      claimed: allSubtasks.filter(subtask => subtask.devName!=null && !subtask.isDone && subtask.workdate == null),
      active: allSubtasks.filter(subtask => subtask.workdate!=null),
      completed: allSubtasks.filter(subtask => subtask.isDone)
    }
  }

  // Calculate the number of rows needed
  const maxRows = Math.max(todoStories.length, doingStories.length, doneStories.length);

  const handleDelete = async() => {
    let res = await deleteSprint(sprintId);
    if (res.sprint.success)
      navigate(-1);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter out "won't have this time" stories from the addition table
  const notInAnySprint = stories.filter(
    (story) => (!story.sprintId || story.sprintId.length === 0) && story.priority?.toLowerCase() !== "won't have this time"
  );

  return (
    <>
      {isEditing ? (
        <AddSprintForm projectId={projectId} projectName={projectName} sprint={sprint} onSprintAdded={()=>setIsEditing(false)}/>
      ) : (
        <>
          {showIncludeStories && (
            <div className="center--box">
              <h1>Add Stories to Sprint</h1>
              <div className="responsive-table-container3">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Include</th>
                      <th>Story Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notInAnySprint.map((story) => {
                      const hasPoints =
                        story.storyPoints !== undefined && story.storyPoints !== null;
                      const isDisabled =
                        !selectedStories.includes(story.id) &&
                        (wouldExceedVelocity(story.id) || !hasPoints);
                      const tooltip = isDisabled
                        ? wouldExceedVelocity(story.id)
                          ? "Cannot add story, because sprint velocity would be exceeded"
                          : "Missing story points"
                        : "";

                      return (
                        <tr
                          key={story.id}
                          className={selectedStory?.id === story.id ? "selected" : ""}
                        >
                          <td>
                            <input
                              type="checkbox"
                              disabled={isDisabled}
                              checked={selectedStories.includes(story.id)}
                              onChange={() => handleCheckboxChange(story.id)}
                              style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                              title={tooltip}
                            />
                          </td>
                          <td
                            onClick={() => handleStoryClick(story)}
                            style={{ color: hasPoints ? "inherit" : "gray" }}
                          >
                            {story.name}
                            {!hasPoints && (
                              <span style={{ marginLeft: "8px", color: "var(--color-accent)" }}>
                                (Missing story points)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button className="btn--block" onClick={handleAddToSprint}>
                Add Selected -&gt;
              </Button>
            </div>
          )}

          <div className="center--box">
                <div className="card--header">
                  <h1>Sprint Details</h1>
                  <div className="icons">
                    {canEdit && (
                      <>
                        <FaEdit 
                          title="Edit User Story" 
                          onClick={() => setIsEditing(true)}
                        />
                        {!isSprintActive() && (
                          <FaTrash 
                            className="p--alert"
                            title="Delete User Story" 
                            onClick={handleDelete}
                          />
                        )}
                      </>
                    )}
                  </div>
                {canEdit && role === "scrumMasters" && isSprintActive() && (
                  <Button
                    variant={"secondary"}
                    onClick={() => setShowIncludeStories((prev) => !prev)}
                    className={
                      showIncludeStories ? "add-button btn-left selected" : "add-button btn-left"
                    }
                    style={{ padding: '0.6rem 1.5rem', fontSize: '1.4rem', position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                  > 
                    <span className={showIncludeStories ? "rotated" : ""}>+</span>
                  </Button>
                )}
            </div>


            <div className="block--element">
              <div className="header-with-button">
                {error && <p style={{ color: "red" }}>Error: {error}</p>}

                {sprint ? (
                  <div>
                    <p>
                      <strong>Start Date: </strong>
                      {sprint?.start_date
                        ? formatDate(sprint.start_date)
                        : "No start date available"}
                    </p>
                    <p>
                      <strong>End Date: </strong>
                      {sprint?.end_date
                        ? formatDate(sprint.end_date)
                        : "No end date available"}
                    </p>
                    <p>
                    <strong>Capacity: </strong> 
                      <span>
                        {sprintLoad}/{sprint.velocity}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p>Loading sprint data...</p>
                )}
              </div>
            </div>
            {!isSprintNotStarted() && (
              <>
              <div className="responsive-table-container-wide">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>TODO</th>
                      <th>Doing</th>
                      <th>Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxRows }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>
                          {todoStories[rowIndex] && (
                            <div
                              onClick={() => handleStoryClick(todoStories[rowIndex])}
                              className={`userStory ${
                                selectedStory?.id === todoStories[rowIndex].id ? "selected" : ""
                              }`}
                            >
                              <h2>{todoStories[rowIndex].name}</h2>
                              <p>Priority: {todoStories[rowIndex].priority}</p>
                              <p>Business Value: {todoStories[rowIndex].businessValue}</p>
                            </div>
                          )}
                        </td>
                        <td>
                          {doingStories[rowIndex] && (
                            <div
                              onClick={() => handleStoryClick(doingStories[rowIndex])}
                              className={`userStory ${
                                selectedStory?.id === doingStories[rowIndex].id ? "selected" : ""
                              }`}
                            >
                              <h2>{doingStories[rowIndex].name}</h2>
                              <p>Priority: {doingStories[rowIndex].priority}</p>
                              <p>Business Value: {doingStories[rowIndex].businessValue}</p>
                            </div>
                          )}
                        </td>
                        <td>
                          {doneStories[rowIndex] && (
                            <div
                              onClick={() => handleStoryClick(doneStories[rowIndex])}
                              className={`userStory ${
                                selectedStory?.id === doneStories[rowIndex].id ? "selected" : ""
                              }`}
                            >
                              <h2>{doneStories[rowIndex].name}</h2>
                              <p>Priority: {doneStories[rowIndex].priority}</p>
                              <p>Business Value: {doneStories[rowIndex].businessValue}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                  <h2>Subtasks Overview</h2>
                  
                  <div className="subtasks-container">
                    {Object.entries(getCategorizedSubtasks()).map(([status, subtasks]) => (
                      <div key={status} className="subtask-column">
                        <h3>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </h3>
                        <ul className="subtask-list">
                          {subtasks.length > 0 ? (
                            subtasks.map((subtask, index) => (
                              <li key={`${status}-${index}`} className="subtask-item">
                                  <h4>{subtask.title}</h4>
                                  <p className="subtask-story">{subtask.description} [{subtask.timeEstimate}h] (from:{subtask.storyName})</p>
                              </li>
                            ))
                          ) : (
                            <li className="subtask-empty">
                              No {status} subtasks
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
              </>            
            )}
          </div>

          {selectedStory && (
            <StoryDetailsComponent
              story={selectedStory}
              userRole={role}
              onUpdate={updateStoryStatus}
              projectDevelopers={developers}
            />
          )}
        </>
      )}
    </>
  );
}
export default SprintDetails;