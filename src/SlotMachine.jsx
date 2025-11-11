import { useState } from "react";
import { symbols } from "./symbols";
import "./index.css"; // stil separat

export default function SlotMachine() {
  // 3x3 grilă
  const [slots, setSlots] = useState([
    ["❔", "❔", "❔"],
    ["❔", "❔", "❔"],
    ["❔", "❔", "❔"],
  ]);

  function roll() {
    const newSlots = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () =>
        symbols[Math.floor(Math.random() * symbols.length)]
      )
    );
    setSlots(newSlots);
  }

  // câștig = rând complet identic (poți schimba după dorință)
  const isWin = slots.some(
    (row) => row[0] === row[1] && row[1] === row[2]
  );

  return (
    <div className="machine-wrapper">
      <h1 className="title">🎰 Pacanele MEMO 🎰</h1>

      <div className="slot-container">
        {slots.map((row, i) => (
          <div key={i} className="slot-row">
            {row.map((symbol, j) => (
              <div key={j} className="slot-cell">
                {symbol}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button className="spin-btn" onClick={roll}>
        SPIN
      </button>

      <h2 className="result">
        {isWin ? "🔥 AI DAT BARBUT BOSS! 🔥" : "Mai încearcă boss 😎"}
      </h2>
    </div>
  );
}
