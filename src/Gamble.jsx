import { useState } from "react";
import "./gamble.css";

export default function Gamble({ win, onClose, onCollect }) {
  const [current, setCurrent] = useState(win);
  const [revealed, setRevealed] = useState(null);
  const [result, setResult] = useState(null);

  // Istoric persistent (refresh = stergere)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("gambleHistory");
    return saved ? JSON.parse(saved) : [];
  });

  function pick(color) {
    if (revealed) return;

    const real = Math.random() < 0.5 ? "red" : "black";
    setRevealed(real);

    const isWin = real === color;
    setResult(isWin);
    const newAmount = isWin ? current * 2 : 0;

    //salvam cartea în istoric si în localStorage
    setHistory(prev => {
      let updated = [...prev, real];
      if (updated.length > 5) updated = updated.slice(updated.length - 5);
      localStorage.setItem("gambleHistory", JSON.stringify(updated));
      return updated;
    });

    setCurrent(newAmount);
  }

  function continueGamble() {
    setRevealed(null);
    setResult(null);
  }

  function handleClose() {
    onClose();
  }

  return (
    <div className="gamble-overlay">
      <div className="gamble-box">

        <h2 className="gamble-title">DUBLEAZA FRATE</h2>

        <div className="gamble-win">{current} LEI</div>

        {/* CARTEA PRINCIPALA */}
        <div className="gamble-card">
          {!revealed && <div className="card-back"></div>}
          {revealed === "red" && <img src="./cards/red.png" className="card-img" />}
          {revealed === "black" && <img src="./cards/black.png" className="card-img" />}
        </div>

        {/* Botone culoare */}
        {result === null && (
          <div className="gamble-buttons">
            <button className="btn red" onClick={() => pick("red")}>Rosie</button>
            <button className="btn black" onClick={() => pick("black")}>Neagra</button>
          </div>
        )}

        {/* WIN */}
        {result === true && (
          <div className="gamble-next">
            <div className="msg win">WIN! x2</div>
            <button className="btn continue" onClick={continueGamble}>Dubleaza iar</button>
            <button className="btn collect" onClick={() => onCollect(current)}>Ia castigul</button>
          </div>
        )}

        {/* LOSE */}
        {result === false && (
          <div className="gamble-next">
            <div className="msg lose">Ai pierdut pff..</div>
            <button className="btn collect" onClick={() => onCollect(0)}>OK</button>
          </div>
        )}

        {/* ISTORIC — ultimele 5 carti */}
        <div className="card-history">
          {history.map((h, i) => (
            <img key={i} src={`./cards/${h}.png`} className="history-card" />
          ))}
        </div>

        <button className="close-btn" onClick={handleClose}>X</button>
      </div>
    </div>
  );
}
