const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Import CORS middleware

const app = express();
app.use(express.json());

// Allow multiple origins
const allowedOrigins = [
  "http://localhost:3001", // Local React frontend
  "https://dndinitiativetracker-m0nlg1bmu-shys-projects-e8e03e1e.vercel.app", // Deployed React frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // If using cookies or authentication
  })
);


// In-memory storage
const fights = new Map();
const fightTimers = new Map(); // Track active timers for each fight

// Serve React frontend
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));

// Utility function to determine the next active combatant
const getNextCombatantIndex = (combatants, currentTurn) => {
  let nextIndex = (currentTurn + 1) % combatants.length;
  while (combatants[nextIndex].status !== "Normal") {
    nextIndex = (nextIndex + 1) % combatants.length;
    if (nextIndex === currentTurn) break; // Prevent infinite loops
  }
  return nextIndex;
};

// Broadcast fight updates to all connected clients
const broadcastFightUpdate = (fightId) => {
  const fight = fights.get(fightId);
  if (fight) {
    io.to(fightId).emit("fightUpdate", fight);
  }
};

// Create the HTTP server and WebSocket server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001", // Allow requests from your frontend
    methods: ["GET", "POST"], // Allowed HTTP methods
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinFight", (fightId) => {
    socket.join(fightId);

    const fight = fights.get(fightId);
    if (fight) {
      socket.emit("fightUpdate", fight); // Send the current state
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Create a new fight
app.post("/fight", (req, res) => {
  const fightId = uuidv4();
  fights.set(fightId, {
    id: fightId,
    name: req.body.name || "Untitled Fight",
    combatants: [],
    currentTurn: null,
    countdown: null,
    mode: "setup",
  });
  res.json({ fightId, url: `/fight/${fightId}` });
});

// Get fight details
app.get("/fight/:id", (req, res) => {
  const fight = fights.get(req.params.id);
  if (!fight) return res.status(404).send("Fight not found.");
  res.json(fight);
});

// Add a combatant
app.post("/fight/:id/combatant", (req, res) => {
  const fight = fights.get(req.params.id);
  if (!fight || fight.mode !== "setup") return res.status(400).send("Invalid state.");
  const { name, initiative } = req.body;

  if (!name || !Number.isInteger(initiative) || initiative < 0) {
    return res.status(400).send("Invalid combatant data.");
  }

  fight.combatants.push({
    id: uuidv4(),
    name,
    initiative,
    status: "Normal",
  });

  // Sort combatants by initiative (highest first)
  fight.combatants.sort((a, b) => b.initiative - a.initiative);
  res.json(fight.combatants);
});

// Update combatant status
app.put("/fight/:id/combatant/:combatantId/status", (req, res) => {
  const fight = fights.get(req.params.id);
  if (!fight) return res.status(404).send("Fight not found.");

  const combatant = fight.combatants.find((c) => c.id === req.params.combatantId);
  if (!combatant) return res.status(404).send("Combatant not found.");

  const { status } = req.body;
  if (!["Normal", "Wait", "Ready", "Out"].includes(status)) {
    return res.status(400).send("Invalid status.");
  }

  combatant.status = status;
  broadcastFightUpdate(req.params.id); // Notify clients
  res.json(fight.combatants);
});

// Start the fight
app.post("/fight/:id/start", (req, res) => {
  const fightId = req.params.id;
  const fight = fights.get(fightId);

  if (!fight) return res.status(404).send("Fight not found.");
  if (fight.combatants.length === 0) return res.status(400).send("No combatants to start.");

  fight.mode = "combat";
  fight.currentTurn = 0;
  fight.countdown = 30;

  if (fightTimers.has(fightId)) clearInterval(fightTimers.get(fightId)); // Clear any existing timer

  // Start server-side countdown
  const timer = setInterval(() => {
    if (fight.countdown > 0) {
      fight.countdown -= 1;
    } else {
      fight.currentTurn = getNextCombatantIndex(fight.combatants, fight.currentTurn);
      fight.countdown = fight.countdownDuration || 30; // Reset countdown for the next combatant
    }
    broadcastFightUpdate(fightId); // Broadcast updates to all clients
  }, 1000);

  fightTimers.set(fightId, timer);
  broadcastFightUpdate(fightId); // Notify all clients of the fight state
  res.json(fight);
});

// Skip to the next combatant
app.post("/fight/:id/skip", (req, res) => {
  const fightId = req.params.id;
  const fight = fights.get(fightId);

  if (!fight) return res.status(404).send("Fight not found.");
  if (fight.combatants.length === 0) return res.status(400).send("No combatants to start.");

  fight.currentTurn = getNextCombatantIndex(fight.combatants, fight.currentTurn);
  fight.countdown = 30;
  broadcastFightUpdate(fightId);

  res.json(fight);
});

// Stop the fight
app.post("/fight/:id/stop", (req, res) => {
  const fightId = req.params.id;
  const fight = fights.get(fightId);

  if (!fight) return res.status(404).send("Fight not found.");

  if (fightTimers.has(fightId)) {
    clearInterval(fightTimers.get(fightId));
    fightTimers.delete(fightId);
  }

  fight.mode = "setup";
  fight.currentTurn = null;
  fight.countdown = null;
  broadcastFightUpdate(fightId); // Notify clients
  res.json(fight);
});

// Move combatant in turn order
app.post("/fight/:id/actNow", (req, res) => {
  const { combatantId, position } = req.body;
  const fight = fights.get(req.params.id);
  if (!fight) return res.status(404).send("Fight not found.");

  const currentIndex = fight.currentTurn;
  const combatantIndex = fight.combatants.findIndex((c) => c.id === combatantId);
  if (combatantIndex === -1) return res.status(404).send("Combatant not found.");

  const combatant = fight.combatants.splice(combatantIndex, 1)[0];

  if (position === "before") {
    fight.combatants.splice(currentIndex, 0, combatant);
    fight.countdown = 30; // Restart countdown
    fight.currentTurn = currentIndex; // Stay on the same turn
  } else if (position === "after") {
    fight.combatants.splice(currentIndex + 1, 0, combatant);
  }
  combatant.status = "Normal";
  broadcastFightUpdate(req.params.id);
  res.json(fight);
});

// Update countdown duration
app.put("/fight/:id/countdown", (req, res) => {
  const fight = fights.get(req.params.id);
  if (!fight) return res.status(404).send("Fight not found.");

  const { countdownDuration } = req.body;
  if (Number.isInteger(countdownDuration) && countdownDuration >= 10 && countdownDuration <= 60) {
    fight.countdownDuration = countdownDuration; // Update the server-side countdown
    broadcastFightUpdate(req.params.id); // Notify all connected clients
    res.json(fight);
  } else {
    res.status(400).send("Invalid countdown duration.");
  }
});


// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});


// Start the server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
