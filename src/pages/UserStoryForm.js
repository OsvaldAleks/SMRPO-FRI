import React, { useState } from 'react';
import { createUserStory } from '../api';
import { validateStory } from '../utils/storyUtils.js';
import Button from '../components/Button';
import Input from '../components/Input';
import './style/UserStoryForm.css'; // Add this for custom styles

const UserStoryForm = ({ projectId, onStoryAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceTests, setAcceptanceTests] = useState(['']); // Initialize with one empty field
  const [priority, setPriority] = useState('');
  const [businessValue, setBusinessValue] = useState(''); // Default to empty
  const [error, setError] = useState(''); // State to store error messages

  const handleAcceptanceTestChange = (index, value) => {
    const updatedTests = [...acceptanceTests];
    updatedTests[index] = value;
    setAcceptanceTests(updatedTests);
  };
  
  const addAcceptanceTestField = () => {
    setAcceptanceTests([...acceptanceTests, '']);
  };

  const removeAcceptanceTestField = (index) => {
    const updatedTests = acceptanceTests.filter((_, i) => i !== index);
    setAcceptanceTests(updatedTests);
  };

  const handleBusinessValueChange = (value) => {
    // Allow only numbers between 0 and 10
    if (/^\d*$/.test(value) && (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 10))) {
      setBusinessValue(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate business value
    const businessValueNum = parseInt(businessValue, 10);
    if (isNaN(businessValueNum)) {
      setError("Business value must be a number between 0 and 10.");
      return;
    }

    const newStory = {
      name,
      description,
      acceptanceCriteria: acceptanceTests.filter((item) => item.trim() !== ''),
      priority,
      businessValue: businessValueNum,
      projectId, // Automatically passed in from props
      sprintId: [], // Default to an empty array
    };

    try {
      // Validate the story
      if (!validateStory(newStory)) {
        throw new Error('Invalid story data. Please check all fields.');
      }

      // Create the story
      const response = await createUserStory(newStory);
      if (response.error) {
        setError(response.message);
      } else {
        // Reset form fields
        setName('');
        setDescription('');
        setAcceptanceTests(['']);
        setPriority('');
        setBusinessValue('');
        setError('');

        // Notify parent component
        onStoryAdded(); // Ensure this is called
      }
    } catch (err) {
      // Display error message
      setError(
        err.message === 'A user story with the same name already exists in this project.'
          ? 'User stories should have unique names'
          : err.message || 'Failed to create user story. Please try again.'
      );
    }
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
          <textarea
            className="block--element textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3} // 3 lines for multiline input
            required
            placeholder="Enter the description"
          />
        </div>

        <div className="block--element">
          <label className="block--element">Acceptance Tests</label>
          {acceptanceTests.map((test, index) => (
            <div key={index} className="acceptance-test-container">
              <textarea
                className="block--element textarea acceptance-test"
                value={test}
                onChange={(e) => handleAcceptanceTestChange(index, e.target.value)}
                rows={3} // 3 lines for multiline input
                required
                placeholder={`Enter acceptance test ${index + 1}`}
              />
              {acceptanceTests.length > 1 && ( // Show remove button only if there are multiple fields
                <Button
                  className="btn--remove"
                  type="button"
                  onClick={() => removeAcceptanceTestField(index)}
                >
                  -
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={addAcceptanceTestField}>
            +
          </Button>
        </div>

        <div className="block--element">
          <label className="block--element">Priority:</label>
          <div className="select-container">
            <select
              className="select select--full-width" // Add class for full width
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Select Priority</option>
              <option value="must have">Must Have</option>
              <option value="should have">Should Have</option>
              <option value="could have">Could Have</option>
              <option value="won't have this time">Won't Have This Time</option>
            </select>
          </div>
        </div>

        <div className="block--element">
          <label className="block--element">Business Value</label>
          <Input
            className="block--element"
            type="number"
            min="0"
            max="10"
            value={businessValue}
            onChange={(e) => handleBusinessValueChange(e.target.value)}
            required
            placeholder="Enter business value (0-10)"
          />
        </div>

        {error && <div className="p--alert">{error}</div>}
        <Button className="btn--block" type="submit">
          Add User Story
        </Button>
      </form>
    </div>
  );
};

export default UserStoryForm;