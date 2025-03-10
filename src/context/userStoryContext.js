import React, { createContext, useContext, useState } from 'react';


const UserStoryContext = createContext();


export const useUserStory = () => useContext(UserStoryContext);

export const UserStoryProvider = ({ children }) => {
  const [userStories, setUserStories] = useState([]);

  const addUserStory = (newStory) => {
    setUserStories((prevStories) => [...prevStories, newStory]);
  };

  return (
    <UserStoryContext.Provider value={{ userStories, addUserStory }}>
      {children}
    </UserStoryContext.Provider>
  );
};
