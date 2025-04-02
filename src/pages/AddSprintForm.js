import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createSprint, updateSprint, validateSprintDates } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";

const AddSprintForm = ({ projectId, projectName, onSprintAdded, sprint }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [velocity, setVelocity] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (sprint) {
      setIsEditing(true);
      setStartDate(sprint.start_date || "");
      setEndDate(sprint.end_date || "");
      setVelocity(sprint.velocity || "");
    } else {
      setIsEditing(false);
      const today = new Date();
      const oneWeekLater = new Date(today);
      oneWeekLater.setDate(today.getDate() + 7);

      const formatDate = (date) => date.toISOString().split("T")[0];

      setStartDate(formatDate(today));
      setEndDate(formatDate(oneWeekLater));
    }
  }, [sprint]);

  useEffect(() => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const formatDate = (date) => date.toISOString().split("T")[0];

    setStartDate(formatDate(today));
    setEndDate(formatDate(oneWeekLater));
  }, []);

  const getHolidaysForYear = (year) => {
    return [
      `${year}-01-01`, // New Year's Day
      `${year}-07-04`, // Independence Day
      `${year}-12-25`, // Christmas Day
      `${year}-02-08`, // Presernov Dan
      // Add more fixed-date holidays as needed
    ];
  };
  
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };
  
  const isHoliday = (date) => {
    const year = date.getFullYear();
    const holidays = getHolidaysForYear(year);
    const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return holidays.includes(formattedDate);
  };
  
  const validateForm = () => {
    if (!startDate || !endDate || !velocity) {
      setError("All fields are required.");
      return false;
    }
  
    const today = new Date();
    const selectedStartDate = new Date(startDate);
    const selectedEndDate = new Date(endDate);
  
    // Check if start date is valid (not in the past)
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
  
    // Check if start or end date is a weekend
    if (isWeekend(selectedStartDate) || isWeekend(selectedEndDate)) {
      setError("Start and end dates cannot be on a weekend.");
      return false;
    }
  
    // Check if start or end date is a holiday
    if (isHoliday(selectedStartDate) || isHoliday(selectedEndDate)) {
      setError("Start and end dates cannot be on a holiday.");
      return false;
    }
  
    // Check if end date is after start date
    if (selectedStartDate >= selectedEndDate) {
      setError("End date must be after the start date.");
      return false;
    }
  
    // Check if velocity is a valid number
    if (isNaN(velocity) || velocity <= 0) {
      setError("Velocity must be a positive number.");
      return false;
    }
  
    // Ensure velocity has no more than 2 decimal places
    const decimalPlaces = (velocity.toString().split(".")[1] || []).length;
    if (decimalPlaces > 2) {
      setError("Velocity must have no more than 2 decimal places.");
      return false;
    }
  
    setError("");
    return true;
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      // Validate sprint dates before creating/updating a sprint
      const validationResponse = await validateSprintDates(
        projectId, 
        startDate, 
        endDate,
        sprint?.id // Pass sprint ID when editing to exclude current sprint from validation
      );

      if (!validationResponse.success) {
        setError(validationResponse.message);
        return;
      }

      const sprintData = {
        projectName: projectName,
        start_date: startDate,
        end_date: endDate,
        velocity: parseFloat(velocity),
      };

      let response;
      if (isEditing) {
        // Update existing sprint
        response = await updateSprint(sprint.id, sprintData);
      } else {
        // Create new sprint
        response = await createSprint(sprintData);
      }

      if (response.error) {
        setError(response.message || `Failed to ${isEditing ? 'update' : 'add'} sprint.`);
      } else {
        setSuccessMessage(`Sprint ${isEditing ? 'updated' : 'added'} successfully!`);
        setError("");
        onSprintAdded();
      }
    } catch (err) {
      setError(`An error occurred while ${isEditing ? 'updating' : 'adding'} the sprint.`);
    }
  };

  const handleVelocityChange = (e) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d{0,2}$/.test(value)) {
      setVelocity(value);
    }
  };

  return (
    <div className="center--box">
      <h1>{isEditing ? "Edit Sprint" : "Add New Sprint"}</h1>
      <form onSubmit={handleSubmit}>
        <div className={"block--element"}>
          <label className={"block--element"}>Start Date</label>
          <Input
            type="date"
            className={"block--element"}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
            disabled={isEditing && new Date(sprint.start_date) < new Date()}
          />
        </div>
        <div className={"block--element"}>
          <label className={"block--element"}>End Date</label>
          <Input
            type="date"
            className={"block--element"}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
            disabled={isEditing && new Date(sprint.start_date) < new Date()}
          />
        </div>
        <div className={"block--element"}>
          <label className={"block--element"}>Velocity</label>
          <Input
            type="number"
            className={"block--element"}
            value={velocity}
            onChange={handleVelocityChange}
            placeholder="Velocity in story points"
            step="0.01"
            required
            disabled={isEditing && new Date(sprint.start_date) < new Date()} 
          />
        </div>
        {error && <p className="p--alert">{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {isEditing ?
          (
          <div style={{ margin: "0.5rem", display: "flex", gap: "0" }}>
          <Button className="btn--half btn--accent" onClick={(e) => {e.preventDefault();onSprintAdded()}}>
            CANCEL
          </Button>
          <Button className="btn--half" type="submit">
            UPDATE
          </Button>
          </div>
          )
          :(
          <Button className="btn--block" type="submit">
            Add Sprint
          </Button>)}
      </form>
    </div>
  );
};

export default AddSprintForm;
