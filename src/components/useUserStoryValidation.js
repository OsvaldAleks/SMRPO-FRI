import { useState } from 'react';


const useUserStoryValidation = (userStories) => {
  const [error, setError] = useState('');

  const checkDuplicateName = (name) => {
    return userStories.some((story) => story.name === name);
  };

  const validateStory = (story) => {
    setError('');

    if (checkDuplicateName(story.name)) {
      setError('User story name already exists.');
      return false;
    }

    if (!['must have', 'could have', 'should have', 'won\'t have this time'].includes(story.priority)) {
      setError('Priority must be one of: must have, could have, should have, or won\'t have this time.');
      return false;
    }

    if (story.businessValue < 0 || story.businessValue > 100) {
      setError('Business value must be between 0 and 100.');
      return false;
    }

    return true;
  };

  return {
    validateStory,
    error
  };
};

export default useUserStoryValidation;
