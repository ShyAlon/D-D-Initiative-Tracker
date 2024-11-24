import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Controls from "./components/Controls";
import CombatantsList from "./components/CombatantsList";

const socket = io("http://localhost:3000");

const FightPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fight, setFight] = useState(null);
  const [name, setName] = useState("");
  const [initiative, setInitiative] = useState("");
  const [countdownDuration, setCountdownDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);

  function beep() {
    if (!isMuted) {
      var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
      snd.play();
    }
  }

  useEffect(() => {
    socket.emit("joinFight", id);

    fetch(`http://localhost:3000/fight/${id}`)
      .then((res) => res.json())
      .then((data) => setFight(data));

    socket.on("fightUpdate", (updatedFight) => {
      setFight(updatedFight);
      if (updatedFight.mode === "combat" && updatedFight.countdown < 11) {
        beep();
      }
    });

    return () => {
      socket.off("fightUpdate");
    };
  }, [id, isMuted]);

  const addCombatant = async () => {
    if (name.trim() === "" || !Number.isInteger(Number(initiative))) return;

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

  const startFight = async () => {
    await fetch(`http://localhost:3000/fight/${id}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countdownDuration }),
    });
  };

  const resetFight = async () => {
    const response = await fetch(`http://localhost:3000/fight/${id}`);
    const oldFight = await response.json();

    await fetch(`http://localhost:3000/fight/${id}/stop`, { method: "POST" });

    const newResponse = await fetch("http://localhost:3000/fight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: oldFight.name }),
    });
    const newFight = await newResponse.json();

    for (const combatant of oldFight.combatants) {
      await fetch(`http://localhost:3000/fight/${newFight.fightId}/combatant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: combatant.name,
          initiative: combatant.initiative,
        }),
      });
    }

    await fetch(`http://localhost:3000/fight/${newFight.fightId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countdownDuration }),
    });

    navigate(`/fight/${newFight.fightId}`);
  };

  const finishTurn = async () => {
    await fetch(`http://localhost:3000/fight/${id}/skip`, { method: "POST" });
  };

  const actNow = async (combatantId, position) => {
    await fetch(`http://localhost:3000/fight/${id}/actNow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ combatantId, position }),
    });
  };

  const updateStatus = async (combatantId, status) => {
    await fetch(`http://localhost:3000/fight/${id}/combatant/${combatantId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const updateCountdownDuration = async () => {
    await fetch(`http://localhost:3000/fight/${id}/countdown`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countdownDuration }),
    });
  };


  if (!fight) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="title">{fight.name}</div>
      <Controls
        countdownDuration={countdownDuration}
        setCountdownDuration={(value) => {
          setCountdownDuration(value);
          if (fight.mode === "combat") {
            updateCountdownDuration();
          }
        }}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />
      {fight.mode === "setup" ? (
        <div>
          <p>Setup Mode</p>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent page reload
              addCombatant();
            }}
            style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                flex: "1",
              }}
            />
            <input
              type="number"
              placeholder="Initiative"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "80px",
                textAlign: "center",
              }}
            />
            <button
              type="submit"
              disabled={name.trim() === "" || !Number.isInteger(Number(initiative))}
              style={{
                padding: "10px 20px",
                backgroundColor: name.trim() && initiative ? "#007bff" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: name.trim() && initiative ? "pointer" : "not-allowed",
              }}
            >
              Add Combatant
            </button>
          </form>
          <CombatantsList
            combatants={fight.combatants}
            fight={fight}
            updateStatus={updateStatus}
            actNow={actNow}
            finishTurn={finishTurn}
          />
          <button
            onClick={startFight}
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Start Combat
          </button>
        </div>
      ) : (
        <div>
          <p>Combat Mode</p>
          <CombatantsList
            combatants={fight.combatants}
            fight={fight}
            updateStatus={updateStatus}
            actNow={actNow}
            finishTurn={finishTurn}
          />
          <button
            onClick={resetFight}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              backgroundColor: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Reset Fight
          </button>
        </div>
      )}
    </div>
  );
};

export default FightPage;
