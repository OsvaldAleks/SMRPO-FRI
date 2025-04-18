import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStoriesForUser, updateSubtask } from '../api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const WorkTimePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchWorkTimes = async () => {
      try {
        setLoading(true);
        if (user?.uid) {
          const stories = await getUserStoriesForUser(user.uid);
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

  const handleEditStart = (storyId, subtaskIndex, currentTime) => {
    setEditing(`${storyId}-${subtaskIndex}`);
    setEditValue(currentTime);
  };

  const handleEditCancel = () => {
    setEditing(null);
    setEditValue('');
  };

  const handleEditSave = async (storyId, subtaskIndex) => {
    try {
      const hours = parseFloat(editValue);
      if (isNaN(hours) || hours < 0) {
        throw new Error('Please enter a valid positive number');
      }

      await updateSubtask(storyId, {
        subtaskIndex,
        timeEstimate: hours
      });

      // Refresh data
      const stories = await getUserStoriesForUser(user.uid);
      setUserStories(stories);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="center--box">Loading...</div>;
  if (error) return <div className="center--box">Error: {error}</div>;

  return (
    <div className="center--box">
      <h1>My Work Times</h1>
      <Button onClick={() => navigate(-1)}>Back</Button>

      {userStories.length === 0 ? (
        <p>No work times recorded yet</p>
      ) : (
        userStories.map(story => (
          <div key={story.id} className="card" style={{ marginBottom: '20px' }}>
            <h2>{story.name}</h2>
            <p>{story.description}</p>
            
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Subtask</th>
                  <th>Time Worked (hours)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {story.subtasks
                  .filter(subtask => subtask.worktimes && subtask.worktimes.length > 0)
                  .map((subtask, index) => {
                    const totalHours = subtask.worktimes.reduce((sum, wt) => sum + (wt.duration / 3600), 0);
                    const isEditing = editing === `${story.id}-${index}`;
                    
                    return (
                      <tr key={index}>
                        <td>{subtask.description}</td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              step="0.25"
                              min="0"
                            />
                          ) : (
                            totalHours.toFixed(2)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <>
                              <Button onClick={() => handleEditSave(story.id, index)}>Save</Button>
                              <Button variant="secondary" onClick={handleEditCancel}>Cancel</Button>
                            </>
                          ) : (
                            <Button onClick={() => handleEditStart(story.id, index, totalHours.toFixed(2))}>
                              Edit
                            </Button>
                          )}
                        </td>
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

export default WorkTimePage;