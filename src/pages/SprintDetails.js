import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import {
  getSprintData,
  getProject,
  getStoriesForProject,
  // Import the assign call here:
  assignUserStoryToSprint,
} from "../api.js";
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

  // NEW: Track which user stories are selected (checked)
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
    const fetchStories = async () => {
      if (!projectId) return;
      try {
        const { stories } = await getStoriesForProject(projectId);
        setStories(stories);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStories();
  }, [projectId]);

  // NEW: Handle checkbox changes
  const handleCheckboxChange = (storyId) => {
    setSelectedStories((prevSelected) => {
      if (prevSelected.includes(storyId)) {
        // Already selected? then unselect
        return prevSelected.filter((id) => id !== storyId);
      } else {
        // Not selected? then add it
        return [...prevSelected, storyId];
      }
    });
  };

  // NEW: Assign selected stories to the sprint
  const handleAddToSprint = async () => {
    if (!sprintId || selectedStories.length === 0) return;

    try {
      // For each selected story, call your API to assign it
      for (const storyId of selectedStories) {
        await assignUserStoryToSprint(storyId, sprintId);
      }
      // Optionally re-fetch stories or reset selections
      setSelectedStories([]);
      setShowIncludeStories(false);
      // Potentially fetchStories() again to see the updated statuses
    } catch (err) {
      console.error("Failed to add stories to sprint:", err);
      setError("Failed to add selected stories to sprint. Check console.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showIncludeStories && (
        <div className="center--box">
          <h1>User Stories</h1>
          <div className="responsive-table-container3">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Include</th>
                  <th>Story Title</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => (
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

          {/* NEW: Button to assign the checked stories to the sprint */}
          <button onClick={handleAddToSprint}>
            Add Selected Stories to Sprint
          </button>
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
              {/* Example row placeholders */}
              <tr>
                <td>
                  <div className="userStory">
                    <h2>Name of story</h2>
                    <p>Must have</p>
                    <p>Business value: 23</p>
                  </div>
                </td>
                <td>
                  <div className="userStory">
                    <h2>Another story</h2>
                    <p>Nice to have</p>
                    <p>Business value: 10</p>
                  </div>
                </td>
                <td></td>
              </tr>
              {isScrumMaster && (
                <tr>
                  <td>
                    <div
                      className={`userStory plus-button ${
                        showIncludeStories ? "selected" : ""
                      }`}
                      onClick={() => setShowIncludeStories((prev) => !prev)}
                    >
                      <span>+</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="center--box">
        <h1>User Story</h1>
        <h2>Name of story</h2>
      </div>
    </>
  );
};

export default SprintDetails;
