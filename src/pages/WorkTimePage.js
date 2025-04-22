import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStoriesWithWorkTimes, updateWorkTime } from '../api';
import { useNavigate } from 'react-router-dom';
import { ProjectsContext } from "../context/ProjectsContext";
import Input from '../components/Input';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import './style/worktimes.css';

const WorkTimesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const { projects } = useContext(ProjectsContext);

  useEffect(() => {
    const fetchWorkTimes = async () => {
      try {
        setLoading(true);
        if (user?.uid) {
          const stories = await getUserStoriesWithWorkTimes(user.uid);
          setUserStories(stories);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkTimes();
  }, [user?.uid]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleEditStart = (storyId, subtaskIndex, workTimeIndex, currentHours) => {
    setEditing(`${storyId}-${subtaskIndex}-${workTimeIndex}`);
    setEditValue(currentHours);
  };

  const handleEditCancel = () => {
    setEditing(null);
    setEditValue('');
  };
  const getProjectTitle = (projectId) => {
    const project = projects.find((p) => p.projectId === projectId);
    return project ? project.projectName : 'Unknown Project';
  };
  
  const handleEditSave = async (storyId, subtaskIndex, workTimeIndex) => {
    try {
      const hours = parseFloat(editValue);
      if (isNaN(hours) || hours < 0) {
        throw new Error('Please enter a valid positive number');
      }
  
      // Convert hours to seconds for storage
      const seconds = Math.round(hours * 3600);
      
      await updateWorkTime(storyId, subtaskIndex, workTimeIndex, {
        duration: seconds,
        // Preserve existing fields
        userid: user.uid,
        timestamp: new Date().toISOString() // Update timestamp
      });
  
      // Refresh data
      const stories = await getUserStoriesWithWorkTimes(user.uid);
      setUserStories(stories);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="center--box">Loading...</div>;
  if (error) return <div className="center--box">Error: {error}</div>;

  return (
    <div className="center--box worktimes">
      <h1>My Work Times</h1>
      {userStories.length === 0 ? (
        <p>No work times recorded yet</p>
      ) : (
        userStories.map(story => (
          <div key={story.id} style={{ marginBottom: '20px' }}>
            <h2><span className="project-title">{getProjectTitle(story.projectId)}</span> &mdash; {story.name}</h2>
            <p>{story.description}</p>
            
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Subtask</th>
                  <th>Time Entries</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {story.subtasks.map((subtask, subtaskIndex) => {
                  const totalSeconds = subtask.worktimes
                    .filter(wt => wt.userid === user.uid)
                    .reduce((sum, wt) => sum + wt.duration, 0);
                  
                  return (
                    <tr key={subtaskIndex}>
                      <td>{subtask.description}</td>
                      <td>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {subtask.worktimes
                            .filter(wt => wt.userid === user.uid)
                            .map((worktime, workTimeIndex) => {
                              const editKey = `${story.id}-${subtask.originalIndex}-${workTimeIndex}`;
                              const isEditing = editing === editKey;
                              const hours = (worktime.duration / 3600).toFixed(2);
                              
                              return (
                                <li key={workTimeIndex}>
                                  <div className="worktime-left">
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        step="0.25"
                                        min="0"
                                        style={{ width: '80px' }}
                                      />
                                    ) : (
                                      <span>{hours} hours</span>
                                    )}
                                  </div>
                                  <div className="worktime-actions">
                                    {isEditing ? (
                                      <>
                                        <FaCheck
                                          onClick={() => handleEditSave(story.id, subtask.originalIndex, workTimeIndex)}
                                          className="worktime-icon save-icon"
                                          title="Save"
                                        />
                                        <FaTimes
                                          onClick={handleEditCancel}
                                          className="worktime-icon cancel-icon"
                                          title="Cancel"
                                        />
                                      </>
                                    ) : (
                                      <FaEdit
                                        onClick={() =>
                                          handleEditStart(story.id, subtask.originalIndex, workTimeIndex, hours)
                                        }
                                        className="worktime-icon edit-icon"
                                        title="Edit"
                                      />
                                    )}
                                  </div>
                                </li>                              );
                            })}
                        </ul>
                      </td>
                      <td>{formatTime(totalSeconds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default WorkTimesPage;