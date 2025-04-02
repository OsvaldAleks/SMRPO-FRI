import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateStoryPoints, addSubtaskToUserStory, getUserStory, claimSubtask, markSubtaskAsDone, evaluateUserStory, deleteUserStory, deleteSubtask, updateSubtask } from "../api.js";
import Input from "./Input.js";
import Button from './Button.js';
import { FaEdit, FaTrash, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import UserStoryForm from "../pages/UserStoryForm.js";


const StoryDetailsComponent = ({ story, userRole, onUpdate, onUpdateStory, projectDevelopers = [] }) => {
  const { user, loading } = useAuth();

  const [storyPointValue, setStoryPointValue] = useState(story.storyPoints || "");
  const [originalStoryPointValue, setOriginalStoryPointValue] = useState(story.storyPoints || "");
  const [subtasks, setSubtasks] = useState(story.subtasks || []);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [canEditStory, setCanEditStory] = useState(false);
  const [editView, setEditView] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRef = useRef(null);
  const [editingSubtaskIndex, setEditingSubtaskIndex] = useState(null);

  const navigate = useNavigate();

  const fetchLatestStory = async () => {
    try {
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
    } catch (err) {
      console.error("Failed to fetch latest subtasks:", err);
    }
  };

  const toggleDropdown = (index) => {
    setDropdownIndex(prev => (prev === index ? null : index));
  };

  const handleEditSubtask = (index) => {
    const subtask = subtasks[index];
    if (!subtask) return;

    setSubtaskDescription(subtask.description || "");
    setSubtaskTime(subtask.timeEstimate || "");
    setSubtaskDeveloper(subtask.devName || "");
    setEditingSubtaskIndex(index);
    setShowSubtaskForm(true);
    setErrorMessage("");
    setDropdownIndex(null); // close menu
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setStoryPointValue(story.storyPoints || "");
    setOriginalStoryPointValue(story.storyPoints || "");
    console.log(userRole)
    setCanEditStory((userRole === "scrumMasters" || userRole === "productManagers") && (story.sprintId).length == 0)
    fetchLatestStory();
  }, [story]);

  const handleStoryPointChange = (e) => {
    setStoryPointValue(e.target.value);
  };

  const handleSaveStoryPoint = async () => {
    story = await updateStoryPoints(story.id, storyPointValue);
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

    if (subtaskTime < 0) {
      setErrorMessage("Time estimate cannot be negative.");
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

  // funkcija za odstranitev subtaska
  const handleDeleteSubtask = async (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this subtask?");
    if (!confirmed) return;

    try {
      await deleteSubtask(story.id, index); // <-- ta funkcija iz api.js
      setDropdownIndex(null);
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      story.status = updatedStory.status;
      if (typeof onUpdate === 'function') {
        onUpdate(updatedStory);
      }
    } catch (err) {
      console.error("Failed to delete subtask:", err.message || err);
      alert("Failed to delete subtask: " + (err.message || "Unknown error"));
    }
  };

  // funkcija za editanje subtaska
  const handleSaveSubtask = async () => {
    if (!subtaskDescription || !subtaskTime) {
      setErrorMessage("Please fill out description and time estimate.");
      return;
    }

    if (subtaskTime < 0) {
      setErrorMessage("Time estimate cannot be negative.");
      return;
    }

    const subtaskData = {
      subtaskIndex: editingSubtaskIndex,
      name: subtaskDescription,
      status: undefined, // ali po potrebi
      assignedTo: subtaskDeveloper !== "N/A" ? subtaskDeveloper : null,
    };

    try {
      if (editingSubtaskIndex !== null) {
        await updateSubtask(story.id, {
          subtaskIndex: editingSubtaskIndex,
          description: subtaskDescription,
          timeEstimate: parseFloat(subtaskTime),
          developer: subtaskDeveloper !== "N/A" ? subtaskDeveloper : null,
        });
      } else {
        await addSubtaskToUserStory(story.id, {
          description: subtaskDescription, // ✅ pravilno ime
          timeEstimate: parseFloat(subtaskTime),
          developer: subtaskDeveloper !== "N/A" ? subtaskDeveloper : null,
        });
      }

      // Refresh view
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      story.status = updatedStory.status;
      if (typeof onUpdate === "function") onUpdate(updatedStory);

      // Reset form
      setShowSubtaskForm(false);
      setEditingSubtaskIndex(null);
      setSubtaskDescription("");
      setSubtaskTime("");
      setSubtaskDeveloper("");
      setErrorMessage("");

    } catch (err) {
      console.error("Failed to save subtask:", err);
      setErrorMessage(err.message || "Unknown error");
    }
  };

  const handleClaim = async (taskIndex) => {
    try {
      console.log("Attempting to claim subtask at index:", taskIndex);
      console.log("User ID:", user.uid);

      const updatedSubtasks = subtasks.map((subtask, index) => {
        if (index === taskIndex) {
          return {
            ...subtask,
            developerId: subtask.developerId ? null : user.uid, // Toggle claim
            isDone: subtask.isDone ?? false, // Ensure isDone is defined
          };
        }
        return subtask;
      });

      await claimSubtask(story.id, user.uid, taskIndex);
      console.log("Subtask claim request sent successfully.");

      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      setDropdownIndex(null);
      console.log("Updated story fetched:", updatedStory);

      setSubtasks(updatedStory.subtasks || []);
      story.status = updatedStory.status;

      if (typeof onUpdate === "function") {
        console.log("Triggering onUpdate callback.");
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

  const confirmStoryAsDone = async () => {
    try {
      await evaluateUserStory(story.id, true, "");
      const updatedStory = await getUserStory(story.id);
      if (typeof onUpdate === 'function') {
        onUpdate(updatedStory);
      }
      if (typeof onUpdate === 'function') {
        onUpdate(updatedStory);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const rejectStory = () => {
    setShowRejectForm(true);
    setRejectComment("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectComment) {
      setErrorMessage("Rejection comment is required.");
      return;
    }

    try {
      await evaluateUserStory(story.id, false, rejectComment);
      const updatedStory = await getUserStory(story.id);
      if (typeof onUpdate === 'function') {
        onUpdate(updatedStory);
      }
    }
    catch (error) {
      setErrorMessage(error.message);
    } finally {
      setShowRejectForm(false);
      setRejectComment("");
    }
  };

  const onDelete = async () => {
    await deleteUserStory(story.id);
    navigate(-1);
  }

  const handleEditComplete = async (updatedStory) => {
    setEditView(false);
    setStoryPointValue(updatedStory.storyPoints || "");
    setOriginalStoryPointValue(updatedStory.storyPoints || "");
    if (typeof onUpdate === 'function') {
      onUpdate(updatedStory);
    }
    onUpdateStory(updatedStory);
  };


  return (
    <>
      {!editView ? (
        <div className="center--box">
          <div className="card--header">
            <h1>{story.name}</h1>
            {/* Show edit icon only for SCRUM masters or project managers when story has no sprintId */}
            <div className="icons">
              {canEditStory && (
                <>
                  <FaEdit
                    onClick={() => setEditView(true)}
                    title="Edit User Story"
                  />
                  <FaTrash
                    className="p--alert"
                    onClick={() => onDelete && onDelete(story)}
                    title="Delete User Story"
                  />
                </>
              )}
            </div>
          </div>
          <p><strong>Description:</strong></p>
          <p style={{ maxWidth: "400px", wordWrap: "break-word", overflow: "hidden", textOverflow: "ellipsis", textAlign: "justify" }}>
            {story.description}</p>
          <p><strong>Priority:</strong> {story.priority}</p>
          <p><strong>Business Value:</strong> {story.businessValue}</p>
          <p><strong>Status:</strong> {story.status}</p>

          {/* 1) Dodamo prikaz, če je status Rejected in obstaja rejectionComment */}
          {story.status === "Rejected" && story.rejectionComment && (
            <p>
              <strong>Rejection Comment:</strong> {story.rejectionComment}
            </p>
          )}

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

          <h3>Acceptance Tests</h3>
          <div className="responsive-table-container3">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Test</th>
                </tr>
              </thead>
              <tbody>
                {story.acceptanceCriteria.map((criteria, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td style={{ maxWidth: "200px", wordWrap: "break-word", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {criteria}
                    </td>
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
                      {(userRole === "devs" || userRole === "scrumMasters") && <th>Claim</th>}
                      {(userRole === "devs" || userRole === "scrumMasters") && <th>Edit</th>}
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
                          {(userRole === "devs" || userRole === "scrumMasters") && (
                            <td>
                              <input
                                type="checkbox"
                                checked={!!sub.developerId && sub.developerId === user.uid}
                                disabled={!!sub.developerId && sub.developerId !== user.uid}
                                onChange={() => handleClaim(idx)}
                              />
                            </td>
                          )}
                          {(userRole === "devs" || userRole === "scrumMasters") && (
                            <td style={{ position: 'relative' }} ref={dropdownRef}>
                              {dropdownIndex === idx ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <FaEdit
                                    className="dropdown-icon"
                                    onClick={() => handleEditSubtask(idx)}
                                    title="Edit Subtask"
                                  />
                                  <FaTrash
                                    className="dropdown-icon p--alert"
                                    onClick={() => handleDeleteSubtask(idx)}
                                    title="Delete Subtask"
                                  />
                                </div>
                              ) : (
                                <FaEllipsisV
                                  className="dropdown-trigger"
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent document-level click
                                    setDropdownIndex(idx);
                                  }}
                                  title="More actions"
                                />
                              )}
                            </td>
                          )}


                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={(userRole === "devs" || userRole === "scrumMasters") ? "6" : "5"}>No subtasks yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {(userRole === "scrumMasters" || userRole === "devs") && story.sprintId.length != 0 && (
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
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow negative numbers with up to 2 decimal places
                        if (/^-?\d*\.?\d{0,2}$/.test(value)) {
                          setSubtaskTime(e.target.value);
                        }
                      }}
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

                  <Button className="btn--block" onClick={handleSaveSubtask}>
                    {editingSubtaskIndex !== null ? "Update Subtask" : "Save Subtask"}
                  </Button>
                  <Button
                    className="btn--block"
                    onClick={() => {
                      setShowSubtaskForm(false);
                      setEditingSubtaskIndex(null);
                      setSubtaskDescription("");
                      setSubtaskTime("");
                      setSubtaskDeveloper("");
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Accept/Reject buttons, if in sprint view + sprint ended + user is product manager */}
          {story.sprintId.length != 0 && userRole === "productManagers" && story.status != 'Completed' && (
            <div style={{ marginTop: "1rem", display: "flex", gap: "0" }}>
              <Button className={story.status === 'Done' ? 'btn--accent btn--half' : "btn--accent btn--block"} onClick={rejectStory}>Reject</Button>
              {story.status === 'Done' && <Button className="btn--half" onClick={confirmStoryAsDone}>Accept</Button>}
            </div>
          )}

          {/* Forma za Reject Story: */}
          {showRejectForm && (
            <div style={{ marginTop: "1rem" }}>
              <h4>Reject Story</h4>
              <label>Reason:</label>
              <textarea
                className="textarea"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows="4"
                style={{ width: "100%" }}
              />
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0" }}>
                <Button className="btn--half btn--accent" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                <Button className="btn--half" onClick={handleRejectSubmit}>Confirm Reject</Button>
              </div>
            </div>
          )}
        </div>)

        : (<UserStoryForm
          projectId={story.projectId}
          story={story}
          onStoryAdded={handleEditComplete}
          onCancel={() => setEditView(false)}></UserStoryForm>)}
    </>);
};

export default StoryDetailsComponent;