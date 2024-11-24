// Location: client/src/MainPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const server = process.env.REACT_APP_BACKEND_URL;


  const createFight = async () => {
    const response = await fetch(`${server}/fight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    navigate(`/fight/${data.fightId}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      createFight();
    }
  };

  return (
    <div className="page-container">
      <div className="title">Create a New Fight</div>
      <input
        type="text"
        placeholder="Enter fight name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={createFight}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Create Fight
      </button>
    </div>
  );
};

export default MainPage;
