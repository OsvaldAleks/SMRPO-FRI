import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateStoryPoints, addSubtaskToUserStory, getUserStory, claimSubtask, markSubtaskAsDone, evaluateUserStory, deleteUserStory, deleteSubtask, updateSubtask, updateUserStoryStatus } from "../api.js";
import Input from "./Input.js";
import Button from './Button.js';
import { FaEdit, FaTrash, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { startTimeRecording, stopTimeRecording } from "../api.js";
import UserStoryForm from "../pages/UserStoryForm.js";
import { set } from "firebase/database";

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
  const [recordingSubtaskId, setRecordingSubtaskId] = useState(null);
  const [showTimeRecordingModal, setShowTimeRecordingModal] = useState(false);
  const [selectedSubtaskForRecording, setSelectedSubtaskForRecording] = useState(null);
  const [showWorktimeModal, setShowWorktimeModal] = useState(false);
  const [worktime, setWorktime] = useState(""); // Store the worktime input value
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(null); // Store the subtask index

  const [currentRecordingTime, setCurrentRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const navigate = useNavigate();

  const fetchLatestStory = async () => {
    try {
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
    } catch (err) {
      console.error("Failed to fetch latest tasks:", err);
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
    setDropdownIndex(null);
  };

  const handleStartRecording = async () => {
    // Check if there's already a recording
    const storyData = await getUserStory(story.id);
    const existingRecording = storyData.subtasks?.find(s => s.workdate);

    if (existingRecording) {
      setRecordingSubtaskId(existingRecording.id);
      return;
    }

    setSelectedSubtaskForRecording(null);
    setShowTimeRecordingModal(true);
  };

  const handleConfirmStartRecording = async () => {
    if (selectedSubtaskForRecording === null) {
      setErrorMessage("Please select a task first");
      return;
    }

    try {
      const result = await startTimeRecording(story.id, selectedSubtaskForRecording);

      if (result.success) {
        setRecordingSubtaskId(selectedSubtaskForRecording);
        setShowTimeRecordingModal(false);
        setSelectedSubtaskForRecording(null);

        // Refresh the story data
        const updatedStory = await getUserStory(story.id);
        setSubtasks(updatedStory.subtasks || []);
      } else {
        console.error('Failed to start recording:', result.message);
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error in handleConfirmStartRecording:', error);
      setErrorMessage(error.message);
    }

    if (typeof onUpdate === 'function') {
      onUpdate(story);
    }

  };

  const handleStopRecording = async () => {
    if (recordingSubtaskId === null) return;

    try {
      await stopTimeRecording(story.id, recordingSubtaskId, user.uid);
      setRecordingSubtaskId(null);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setErrorMessage(error.message);
    }

    if(typeof onUpdate === 'function') {
      onUpdate(story);
    }
  };

  const handleSubmitWorktime = async (subtaskIndex) => {
    try {
      const worktimeInHours = parseFloat(worktime);
      if (isNaN(worktimeInHours) || worktimeInHours <= 0) {
        throw new Error("Invalid worktime entered");
      }
  
      const worktimeInSeconds = worktimeInHours * 3600;
  
      const result = await markSubtaskAsDone(story.id, subtaskIndex, worktimeInSeconds);
  
      if (result.success) {
        // Re-fetch the updated story
        const updatedStory = await getUserStory(story.id);
  
        // Update the component state
        setSubtasks(updatedStory.subtasks || []);
        setStoryPointValue(updatedStory.storyPoints || "");
        if (onUpdateStory) onUpdateStory(updatedStory); // if parent wants to know
  
        // Close modal and reset input
        setShowWorktimeModal(false);
        setWorktime("");
      } else {
        throw new Error(result.message || "Failed to submit worktime");
      }
    } catch (err) {
      console.error("Error submitting worktime:", err);
      setErrorMessage(err.message);
    }
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

  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    show: false,
    subtaskIndex: null,
  });

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
      status: undefined,
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
          description: subtaskDescription,
          timeEstimate: parseFloat(subtaskTime),
          developer: subtaskDeveloper !== "N/A" ? subtaskDeveloper : null,
        });
      }

      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      story.status = updatedStory.status;
      if (typeof onUpdate === "function") onUpdate(updatedStory);

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
      const currentSubtask = subtasks[taskIndex];
      const isUnclaiming = currentSubtask.developerId && currentSubtask.developerId === user.uid;
      const isCompleted = currentSubtask.isDone;

      // First handle the claim/unclaim
      await claimSubtask(story.id, user.uid, taskIndex);

      // If unclaiming a completed task, mark it as undone
      if (isUnclaiming && isCompleted) {
        await handleMarkSubtaskAsDone(taskIndex);
      }
      // For all other cases, just update normally
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      setDropdownIndex(null);

      story.status = updatedStory.status;
      if (typeof onUpdate === "function") {
        onUpdate(story);
      }
    } catch (err) {
      console.error("Failed to claim/unclaim subtask:", err);
      setErrorMessage(err.message || "Failed to update subtask status");
    }
  };

  const handleMarkSubtaskAsDone = async (subtaskIndex) => {
    const subtask = subtasks[subtaskIndex];
    const isDone = subtask.isDone;
  
    try {
      if (isDone) {
        const result = await markSubtaskAsDone(story.id, subtaskIndex);
  
        if (!result.success) {
          throw new Error(result.message || "Could not update subtask");
        }
  
        const updatedStory = await getUserStory(story.id);
        setSubtasks(updatedStory.subtasks || []);
        story.status = updatedStory.status;
    
        if (typeof onUpdate === 'function') {
          onUpdate(updatedStory);
        }
      } else {
        setCurrentSubtaskIndex(subtaskIndex);
        setShowWorktimeModal(true);
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

  const handleConfirmDelete = async () => {
    const index = confirmDeleteModal.subtaskIndex;
    if (index === null) return;
    setErrorMessage("");
    if (story.status === "Done") {
      setErrorMessage("Cannot delete subtasks from a completed story.");
      setConfirmDeleteModal({ show: false, subtaskIndex: null });
      return;
    }

    try {
      await deleteSubtask(story.id, index);
      const updatedStory = await getUserStory(story.id);
      setSubtasks(updatedStory.subtasks || []);
      story.status = updatedStory.status;

      if (typeof onUpdate === 'function') {
        onUpdate(updatedStory);
      }

      setConfirmDeleteModal({ show: false, subtaskIndex: null });

      // Optionalno: preverimo še Product backlog status
      const activeSubtasks = updatedStory.subtasks?.filter(st => !st.deleted) || [];
      const hasClaimed = activeSubtasks.some(st => !!st.developerId);

      if (activeSubtasks.length === 0 || !hasClaimed) {
        const refreshed = await updateUserStoryStatus(story.id, "Product backlog");
        const refreshedStory = await getUserStory(story.id);
        setSubtasks(refreshedStory.subtasks || []);
        if (typeof onUpdate === 'function') {
          onUpdate(refreshedStory);
        }
      }

    } catch (err) {
      console.error(err.message || err);
      setErrorMessage((err.message || "Unknown error"));
    } finally {
      setConfirmDeleteModal({ show: false, subtaskIndex: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteModal({ show: false, subtaskIndex: null });
  };

  // Timer effect
  useEffect(() => {
    if (recordingSubtaskId !== null) {
      const interval = setInterval(() => {
        const subtask = subtasks[recordingSubtaskId]; // Get by index
        if (subtask?.workdate) {
          const startTime = new Date(subtask.workdate);
          const currentTime = new Date();
          setCurrentRecordingTime(Math.floor((currentTime - startTime) / 1000));
        }
      }, 1000);
      setTimerInterval(interval);

      return () => clearInterval(interval);
    } else {
      setCurrentRecordingTime(0);
    }
  }, [recordingSubtaskId, subtasks]);

  // Check for existing recordings on load
  useEffect(() => {
    const checkForExistingRecording = async () => {
      const storyData = await getUserStory(story.id);
      const recordingIndex = storyData.subtasks?.findIndex(s => s.workdate);
      if (recordingIndex !== undefined && recordingIndex !== -1) {
        setRecordingSubtaskId(recordingIndex);
      }
    };

    checkForExistingRecording();
  }, [story.id]);


  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

const totalWorkSeconds = subtasks.reduce((sum, sub) => {
  if (sub.deleted) return sum;
  return sum + (sub.worktimes?.reduce((acc, wt) => acc + (wt.duration || 0), 0) || 0);
}, 0);
const totalWorkHours = Number(totalWorkSeconds / 3600);

const totalEta = subtasks.reduce((sum, sub) => {
  if (sub.deleted) return sum;
  
  let latestETA = sub.timeEstimate || 0;
  if (sub.worktimes && sub.worktimes.length > 0) {
    for (let i = sub.worktimes.length - 1; i >= 0; i--) {
      const worktime = sub.worktimes[i];
      if (worktime?.estimatedTime != null && !isNaN(worktime.estimatedTime)) {
        latestETA = worktime.estimatedTime;
        break;
      }
    }
  }
  return sum + Number(latestETA);
}, 0);

// Combine total work time and latest ETA time for the final total (in hours)
const totalWorkAndEtaHours = (Number(totalWorkHours) + Number(totalEta)).toFixed(2);

  return (
    <>
      {!editView ? (
        <div className="center--box">
          <div className="card--header">
            <h1>{story.name}</h1>
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
          <p
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "center",
              wordWrap: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          > 
            {story.description}</p>
          <p><strong>Priority:</strong> {story.priority}</p>
          <p><strong>Business Value:</strong> {story.businessValue}</p>
          <p><strong>Status:</strong> {story.status}</p>

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
          </div>className

          {story.sprintId && story.sprintId.length > 0 && (
            <>
              <h3>Tasks</h3>
              {errorMessage && (
                <div className="p--alert">
                  {errorMessage}
                </div>
              )}
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
                  {(subtasks.filter(st => !st.deleted)).length > 0 ? (
                    subtasks
                      .map((sub, idx) => ({ sub, idx }))
                      .filter(({ sub }) => !sub.deleted)
                      .map(({ sub, idx }) => {
                        // Calculate total work done across all worktimes
                        const totalWorkSeconds = sub.worktimes
                          ? sub.worktimes.reduce((sum, wt) => sum + (wt.duration || 0), 0)
                          : 0;
                        const totalWorkHours = (totalWorkSeconds / 3600).toFixed(2); // Convert to hours

                        // Loop through worktimes and find the latest one with a valid ETA
                        let latestETA = sub.timeEstimate;  // Start with subtask's timeEstimate
                        for (let i = sub.worktimes?.length - 1; i >= 0; i--) {
                          if (sub.worktimes[i]?.estimatedTime != null && !isNaN(sub.worktimes[i].estimatedTime)) {
                            latestETA = sub.worktimes[i].estimatedTime;
                            break;
                          }
                        }

                        const totalWorkHoursNum = Number(totalWorkHours);
                        const latestETANum = Number(latestETA || 0);
                        const totalSum = totalWorkHoursNum + latestETANum;
                
                          return (
                          <tr key={idx} className={recordingSubtaskId === sub.id ? 'recording-subtask' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                checked={sub.isDone || false}
                                disabled={!sub.developerId || sub.developerId !== user.uid}
                                onChange={() => handleMarkSubtaskAsDone(idx)}
                              />
                            </td>
                            <td>{sub.description}</td>
                            <td>
                              {totalWorkHoursNum.toFixed(2)}h ({latestETANum.toFixed(2)}h)
                            </td>
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <FaEdit
                                    className="dropdown-icon"
                                    onClick={() => handleEditSubtask(idx)}
                                    title="Edit Subtask"
                                  />
                                  {story.status !== "Done" && (
                                    <FaTrash
                                      className="dropdown-icon p--alert"
                                      onClick={() => setConfirmDeleteModal({ show: true, subtaskIndex: idx })}
                                      title="Delete Subtask"
                                    />
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )})
                    ) : (
                      <tr>
                        <td colSpan={(userRole === "devs" || userRole === "scrumMasters") ? "6" : "5"}>No subtasks yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <span style={{ fontSize: "14px", color: "gray" }}>
                Total: {totalWorkHours.toFixed(2)}h (+{totalEta.toFixed(2)}h)
              </span>
            </>
          )}

          {(userRole === "scrumMasters" || userRole === "devs") && story.sprintId.length != 0 && story.isActive && (
            <div style={{ marginTop: "1rem" }}>
              {!showSubtaskForm ? (
                <>
                  <Button className="btn--block" onClick={() => setShowSubtaskForm(true)}>+ Add Subtask</Button>
                  {recordingSubtaskId !== null ? (
                    <Button
                      variant="danger"
                      onClick={handleStopRecording}
                    >
                      Stop Recording
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleStartRecording}
                    >
                      Record Time
                    </Button>
                  )}
                </>
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
                      onChange={(e) => {
                        const value = e.target.value;
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

          {story.sprintId.length != 0 && userRole === "productManagers" && story.status != 'Completed' && (
            <div style={{ marginTop: "1rem", display: "flex", gap: "0" }}>
              <Button className={story.status === 'Done' ? 'btn--accent btn--half' : "btn--accent btn--block"} onClick={rejectStory}>Reject</Button>
              {story.status === 'Done' && <Button className="btn--half" onClick={confirmStoryAsDone}>Accept</Button>}
            </div>
          )}

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

          {showTimeRecordingModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Start Time Recording</h3>
                <p>Select task to record time for:</p>

                <div className="subtask-selection">
                  {subtasks
                    .map((subtask, originalIndex) => ({ subtask, originalIndex }))
                    .filter(({ subtask }) => subtask.developerId === user.uid && !subtask.isDone && !subtask.deleted)
                    .map(({ subtask, originalIndex }) => (
                      <div
                        key={originalIndex}
                        className={`subtask-option ${selectedSubtaskForRecording === originalIndex ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedSubtaskForRecording(originalIndex); // Use original index
                        }}
                      >
                        {subtask.description}
                      </div>
                    ))
                  }
                </div>

                <div className="modal-buttons">
                  <Button
                    onClick={() => {
                      setShowTimeRecordingModal(false);
                      setSelectedSubtaskForRecording(null);
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmStartRecording}
                    disabled={selectedSubtaskForRecording === null}
                  >
                    Start Recording
                  </Button>
                </div>
              </div>
            </div>
          )}
          {recordingSubtaskId !== null && (
            <div style={{ marginTop: '10px' }}>
              <strong>Recording: </strong>
              {subtasks[recordingSubtaskId]?.description}
              <br />
              <strong>Time: </strong>
              {formatTime(currentRecordingTime)}
            </div>
          )}
        </div>
      ) : (
        <UserStoryForm
          projectId={story.projectId}
          story={story}
          onStoryAdded={handleEditComplete}
          onCancel={() => setEditView(false)}
        />
      )}
      {confirmDeleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center' }}>Confirm Delete</h3>
            <p className="modal-text" style={{ textAlign: 'center' }}>
              Are you sure you want to delete this task?
            </p>
            <div className="modal-buttons">
              <Button
                variant="secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </Button>
              <Button className="btn btn--primery" onClick={handleConfirmDelete}>
                Delete task
              </Button>
            </div>
          </div>
        </div>
      )}
      {showWorktimeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center' }}>Enter Worktime</h3>
            <p className="modal-text" style={{ textAlign: 'center' }}>
              Please enter the worktime for this subtask:
            </p>
            <Input
              type="number"
              value={worktime}
              onChange={(e) => setWorktime(e.target.value)}
              placeholder="Enter worktime in hours"
              style={{ display: 'block', margin: '10px auto', padding: '5px' }}
            />
            <div className="modal-buttons">
              <Button variant="secondary" onClick={() => setShowWorktimeModal(false)}>
                Cancel
              </Button>
              <Button
                className="btn btn--primary"
                onClick={() => handleSubmitWorktime(currentSubtaskIndex)}
              >
                Submit Worktime
              </Button>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
        }
        
        .subtask-selection {
          margin: 15px 0;
          max-height: 200px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        .subtask-option {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subtask-option:hover {
  background-color: #f5f5f5;
}

.subtask-option.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
  transform: scale(1.02);
}
        
        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .recording-subtask {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
        }

        .recording-timer {
  color: #d9534f;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}


      `}</style>
    </>
  );
};

export default StoryDetailsComponent;