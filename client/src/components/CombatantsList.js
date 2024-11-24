import React from "react";

const CombatantsList = ({ combatants, fight, updateStatus, actNow, finishTurn }) => {
  return (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {combatants &&
        combatants.map((combatant, index) => (
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
                <option value="Ready">Ready</option>
                <option value="Out">Out</option>
              </select>
              <span style={{ fontWeight: "bold", marginRight: "10px" }}>{combatant.name}</span>
              <span>Initiative: {combatant.initiative}</span>
            </div>
            {combatant.status === "Wait" || combatant.status === "Ready" ? (
              <button
                style={{
                  padding: "5px 15px",
                  backgroundColor: "orange",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  actNow(
                    combatant.id,
                    combatant.status === "Wait" ? "after" : "before"
                  )
                }
              >
                Act Now
              </button>
            ) : fight.currentTurn === index ? (
              <button
                style={{
                  fontWeight: "bold",
                  color: fight.countdown > 10 ? "white" : "red",
                  backgroundColor: "black",
                }}
                onClick={finishTurn}
              >
                {fight.countdown}s
              </button>
            ) : null}
          </li>
        ))}
    </ul>
  );
};

export default CombatantsList;
