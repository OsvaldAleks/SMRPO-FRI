import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserStory } from "../api.js";
import { useParams } from "react-router-dom";
import StoryDetailsComponent from '../components/StoryDetailsComponent.js'

const UserStoryDetails = () => {
  const { user, loading } = useAuth();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!storyId) return;

    getUserStory(storyId)
      .then((data) => setStory(data))
      .catch((err) => setError(err.message));

  }, [storyId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!story) return <p>Loading story details...</p>;

  return (
    <StoryDetailsComponent story={story}/>
  );
};

export default UserStoryDetails;
