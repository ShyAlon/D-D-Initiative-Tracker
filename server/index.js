const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());


// In-memory storage
const fights = new Map();

// API ROUTES
app.post("/fight", (req, res) => {
  const fightId = uuidv4();
  fights.set(fightId, {
    id: fightId,
    name: req.body.name || "Untitled Fight",
    combatants: [],
    turnTime: 30,
    currentTurn: 0,
    mode: "setup",
  });
  res.json({ fightId, url: `/fight/${fightId}` });
});

app.get("/fight/:id", (req, res) => {
  const fight = fights.get(req.params.id);
  if (!fight) {
    return res.status(404).send("Fight not found.");
  }
  res.json(fight);
});

// Serve React frontend
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));

// Fallback for React Router (serve React app for non-API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
