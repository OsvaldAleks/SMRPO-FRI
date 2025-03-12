// StoryDetailsComponent.js

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

import { updateStoryPoints, addSubtaskToUserStory, getUserStory } from "../api.js";
import Input from "./Input.js";

const UserStoryDetails = ({ story, isScrumMaster }) => {
  const { user, loading } = useAuth();

  // -- Story Points section (existing logic) --
  const [storyPointValue, setStoryPointValue] = useState(story.storyPoints || "");
  const [originalStoryPointValue, setOriginalStoryPointValue] = useState(story.storyPoints || "");

  const handleStoryPointChange = (e) => {
    setStoryPointValue(e.target.value);
  };

  const handleSaveStoryPoint = async () => {
    await updateStoryPoints(story.id, storyPointValue);
    setOriginalStoryPointValue(storyPointValue);
  };

  const hasChanges = storyPointValue !== originalStoryPointValue;

  // -- Subtasks section (new logic) --
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [subtaskTime, setSubtaskTime] = useState("");
  const [subtaskDeveloper, setSubtaskDeveloper] = useState("");

  // Function to handle adding subtask
  const handleAddSubtask = async () => {
    if (!subtaskDescription || !subtaskTime) {
      // Could show an error or just return
      alert("Please fill out description and time estimate.");
      return;
    }

    try {
      await addSubtaskToUserStory(story.id, {
        description: subtaskDescription,
        timeEstimate: subtaskTime,
        developer: subtaskDeveloper || null, // optional
      });
      // Clear form
      setSubtaskDescription("");
      setSubtaskTime("");
      setSubtaskDeveloper("");
      setShowSubtaskForm(false);

      // Re-fetch the updated story from backend to see the new subtask
      const updated = await getUserStory(story.id);
      // Because story is a prop, you might pass the updated story back up 
      // or keep local state. For simplicity, let's just do this:
      Object.assign(story, updated);
    } catch (err) {
      console.error("Failed to add subtask:", err);
      alert("Failed to add subtask. Check console.");
    }
  };

  return (
    <div className="center--box">
      <h1>{story.name}</h1>
      <p><strong>Description:</strong> {story.description}</p>
      <p><strong>Priority:</strong> {story.priority}</p>
      <p><strong>Business Value:</strong> {story.businessValue}</p>
      <p><strong>Status:</strong> {story.status}</p>

      {/* Story Points logic */}
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

      {/* Subtasks Section */}
      {story.sprintId && story.sprintId.length > 0 && (
        <>
          <h3>Subtasks</h3>
          <div className="responsive-table-container3">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Time (hrs)</th>
                  <th>Developer</th>
                </tr>
              </thead>
              <tbody>
                {story.subtasks && story.subtasks.length > 0 ? (
                  story.subtasks.map((sub, idx) => (
                    <tr key={idx}>
                      <td>{sub.description}</td>
                      <td>{sub.timeEstimate}</td>
                      <td>{sub.developer || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No subtasks yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* "Skrbnik metodologije" or "razvojna ekipa" can add subtasks. Let's assume we handle that with isScrumMaster or some condition */}
          {(isScrumMaster /* or your dev team check */) && (
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
        </>
      )}
    </div>
  );
};

export default UserStoryDetails;
