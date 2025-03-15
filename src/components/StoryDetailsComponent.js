import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateStoryPoints, addSubtaskToUserStory, getUserStory, claimSubtask } from "../api.js";
import Input from "./Input.js";

const UserStoryDetails = ({ story, isScrumMaster, isDev }) => {
  const { user, loading } = useAuth();

  const [storyPointValue, setStoryPointValue] = useState(story.storyPoints || "");
  const [originalStoryPointValue, setOriginalStoryPointValue] = useState(story.storyPoints || "");
  const [subtasks, setSubtasks] = useState(story.subtasks || []);

  useEffect(() => {
    setStoryPointValue(story.storyPoints || "");
    setOriginalStoryPointValue(story.storyPoints || "");
    const fetchLatestStory = async () => {
        try {
          const updatedStory = await getUserStory(story.id);
          setSubtasks(updatedStory.subtasks || []);
        } catch (err) {
          console.error("Failed to fetch latest subtasks:", err);
        }
      };
      
      fetchLatestStory();
      
  }, [story]);

  const handleStoryPointChange = (e) => {
    setStoryPointValue(e.target.value);
  };

  const handleSaveStoryPoint = async () => {
    await updateStoryPoints(story.id, storyPointValue);
    setOriginalStoryPointValue(storyPointValue);
  };

  const hasChanges = storyPointValue !== originalStoryPointValue;

  // Subtasks section
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [subtaskTime, setSubtaskTime] = useState("");
  const [subtaskDeveloper, setSubtaskDeveloper] = useState("");

  const handleAddSubtask = async () => {
    if (!subtaskDescription || !subtaskTime) {
      alert("Please fill out description and time estimate.");
      return;
    }

    try {
      await addSubtaskToUserStory(story.id, {
        description: subtaskDescription,
        timeEstimate: subtaskTime,
        developer: subtaskDeveloper || null,
      });

      setSubtaskDescription("");
      setSubtaskTime("");
      setSubtaskDeveloper("");
      setShowSubtaskForm(false);

      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);

    } catch (err) {
      console.error("Failed to add subtask:", err);
      alert("Failed to add subtask. Check console.");
    }
  };

  const handleClaim = async (taskIndex) => {
    try {
  
      await claimSubtask(story.id, user.uid, taskIndex);
  
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
    } catch (err) {
      console.error("Failed to claim/unclaim subtask:", err);
      alert("Failed to claim/unclaim subtask. Check console.");
    }
  };
  
  

  return (
    <div className="center--box">
      <h1>{story.name}</h1>
      <p><strong>Description:</strong> {story.description}</p>
      <p><strong>Priority:</strong> {story.priority}</p>
      <p><strong>Business Value:</strong> {story.businessValue}</p>
      <p><strong>Status:</strong> {story.status}</p>

      <div>
        <label>
          <strong>Story Points: </strong>
          {(isScrumMaster && (story.sprintId.length === 0)) ? (
            <Input
              type="number"
              value={storyPointValue}
              onChange={handleStoryPointChange}
              min="0"
            />
          ) : (
            <span>{storyPointValue ? storyPointValue : "not set"}</span>
          )}
        </label>

        {isScrumMaster && hasChanges && (
          <span
            style={{
              color: "green",
              fontSize: "20px",
              cursor: "pointer",
              marginLeft: "8px"
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

      {story.sprintId && story.sprintId.length > 0 && (
        <>
          <h3>Subtasks</h3>
          <div className="responsive-table-container3">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Done</th>
                  <th>Description</th>
                  <th>Time[h]</th>
                  <th>Dev</th>
                  {isDev && <th>Claim</th>}
                </tr>
              </thead>
              <tbody>
                {subtasks.length > 0 ? (
                  subtasks.map((sub, idx) => (
                    <tr key={idx}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={sub.isDone} 
                          disabled={!sub.developerId || sub.developerId !== user.uid} 
                        />                     
                      </td>
                      <td>{sub.description}</td>
                      <td>{sub.timeEstimate}</td>
                      <td>{sub.devName || "N/A"}</td>
                      {isDev && (
                        <td>
                          <button onClick={() => handleClaim(idx)}>
                            {sub.developerId ? (sub.developerId == user.uid ? "Unclaim" : "Claim") : "Claim"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isDev ? "6" : "5"}>No subtasks yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(isScrumMaster || isDev) && (
        <div style={{ marginTop: "1rem" }}>
          {!showSubtaskForm ? (
            <button onClick={() => setShowSubtaskForm(true)}>+ Add Subtask</button>
          ) : (
            <>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Description: </label>
                <Input
                  type="text"
                  value={subtaskDescription}
                  onChange={(e) => setSubtaskDescription(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Time (hrs): </label>
                <Input
                  type="number"
                  value={subtaskTime}
                  onChange={(e) => setSubtaskTime(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <label>Developer (optional): </label>
                <Input
                  type="text"
                  value={subtaskDeveloper}
                  onChange={(e) => setSubtaskDeveloper(e.target.value)}
                />
              </div>
              <button onClick={handleAddSubtask} style={{ marginRight: "0.5rem" }}>
                Save Subtask
              </button>
              <button onClick={() => setShowSubtaskForm(false)}>Cancel</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserStoryDetails;
