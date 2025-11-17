import { useState } from "react";
import { symbols, reelStrips } from "./symbols";
import Symbol from "./Symbol";

export default function SlotMachine() {
  const reelsCount = 5;
  const symbolSize = 150;

  // setăm pentru fiecare coloană un offset Y (în px)
  const [offsets, setOffsets] = useState(Array(reelsCount).fill(0));
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(9999);

  function spin() {
    if (spinning) return;

    setSpinning(true);
    setCoins(c => c - 1);

    // pentru fiecare coloană creăm animarea
    reelStrips.forEach((strip, col) => {
      const speed = 50 + col * 20; // viteze diferite ca la EGT
      let y = 0;

      const interval = setInterval(() => {
        y = (y + speed) % (strip.length * symbolSize);
        setOffsets(prev => {
          const updated = [...prev];
          updated[col] = y;
          return updated;
        });
      }, 30);

      // stopare individuală
      setTimeout(() => {
        clearInterval(interval);

        // alegem un index fix real
        const stopIndex = Math.floor(Math.random() * strip.length);

        const finalY = stopIndex * symbolSize;

        setOffsets(prev => {
          const updated = [...prev];
          updated[col] = finalY;
          return updated;
        });

        if (col === reelsCount - 1) {
          setSpinning(false);
        }
      }, 800 + col * 300);
    });
  }

  return (
    <>
      <div className="machine">
        {reelStrips.map((strip, col) => (
          <div className="reel" key={col}>
            <div
              className="reel-strip"
              style={{
                transform: `translateY(-${offsets[col]}px)`
              }}
            >
              {strip.map((name, i) => (
                <Symbol key={i} src={symbols[name]} />
              ))}
              {/* duplicăm stripul pentru looping perfect */}
              {strip.map((name, i) => (
                <Symbol key={`dup-${i}`} src={symbols[name]} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="coins">COINS: {coins}</div>
        <button disabled={spinning} onClick={spin} className="spin-btn">
          {spinning ? "..." : "SPIN"}
        </button>
      </div>
    </>
  );
}
