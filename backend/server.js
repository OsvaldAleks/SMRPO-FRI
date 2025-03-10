const express = require("express");
const cors = require("cors");
const { db, auth } = require("./firebase");



// Import routes
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const userStoryRoutes = require("./routes/userStoryRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.get('/projects/user/:id', (req, res) => {
  res.json({ message: 'This is the project data' });
});
const PORT = process.env.PORT || 5001;

// Use routes
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/sprints", sprintRoutes);
app.use("/userStories", userStoryRoutes);

// Catch-all for unhandled routes
app.use('*', (req, res) => {
    res.status(404).json({ message: "Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
