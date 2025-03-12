import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserStory } from "../api.js";
import { useParams } from "react-router-dom";

const UserStoryDetails = ({ story }) => {
  const { user, loading } = useAuth();

  return (
    <div className="center--box">
      <h1>{story.name}</h1>
      <p><strong>Description:</strong> {story.description}</p>
      <p><strong>Priority:</strong> {story.priority}</p>
      <p><strong>Business Value:</strong> {story.businessValue}</p>
      <p><strong>Status:</strong> {story.status}</p>
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
