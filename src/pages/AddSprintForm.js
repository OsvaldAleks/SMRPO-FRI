import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createSprint } from "../api";
import Button from "../components/Button";
import Input from "../components/Input";

const AddSprintForm = ({ projectName, onSprintAdded }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [velocity, setVelocity] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const formatDate = (date) => date.toISOString().split("T")[0];

    setStartDate(formatDate(today));
    setEndDate(formatDate(oneWeekLater));
  }, []);

  const validateForm = () => {
    if (!startDate || !endDate || !velocity) {
      setError("All fields are required.");
      return false;
    }

    const today = new Date();
    const selectedStartDate = new Date(startDate);

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
        onSprintAdded(); // Call the callback to refresh the sprints list
      }
    } catch (err) {
      setError("An error occurred while adding the sprint.");
    }
  };

  const handleVelocityChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setVelocity(value);
    }
  };

  return (
    <div className="center--box">
      <h1>Add New Sprint</h1>
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
          />
        </div>
        <div className={"block--element"}>
          <label className={"block--element"}>Velocity</label>
          <Input
            type="number"
            className={"block--element"}
            value={velocity}
            onChange={handleVelocityChange}
            placeholder="Enter velocity"
            step="0.01"
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <Button type="submit">Add Sprint</Button>
      </form>
    </div>
  );
};

export default AddSprintForm;
