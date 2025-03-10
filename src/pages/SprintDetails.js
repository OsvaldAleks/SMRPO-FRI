import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { getSprintData } from '../api.js'
import './style/SprintDetails.css'

const SprintDetails = () => {
  const { user, loading } = useAuth();
  const { sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="center--box">
      <h1>Sprint Details</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {sprint ? (
        <div>
          <p><strong>Start Date: </strong>
                {sprint?.start_date
                    ? sprint.start_date
                    : "No end date available"}
            </p>
          <p><strong>End Date: </strong>
                {sprint?.end_date
                    ? sprint.end_date
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
                <p>Name of story</p>
                <p>Must have</p>
                <p>Business value: 23</p>
              </div>
            </td>
            <td>
              <div className="userStory">
                <p>Another story</p>
                <p>Nice to have</p>
                <p>Business value: 10</p>
              </div>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
              <div className="userStory plus-button">+</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    </div>
  );
};

export default SprintDetails;
