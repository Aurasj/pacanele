import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./bigwin.css";


export default function BigWin({ amount, onClose }) {

  useEffect(() => {
    const t = setTimeout(() => {
      onClose();
    }, 3000); // 3 secunde

    return () => clearTimeout(t);
  }, []);

  return createPortal(
  <div className="bigwin-overlay">
    <div className="bigwin-universe">
      <div className="cosmic-bg"></div>
      <div className="supernova"></div>

      <div className="bigwin-text cosmic-glow">
        BIG WIN! <br />
        <span className="bigwin-amount">+{amount} LEI</span>
      </div>

      <div className="stars-field">
        {Array.from({ length: 120 }).map((_, i) => (
          <div 
            key={i} 
            className="star"
            style={{
              "--rand-x": Math.random(),
              "--rand-d": Math.random()
            }}
          ></div>
        ))}
      </div>
    </div>
  </div>,
  document.body
);

}
