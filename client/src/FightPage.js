// Location: client/src/FightPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const FightPage = () => {
  const { id } = useParams();
  const [fight, setFight] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/fight/${id}`)
      .then((res) => res.json())
      .then((data) => setFight(data));
  }, [id]);

  if (!fight) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="title">{fight.name}</div>
      <p>Mode: {fight.mode}</p>
      {/* Add more fight details here */}
    </div>
  );
};

export default FightPage;
