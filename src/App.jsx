import { useState } from "react";
import SlotMachine from "./SlotMachine";
import "./index.css";

export default function App() {
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  return (
    <div className="app-container">

      {/* === DEMO WARNING PANEL === */}
      {showDemoPanel && (
        <div className="demo-overlay">
          <div className="demo-box">
            <h2 className="demo-title">DEMO GAME</h2>

            <p className="demo-text">
              Acesta este un joc <b>DEMO</b>.  
              Banii, câștigurile și pierderile sunt <b>100% virtuale</b>.<br />
              Nu reprezintă jocuri de noroc reale.
            </p>

            <button 
              className="demo-btn"
              onClick={() => setShowDemoPanel(false)}
            >
              OK, AM ÎNȚELES
            </button>
          </div>
        </div>
      )}

      {/* === CONTENT === */}
      {!showDemoPanel && (
        <>
          <h1 className="title">MEMO BET 🎰</h1>
          <SlotMachine />
        </>
      )}

    </div>
  );
}
