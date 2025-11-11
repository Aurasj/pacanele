import { useState } from "react";
import { symbols } from "./symbols";

export default function SlotMachine() {
  const [slots, setSlots] = useState(["❔", "❔", "❔"]);

  function roll() {
    const newSlots = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    setSlots(newSlots);
  }

  const isWin = slots[0] === slots[1] && slots[1] === slots[2];

  return (
    <div style={{ textAlign: "center", marginTop: "40px", fontSize: "50px" }}>
      <div>{slots[0]} {slots[1]} {slots[2]}</div>

      <button 
        onClick={roll} 
        style={{ marginTop: "20px", fontSize: "20px", padding: "10px 20px" }}
      >
        Spin
      </button>

      <h2 style={{ marginTop: "20px" }}>
        {isWin ? "🔥 AI DAT BARBUT BOSS! 🔥" : "Mai încearca boss 😎"}
      </h2>
    </div>
  );
}
