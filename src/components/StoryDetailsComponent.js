import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateStoryPoints, addSubtaskToUserStory, getUserStory, claimSubtask, markSubtaskAsDone } from "../api.js";
import Input from "./Input.js";
import Button from './Button.js';

const UserStoryDetails = ({ story, userRole, onUpdate, projectDevelopers = [] }) => {
  const { user, loading } = useAuth();

  const [storyPointValue, setStoryPointValue] = useState(story.storyPoints || "");
  const [originalStoryPointValue, setOriginalStoryPointValue] = useState(story.storyPoints || "");
  const [subtasks, setSubtasks] = useState(story.subtasks || []);
  const [errorMessage, setErrorMessage] = useState("");

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
    if (typeof onUpdate === 'function') {
      onUpdate(story);
    }
  };

  const hasChanges = storyPointValue !== originalStoryPointValue;

  // Subtasks section
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [subtaskTime, setSubtaskTime] = useState("");
  const [subtaskDeveloper, setSubtaskDeveloper] = useState("");

  const handleAddSubtask = async () => {
    if (!subtaskDescription || !subtaskTime) {
      setErrorMessage("Please fill out description and time estimate.");
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
      setErrorMessage("");

      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);

      story.status = updatedStory.status;
      if (typeof onUpdate === "function") {
        onUpdate(story);
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
      setErrorMessage(err.message);
    }
  };

  const handleClaim = async (taskIndex) => {
    try {
      await claimSubtask(story.id, user.uid, taskIndex);

      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      story.status = updatedStory.status;

      if (typeof onUpdate === 'function') {
        onUpdate(story);
      }
    } catch (err) {
      console.error("Failed to claim/unclaim subtask:", err);
      alert("Failed to claim/unclaim subtask.");
    }
  };

  const handleMarkSubtaskAsDone = async (subtaskIndex) => {
    try {
      await markSubtaskAsDone(story.id, subtaskIndex);
  
      // Fetch the updated story to refresh the subtasks
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);  
      story.status = updatedStory.status;

      // Notify the parent component (if needed)
      if (typeof onUpdate === 'function') {
        onUpdate(updatedStory);
      }
    } catch (err) {
      console.error("Failed to mark subtask as done:", err);
      setErrorMessage(err.message);
    }
  };
  

  //TODO implement the following functions
  const confirmStoryAsDone = async () => {
    console.log("done");
  }
  const rejectStory = async () => {
    console.log("reject");
  }

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
          {(userRole === "scrumMasters" && (story.sprintId.length === 0)) ? (
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

        {userRole === "scrumMasters" && hasChanges && (
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
                  {userRole === "devs" && <th>Claim</th>}
                </tr>
              </thead>
              <tbody>
                {subtasks.length > 0 ? (
                  subtasks.map((sub, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="checkbox"
                          checked={sub.isDone || false}
                          disabled={!sub.developerId || sub.developerId !== user.uid}
                          onChange={() => handleMarkSubtaskAsDone(idx)}
                        />
                      </td>
                      <td>{sub.description}</td>
                      <td>{sub.timeEstimate}</td>
                      <td style={{ fontWeight: sub.devName ? 'bold' : 'normal', color: sub.suggestedDevName && !sub.devName ? 'gray' : 'inherit' }}>
                        {sub.devName || sub.suggestedDevName || "N/A"}
                      </td>                 
                      {userRole === "devs" && (
                        <td>
                          <input
                            type="checkbox"
                            checked={!!sub.developerId && sub.developerId === user.uid}
                            disabled={!!sub.developerId && sub.developerId !== user.uid}
                            onChange={() => handleClaim(idx)}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userRole === "devs" ? "6" : "5"}>No subtasks yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(userRole === "scrumMasters" || userRole === "devs") && (
        <div style={{ marginTop: "1rem" }}>
          {!showSubtaskForm ? (
            <Button className="btn--block" onClick={() => setShowSubtaskForm(true)}>+ Add Subtask</Button>
          ) : (
            <>
              {errorMessage && (
                <div style={{ color: "red", marginBottom: "0.5rem" }}>
                  {errorMessage}
                </div>
              )}
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
                <div className="select-container">
                  <select
                    className="select"
                    value={subtaskDeveloper}
                    onChange={(e) => setSubtaskDeveloper(e.target.value)}
                  >
                    <option value="N/A">Unassigned</option>
                    {projectDevelopers.map((dev) => (
                      <option key={dev} value={dev}>
                        {dev}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button className="btn--block" onClick={handleAddSubtask}>
                Save Subtask
              </Button>
              <Button className="btn--block" onClick={() => setShowSubtaskForm(false)}>Cancel</Button>
            </>
          )}
        </div>
      )}
      {(userRole === "productManagers" && story.status === "Done") && (
          <>
          <Button className="btn--block" onClick={() => confirmStoryAsDone(true)}>Accept Story</Button>
          <Button className="btn--block" onClick={() => rejectStory(true)}>Reject Story</Button>
          </>
        )}
    </div>
  );
};

export default UserStoryDetails;