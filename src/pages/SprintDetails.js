import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import {
  getSprintData,
  getProject,
  getStoriesForProject,
  assignUserStoryToSprint,
} from "../api.js";
import Button from '../components/Button.js'
import { formatDate } from "../utils/storyUtils.js";
import "./style/SprintDetails.css";

const SprintDetails = () => {
  const { projectName, sprintId } = useParams();
  const { user, loading } = useAuth();

  const [projectId, setProjectId] = useState(null);
  const [stories, setStories] = useState([]);
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState(null);
  const [isScrumMaster, setIsScrumMaster] = useState(false);
  const [showIncludeStories, setShowIncludeStories] = useState(false);

  // Track which user stories are selected (checked) for adding to sprint
  const [selectedStories, setSelectedStories] = useState([]);

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
  }, [sprintId]);

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        if (!projectName || !user?.uid) return;

        const projectData = await getProject(projectName, user.uid);
        const fetchedProjectId = projectData.project.id;
        setProjectId(fetchedProjectId);

        // Check if user is a scrum master
        if (projectData.project.scrumMasters?.some((sm) => sm.id === user.uid)) {
          setIsScrumMaster(true);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError("Failed to load project data. Please try again later.");
      }
    };

    fetchProjectInfo();
  }, [projectName, user]);

  useEffect(() => {
    // Now that we have projectId, fetch user stories
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

  // 1) Filter out the stories actually assigned to this sprint
  //    (assuming 'sprintId' in each story is an array)
  const sprintStories = stories.filter((story) =>
    story.sprintId?.includes(sprintId)
  );

  // 2) Optionally group them by status to show them in separate columns
  //    Adjust these filters to match your real statuses
  const todoStories = sprintStories.filter((story) =>
    ["Backlog", "Product backlog"].includes(story.status)
  );
  const doingStories = sprintStories.filter((story) =>
    ["Sprint backlog", "Coding", "Testing"].includes(story.status)
  );
  const doneStories = sprintStories.filter(
    (story) => story.status === "Done"
  );

  // Handle checkbox changes in the "Add story to sprint" panel
  const handleCheckboxChange = (storyId) => {
    setSelectedStories((prevSelected) =>
      prevSelected.includes(storyId)
        ? prevSelected.filter((id) => id !== storyId)
        : [...prevSelected, storyId]
    );
  };

  const handleAddToSprint = async () => {
    if (!sprintId || selectedStories.length === 0) return;

    try {
      for (const storyId of selectedStories) {
        await assignUserStoryToSprint(storyId, sprintId);
      }
      // Optionally re-fetch or reset
      setSelectedStories([]);
      setShowIncludeStories(false);
      fetchStories();
    } catch (err) {
      console.error("Failed to add stories to sprint:", err);
      setError("Failed to add selected stories to sprint. Check console.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const notInThisSprint = stories.filter(
    (story) => !story.sprintId?.includes(sprintId)
  );

  return (
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
                {/* 2) Render only 'notInThisSprint' */}
                {notInThisSprint.map((story) => (
                  <tr key={story.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStories.includes(story.id)}
                        onChange={() => handleCheckboxChange(story.id)}
                      />
                    </td>
                    <td>{story.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleAddToSprint}>Add Selected -></Button>
        </div>
      )}

      <div className="center--box">
        <h1>Sprint Details</h1>
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
              <strong>Velocity: </strong> {sprint.velocity}
            </p>
          </div>
        ) : (
          <p>Loading sprint data...</p>
        )}

        {/* 3) Show them in your columns */}
        <div className="responsive-table-container-sprints">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>TODO</th>
                <th>Doing</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
            {todoStories.map((story) => (
              <tr key={story.id}>
                {story.status == "Product backlog" ? (
                  <td>
                    <div className="userStory">
                      <h2>{story.name}</h2>
                      <p>Priority: {story.priority}</p>
                      <p>Business Value: {story.businessValue}</p>
                    </div>
                  </td>
                ) : null}

                {story.status == "" ? ( // Replace with a valid status
                  <td>
                    <div className="userStory">
                      <h2>{story.name}</h2>
                      <p>Priority: {story.priority}</p>
                      <p>Business Value: {story.businessValue}</p>
                    </div>
                  </td>
                ) : null}

                {story.status == "" ? ( // Replace with a valid status
                  <td>
                    <div className="userStory">
                      <h2>{story.name}</h2>
                      <p>Priority: {story.priority}</p>
                      <p>Business Value: {story.businessValue}</p>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}

              {isScrumMaster && (
                <tr>
                  <td>
                    {/* The + button that toggles the "Add stories" panel */}
                    <div
                      className={`userStory plus-button ${showIncludeStories ? "selected" : ""
                        }`}
                      onClick={() => setShowIncludeStories((prev) => !prev)}
                    >
                      <span>+</span>
                    </div>
                  </td>
                  {/* The other columns can be empty for that row */}
                  <td></td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optional bottom section (remove if you don't need it) */}
      <div className="center--box">
        <h1>User Story</h1>
        <h2>Name of story</h2>
      </div>
    </>
  );
};

export default SprintDetails;
