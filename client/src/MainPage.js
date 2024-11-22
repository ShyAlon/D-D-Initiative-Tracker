// Location: client/src/MainPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");

  const startFight = async () => {
    const response = await fetch("http://localhost:3000/fight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    navigate(data.url);
  };

  return (
    <div className="page-container">
      <div className="title">D&D Initiative Manager</div>
      <input
        type="text"
        placeholder="Fight Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          margin: "20px 0",
          padding: "10px",
          width: "100%",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      <button onClick={startFight}>Start Fight</button>
    </div>
  );
};

export default MainPage;
