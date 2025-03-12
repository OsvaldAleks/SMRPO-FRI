import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { getUserStory } from "../api.js";
import Input from './Input.js';

const UserStoryDetails = ({ story, isScrumMaster }) => {
  const { user, loading } = useAuth();
  const [storyPointValue, setStoryPointValue] = useState(story.storyPoints || '');
  const [originalStoryPointValue, setOriginalStoryPointValue] = useState(story.storyPoints || '');

  const handleStoryPointChange = (e) => {
    setStoryPointValue(e.target.value);
  };

  const handleSaveStoryPoint = () => {
    // TODO: Add API call here to save the updated story points
    console.log("Story points updated to:", storyPointValue);
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
          <strong>Story Points:</strong>
          {isScrumMaster ? (
            <Input
              type="number"
              value={storyPointValue}
              onChange={handleStoryPointChange}
              min="0"
            />
          ) : (
            <span>{storyPointValue}</span> // Display static text if not Scrum Master
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
      <ul>
        {story.acceptanceCriteria.map((criteria, index) => (
          <li key={index}>{criteria}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserStoryDetails;
