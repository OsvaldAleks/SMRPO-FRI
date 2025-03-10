import React, { useState } from 'react';
import { useUserStory } from '../context/userStoryContext';
import useUserStoryValidation from '../components/useUserStoryValidation';
import Button from '../components/Button';
import Input from '../components/Input';

const FormField = ({ label, value, onChange, type = 'text', name }) => (
  <div>
    <label>{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
    />
  </div>
);

const UserStoryForm = () => {
  const { userStories, addUserStory } = useUserStory();
  const { validateStory, error } = useUserStoryValidation(userStories);
  
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [acceptanceTests, setAcceptanceTests] = useState('');
  const [priority, setPriority] = useState('');
  const [businessValue, setBusinessValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newStory = { name, text, acceptanceTests, priority, businessValue: parseInt(businessValue) };

    if (validateStory(newStory)) {
      addUserStory(newStory);
      setName('');
      setText('');
      setAcceptanceTests('');
      setPriority('');
      setBusinessValue('');
    }
  };

  return (
    <div className="center--container wide--box">
        <div className="center--box ">
      <h2>Add New User Story</h2>
      <form onSubmit={handleSubmit}>

        <div className={"block--element"}>
         <label className={"block--element"}>
         Name
         </label>
            <Input
              className={"block--element"}
              type="Name"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your username or email"
            />
       </div>
       <div className={"block--element"}>
         <label className={"block--element"}>
         Text
         </label>
            <Input
              className={"block--element"}
              label="Text"
              value={text} 
              onChange={(e) => setText(e.target.value)}
              required
              placeholder="Enter the description"
            />
       </div> 
       
       <div className={"block--element"}>
         <label className={"block--element"}>
         2
         </label>
            <Input
              className={"block--element"}
              value={acceptanceTests} 
              onChange={(e) => setAcceptanceTests(e.target.value)}
              required
              placeholder="Enter the description"
            />
       </div>

        <div className={"block--element"}>
         <label className={"block--element"}>
         Priority:
         </label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select Priority</option>
            <option value="must have">Must Have</option>
            <option value="could have">Could Have</option>
            <option value="should have">Should Have</option>
            <option value="won't have this time">Won't Have This Time</option>
          </select>
        </div>

        <div className={"block--element"}>
         <label className={"block--element"}>
         Business Value
         </label>
            <Input
              className={"block--element"}
              type="number"
              value={businessValue} 
              onChange={(e) => setBusinessValue(e.target.value)}
              required
              placeholder="Enter the description"
            />
       </div>
        <Button type="submit">Add User Story</Button>
      </form>

      {error && <div className='p--alert'>{error}</div>}

      <h2>Existing User Stories</h2>
      <ul>
        {userStories.map((story, index) => (
          <li key={index}>
            <strong>{story.name}</strong> - {story.priority} - Business Value: {story.businessValue}
          </li>
        ))}
      </ul>
      </div>
 </div> );
};

export default UserStoryForm;
