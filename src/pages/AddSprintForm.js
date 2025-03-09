import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSprint } from "../api";

const AddSprintForm = () => {
  const { projectName } = useParams(); // Get projectId from URL
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [velocity, setVelocity] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Set default start and end dates on component mount
  useEffect(() => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    // Format dates to YYYY-MM-DD for input fields
    const formatDate = (date) => date.toISOString().split("T")[0];

    setStartDate(formatDate(today));
    setEndDate(formatDate(oneWeekLater));
  }, []);

  // Validate form fields
  const validateForm = () => {
    if (!startDate || !endDate || !velocity) {
      setError("All fields are required.");
      return false;
    }

    const today = new Date();
    const selectedStartDate = new Date(startDate);

    // Compare only the date part (year, month, day)
    const isStartDateValid =
      selectedStartDate.getFullYear() > today.getFullYear() ||
      (selectedStartDate.getFullYear() === today.getFullYear() &&
        selectedStartDate.getMonth() > today.getMonth()) ||
      (selectedStartDate.getFullYear() === today.getFullYear() &&
        selectedStartDate.getMonth() === today.getMonth() &&
        selectedStartDate.getDate() >= today.getDate());

    if (!isStartDateValid) {
      setError("Start date cannot be in the past.");
      return false;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after the start date.");
      return false;
    }

    if (isNaN(velocity) || velocity <= 0) {
      setError("Velocity must be a positive number.");
      return false;
    }

    // Check if velocity has more than 2 decimal places
    const decimalPlaces = (velocity.toString().split(".")[1] || []).length;
    if (decimalPlaces > 2) {
      setError("Velocity must have no more than 2 decimal places.");
      return false;
    }

    setError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      const sprintData = {
        projectName: projectName,
        start_date: startDate,
        end_date: endDate,
        velocity: parseFloat(velocity),
      };
  
      const response = await createSprint(sprintData);
  
      if (response.error) {
        setError(response.message || "Failed to add sprint.");
      } else {
        setSuccessMessage("Sprint added successfully!");
        setError("");
  
        // Navigate to the new sprint's page
        navigate(`/`);
      }
    } catch (err) {
      setError("An error occurred while adding the sprint.");
    }
  };
  // Handle velocity input change
  const handleVelocityChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setVelocity(value);
    }
  };

  return (
    <div className="add-sprint-form">
      <h1>Add New Sprint</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // Prevent past dates
            required
          />
        </div>
        <div>
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate} // End date cannot be before start date
            required
          />
        </div>
        <div>
          <label>Velocity</label>
          <input
            type="number"
            value={velocity}
            onChange={handleVelocityChange}
            placeholder="Enter velocity"
            step="0.01" // Allow 2 decimal places
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <button type="submit">Add Sprint</button>
      </form>
    </div>
  );
};

export default AddSprintForm;
