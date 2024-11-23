// Location: client/src/FightPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const FightPage = () => {
  const { id } = useParams();
  const [fight, setFight] = useState(null);
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");

  useEffect(() => {
    // Join the fight room
    socket.emit("joinFight", id);

    // Listen for real-time updates
    socket.on("fightUpdate", (updatedFight) => {
      setFight(updatedFight);
    });

    return () => {
      socket.off("fightUpdate");
    };
  }, [id]);

  // Add a combatant
  const addCombatant = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:3000/fight/${id}/combatant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, initiative: parseInt(initiative, 10) }),
    });
    const combatants = await response.json();
    setFight((prev) => ({ ...prev, combatants }));
    setName("");
    setInitiative("");
  };

  // Start the fight
  const startFight = async () => {
    await fetch(`http://localhost:3000/fight/${id}/start`, { method: "POST" });
  };

  // Update combatant status
  const updateStatus = async (combatantId, status) => {
    await fetch(`http://localhost:3000/fight/${id}/combatant/${combatantId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  // Validate inputs
  const isFormValid = name.trim() !== "" && Number.isInteger(Number(initiative)) && Number(initiative) > 0;

  if (!fight) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="title">{fight.name}</div>

      {/* Setup Mode */}
      {fight.mode === "setup" ? (
        <div>
          <p>Setup Mode</p>
          <form onSubmit={addCombatant} style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "10px",
                marginRight: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="number"
              placeholder="Initiative"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              style={{
                padding: "10px",
                marginRight: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                padding: "10px 20px",
                backgroundColor: isFormValid ? "#007bff" : "#ccc",
                color: isFormValid ? "white" : "#666",
                cursor: isFormValid ? "pointer" : "not-allowed",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Add Combatant
            </button>
          </form>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {fight.combatants.map((combatant) => (
              <li
                key={combatant.id}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  background: "#f1f1f1",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: "bold" }}>{combatant.name}</span>
                <span>Initiative: {combatant.initiative}</span>
              </li>
            ))}
          </ul>
          <button onClick={startFight} style={{ padding: "10px 20px", marginTop: "10px" }}>
            Start Combat
          </button>
        </div>
      ) : (
        // Combat Mode
        <div>
          <p>Combat Mode</p>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {fight.combatants.map((combatant, index) => (
              <li
                key={combatant.id}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  background: fight.currentTurn === index ? "#d0eaff" : "#f1f1f1",
                  border: fight.currentTurn === index ? "2px solid #007bff" : "none",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <select
                    value={combatant.status}
                    onChange={(e) => updateStatus(combatant.id, e.target.value)}
                    style={{ marginRight: "10px" }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Wait">Wait</option>
                    <option value="Out">Out</option>
                  </select>
                  <span style={{ fontWeight: "bold", marginRight: "10px" }}>{combatant.name}</span>
                  <span>Initiative: {combatant.initiative}</span>
                </div>
                {fight.currentTurn === index && (
                  <span style={{ fontWeight: "bold", color: "red" }}>
                    Timer: {fight.countdown}s
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FightPage;
