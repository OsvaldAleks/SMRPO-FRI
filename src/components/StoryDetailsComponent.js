import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { updateStoryPoints } from "../api.js";
import Input from './Input.js';
import Button from "./Button.js";

const UserStoryDetails = ({ story, isScrumMaster }) => {
  const { user, loading } = useAuth();
  const [storyPointValue, setStoryPointValue] = useState(story.storyPoints || '');
  const [originalStoryPointValue, setOriginalStoryPointValue] = useState(story.storyPoints || '');

  const handleStoryPointChange = (e) => {
    setStoryPointValue(e.target.value);
  };

  const handleSaveStoryPoint = async () => {
    await updateStoryPoints(story.id, storyPointValue)
    setOriginalStoryPointValue(storyPointValue);
  };

  const hasChanges = storyPointValue !== originalStoryPointValue;

  return (
    <div className="center--box">
      <h1>{story.name}</h1>
      <p><strong>Description:</strong> {story.description}</p>
      <p><strong>Priority:</strong> {story.priority}</p>
      <p><strong>Business Value:</strong> {story.businessValue}</p>
      <p><strong>Status:</strong> {story.status}</p>

      {/* Always show the story points input field, but only allow editing if Scrum Master */}
      <div>
        <label>
          <strong>Story Points: </strong>
          {(isScrumMaster && (story.sprintId.length == 0)) ? (
            <Input
              type="number"
              value={storyPointValue}
              onChange={handleStoryPointChange}
              min="0"
            />
          ) : (
            <span>{storyPointValue ? storyPointValue : 'not set'}</span> // Display static text if not Scrum Master
          )}
        </label>

        {/* Display the checkmark only if there are changes and if the user is a Scrum Master */}
        {isScrumMaster && hasChanges && (
          <span
            style={{
              color: 'green',
              fontSize: '20px',
              cursor: 'pointer',
            }}
            onClick={handleSaveStoryPoint}
          >
            ✔
          </span>
        )}
      </div>

      <h3>Acceptance Criteria</h3>
      <div className="responsive-table-container3">
      <table className="responsive-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Criterion</th>
          </tr>
        </thead>
        <tbody>
          {story.acceptanceCriteria.map((criteria, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{criteria}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {story.sprintId.length > 0 && (
        <>
        <h3>Subtasks</h3>
        <div className="responsive-table-container3">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Time</th>
              <th>Dev</th>
              <th>Claim</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                <td>1</td>
                <td>Subtask</td>
                <td>[x]h</td>
                <td>name</td>
                <td><input type="checkbox"></input></td>
              </tr>
              <tr>
                  <td colspan='5'><Button>Add subtask</Button></td>
              </tr>
          </tbody>
        </table>
        </div>
        </>
      )}
    </div>
  );
};

export default UserStoryDetails;