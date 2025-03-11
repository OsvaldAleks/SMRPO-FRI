import React, { useState } from 'react';
import { createUserStory } from '../api';
import { validateStory } from '../utils/storyUtils.js';
import Button from '../components/Button';
import Input from '../components/Input';

const UserStoryForm = ({ projectId, onStoryAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(['']); // Initialize with one empty field
  const [priority, setPriority] = useState('');
  const [businessValue, setBusinessValue] = useState('');

  const handleAcceptanceCriteriaChange = (index, value) => {
    const updatedCriteria = [...acceptanceCriteria];
    updatedCriteria[index] = value;
    setAcceptanceCriteria(updatedCriteria);
  };

  const addAcceptanceCriteriaField = () => {
    setAcceptanceCriteria([...acceptanceCriteria, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newStory = {
      name,
      description,
      acceptanceCriteria: acceptanceCriteria.filter(item => item.trim() !== ''), 
      priority,
      businessValue: parseInt(businessValue, 10),
      projectId,     // automatically passed in from props
      sprintId: [],  // default to an empty array
    };

    if (validateStory(newStory)) {
      await createUserStory(newStory);
      setName('');
      setDescription('');
      setAcceptanceCriteria(['']); // Reset to one empty field
      setPriority('');
      setBusinessValue('');
    }
    onStoryAdded();
  };

  return (
    <div className="center--box">
      <h1>Add New User Story</h1>
      <form onSubmit={handleSubmit}>
        <div className="block--element">
          <label className="block--element">Name</label>
          <Input
            className="block--element"
            type="text"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter story name"
          />
        </div>
        
        <div className="block--element">
          <label className="block--element">Description</label>
          <Input
            className="block--element"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Enter the description"
          />
        </div> 

        <div className="block--element">
          <label className="block--element">Acceptance Criteria</label>
          {acceptanceCriteria.map((criteria, index) => (
            <div key={index} className="block--element">
              <Input
                className="block--element"
                value={criteria}
                onChange={(e) => handleAcceptanceCriteriaChange(index, e.target.value)}
                required
                placeholder={`Enter acceptance criteria ${index + 1}`}
              />
            </div>
          ))}
          
          <Button type="button" onClick={addAcceptanceCriteriaField}>+</Button>
        </div>

        <div className="block--element">
          <label className="block--element">Priority:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select Priority</option>
            <option value="must have">Must Have</option>
            <option value="could have">Could Have</option>
            <option value="should have">Should Have</option>
            <option value="won't have this time">Won't Have This Time</option>
          </select>
        </div>

        <div className="block--element">
          <label className="block--element">Business Value</label>
          <Input
            className="block--element"
            type="number"
            value={businessValue} 
            onChange={(e) => setBusinessValue(e.target.value)}
            required
            placeholder="Enter the business value"
          />
        </div>
        
        <Button type="submit">Add User Story</Button>
      </form>
    </div>
  );
};

export default UserStoryForm;
