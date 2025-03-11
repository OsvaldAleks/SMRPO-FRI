import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { getSprintData } from '../api.js'
import { getProject } from "../api";
import { formatDate } from "../utils/storyUtils.js";
import './style/SprintDetails.css'

const SprintDetails = () => {
  const { projectName } = useParams();
  const { user, loading } = useAuth();
  const { sprintId } = useParams(); 
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState(null);
  const [isScrumMaster, setIsScrumMaster] = useState(false);
  const [showIncludeStories, setShowIncludeStories] = useState(false); // Toggle state

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
    fetchProject(user.uid);
  }, [projectName]);

  const fetchProject = async (uid) => {
      try {
        if (!projectName) {
          throw new Error("Project name is undefined");
        }
  
        const projectData = await getProject(projectName, uid);
  
        if (projectData.project.scrumMasters?.some((sm) => sm.id === uid)) {
          setIsScrumMaster(true);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError("Failed to load project data. Please try again later.");
      }
    };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    {/* Toggle section */}
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
              <tr>
                <td>
                  <input type="checkbox" />
                </td>
                <td>Name of Story</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )}

    <div className="center--box">
      <h1>Sprint Details</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {sprint ? (
        <div>
          <p><strong>Start Date: </strong>
                {sprint?.start_date
                    ? formatDate(sprint.start_date)
                    : "No start date available"}
            </p>
          <p><strong>End Date: </strong>
                {sprint?.end_date
                    ? formatDate(sprint.end_date)
                    : "No end date available"}
            </p>
          <p><strong>Velocity: </strong> {sprint.velocity}</p>
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
                  {/* Toggle button */}
                  <div 
                    className={`userStory plus-button ${showIncludeStories ? "selected" : ""}`}
                    onClick={() => setShowIncludeStories(prev => !prev)}
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
