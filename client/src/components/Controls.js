const Controls = ({ countdownDuration, setCountdownDuration, isMuted, setIsMuted }) => {
    return (
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Countdown Duration:</span>
          <input
            type="number"
            min="10"
            max="60"
            value={countdownDuration}
            onChange={(e) => setCountdownDuration(Number(e.target.value))}
            style={{
              width: "60px",
              padding: "5px",
              borderRadius: "5px",
              border: "2px solid #007bff",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "bold",
              background: "#f1f9ff",
            }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={isMuted}
            onChange={() => setIsMuted(!isMuted)}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              accentColor: "#007bff",
            }}
          />
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Mute Beep</span>
        </label>
      </div>
    );
  };
  
  export default Controls;
  