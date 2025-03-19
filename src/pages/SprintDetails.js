import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import {
  getSprintData,
  getProject,
  getStoriesForProject,
  assignUserStoryToSprint,
} from "../api.js";
import Button from '../components/Button.js';
import { formatDate } from "../utils/storyUtils.js";
import "./style/SprintDetails.css";
import StoryDetailsComponent from '../components/StoryDetailsComponent.js';

const SprintDetails = () => {
  const { projectName, sprintId } = useParams();
  const { user, loading } = useAuth();

  const [projectId, setProjectId] = useState(null);
  const [stories, setStories] = useState([]);
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [showIncludeStories, setShowIncludeStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [developers, setDevelopers] = useState([]);

  // Track which user stories are selected (checked) for adding to sprint
  const [selectedStories, setSelectedStories] = useState([]);

  // Ugotovimo, ali je sprint končan
  let sprintEnded = false;
  if (sprint && sprint.end_date) {
    // Če je end_date string, preverimo, ali je manjši od trenutnega datuma
    const endAsDate = new Date(sprint.end_date);
    if (endAsDate < new Date()) {
      sprintEnded = true;
    }
  }

  // Fetch Sprint Data
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

  // Fetch Project Info, da ugotovimo projectId in vlogo (role)
  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        if (!projectName || !user?.uid) return;

        const projectData = await getProject(projectName, user.uid);
        setProjectId(projectData.project.id);

        setDevelopers(projectData.project.devs?.map((dev) => dev.username) || []);
        console.log(projectData.project.devs?.map((dev) => dev.username));

        // Preverimo, ali je user dev, scrumMaster ali productManager
        if (projectData.project.productManagers?.some(pm => pm.id === user.uid)) {
          setRole("productManagers");
        } else if (projectData.project.devs?.some((dev) => dev.id === user.uid)) {
          setRole("devs");
        } else if (projectData.project.scrumMasters?.some(sm => sm.id === user.uid)) {
          setRole("scrumMasters");
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError("Failed to load project data. Please try again later.");
      }
    };
    fetchProjectInfo();
  }, [projectName, user]);

  // Ko imamo projectId, pridobimo user stories
  useEffect(() => {
    fetchStories();
  }, [projectId]);

  const fetchStories = async () => {
    if (!projectId) return;
    try {
      const { stories } = await getStoriesForProject(projectId);
      setStories(stories);
    } catch (err) {
      setError(err.message);
    }
  };

  // Če posodobimo status zgodbe, po potrebi reloadamo stories
  const updateStoryStatus = (storyId) => {
    setStories((prevStories) =>
      prevStories.map((story) => {
        if (story.id === storyId) {
          // Poljubno spreminjamo status, če bi želeli
          let newStatus;
          if (["Backlog", "Product backlog"].includes(story.status)) {
            newStatus = "In progress";
          } else if (story.status === "In progress") {
            newStatus = "Done";
          } else {
            newStatus = "Done"; // Stays "Done" if already done
          }
          return { ...story, status: newStatus };
        }
        return story;
      })
    );
    fetchStories();
  };

  // Filtriramo zgodbe, ki so v tem sprintu
  const sprintStories = stories.filter((story) => story.sprintId?.includes(sprintId));

  // Razdelimo v stolpce
  const todoStories = sprintStories.filter((story) =>
    ["Backlog", "Product backlog"].includes(story.status)
  );
  const doingStories = sprintStories.filter((story) => story.status === "In progress");
  const doneStories = sprintStories.filter((story) => story.status === "Done");

  // Klik na zgodbo -> prikaz ali zapiranje detail pogleda
  const handleStoryClick = (story) => {
    setSelectedStory((prevStory) => (prevStory?.id === story.id ? null : story));
  };

  // Checkbox za dodajanje zgodb
  const handleCheckboxChange = (storyId) => {
    setSelectedStories((prevSelected) =>
      prevSelected.includes(storyId)
        ? prevSelected.filter((id) => id !== storyId)
        : [...prevSelected, storyId]
    );
  };

  // Gumb -> dodaj zgodbice v sprint
  const handleAddToSprint = async () => {
    if (!sprintId || selectedStories.length === 0) return;

    try {
      for (const storyId of selectedStories) {
        await assignUserStoryToSprint(storyId, sprintId);
      }
      setSelectedStories([]);
      setShowIncludeStories(false);
      fetchStories();
    } catch (err) {
      console.error("Failed to add stories to sprint:", err);
      setError("Failed to add selected stories to sprint. Check console.");
    }
  };

  // Če zapremo panel showIncludeStories in je bila izbrana zgodba takšna, ki ni v tem sprintu, jo deselectamo
  useEffect(() => {
    if (!showIncludeStories && selectedStory) {
      const notInAnySprint = stories.filter(
        (story) => !story.sprintId || story.sprintId.length === 0
      );
      if (notInAnySprint.some((story) => story.id === selectedStory.id)) {
        setSelectedStory(null);
      }
    }
  }, [showIncludeStories, selectedStory, stories, sprintId]);

  // Izračun, koliko vrstic rabimo
  const maxRows = Math.max(todoStories.length, doingStories.length, doneStories.length);

  if (loading) {
    return <div>Loading...</div>;
  }

  const notInAnySprint = stories.filter(
    (story) => !story.sprintId || story.sprintId.length === 0
  );

  return (
    <>
      {showIncludeStories && (
        <div className="center--box">
          <h1>Add Stories to Sprint</h1>
          <div className="responsive-table-container3">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Include</th>
                  <th>Story Title</th>
                </tr>
              </thead>
              <tbody>
                {notInAnySprint.map((story) => {
                  const hasPoints =
                    story.storyPoints !== undefined && story.storyPoints !== null;
                  return (
                    <tr
                      key={story.id}
                      className={selectedStory?.id === story.id ? "selected" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          disabled={!hasPoints}
                          checked={selectedStories.includes(story.id)}
                          onChange={() => handleCheckboxChange(story.id)}
                          style={{ cursor: hasPoints ? "pointer" : "not-allowed" }}
                        />
                      </td>
                      <td
                        onClick={() => handleStoryClick(story)}
                        style={{ color: hasPoints ? "inherit" : "gray" }}
                      >
                        {story.name}
                        {!hasPoints && (
                          <span style={{ marginLeft: "8px", color: "red" }}>
                            (Missing story points)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button className="btn--block" onClick={handleAddToSprint}>
            Add Selected ->
          </Button>
        </div>
      )}

      <div className="center--box">
        <h1>Sprint Details</h1>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {sprint ? (
          <div>
            <p>
              <strong>Start Date: </strong>
              {sprint?.start_date
                ? formatDate(sprint.start_date)
                : "No start date available"}
            </p>
            <p>
              <strong>End Date: </strong>
              {sprint?.end_date
                ? formatDate(sprint.end_date)
                : "No end date available"}
            </p>
            <p>
              <strong>Velocity: </strong> {sprint.velocity}
            </p>
          </div>
        ) : (
          <p>Loading sprint data...</p>
        )}

        <div className="responsive-table-container-wide">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>TODO</th>
                <th>Doing</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td>
                    {todoStories[rowIndex] && (
                      <div
                        onClick={() => handleStoryClick(todoStories[rowIndex])}
                        className={`userStory ${
                          selectedStory?.id === todoStories[rowIndex].id ? "selected" : ""
                        }`}
                      >
                        <h2>{todoStories[rowIndex].name}</h2>
                        <p>Priority: {todoStories[rowIndex].priority}</p>
                        <p>Business Value: {todoStories[rowIndex].businessValue}</p>
                      </div>
                    )}
                  </td>
                  <td>
                    {doingStories[rowIndex] && (
                      <div
                        onClick={() => handleStoryClick(doingStories[rowIndex])}
                        className={`userStory ${
                          selectedStory?.id === doingStories[rowIndex].id ? "selected" : ""
                        }`}
                      >
                        <h2>{doingStories[rowIndex].name}</h2>
                        <p>Priority: {doingStories[rowIndex].priority}</p>
                        <p>Business Value: {doingStories[rowIndex].businessValue}</p>
                      </div>
                    )}
                  </td>
                  <td>
                    {doneStories[rowIndex] && (
                      <div
                        onClick={() => handleStoryClick(doneStories[rowIndex])}
                        className={`userStory ${
                          selectedStory?.id === doneStories[rowIndex].id ? "selected" : ""
                        }`}
                      >
                        <h2>{doneStories[rowIndex].name}</h2>
                        <p>Priority: {doneStories[rowIndex].priority}</p>
                        <p>Business Value: {doneStories[rowIndex].businessValue}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {role === "scrumMasters" && (
                <tr>
                  <td>
                    <div
                      className={`userStory plus-button ${
                        showIncludeStories ? "selected" : ""
                      }`}
                      onClick={() => setShowIncludeStories((prev) => !prev)}
                    >
                      <span>+</span>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStory && (
        <StoryDetailsComponent
          story={selectedStory}
          userRole={role}
          fromSprintView={true}
          sprintEnded={sprintEnded}
          onUpdate={updateStoryStatus}
          projectDevelopers={developers} 
        />
      )}
    </>
  );
};

export default SprintDetails;
