import { useState, useEffect } from "react";
import { symbols, reelStrips } from "./symbols";
import Symbol from "./Symbol";

export default function SlotMachine() {
  const reelsCount = 5;
  const symbolSize = 150;

  const [offsets, setOffsets] = useState(Array(reelsCount).fill(0));
  const [stops, setStops] = useState(Array(reelsCount).fill(0));
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(500);
  const [lastWin, setLastWin] = useState(0);

  // 🔥 aici salvăm: coloanele care au legat + cate simboluri a legat (3/4/5)
  const [wildEffect, setWildEffect] = useState({ cols: [], match: 0 });
  const [winningLines, setWinningLines] = useState([]);


  const LINES = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ];

  function spin() {
    if (spinning || coins <= 0) return;

    setSpinning(true);
    setLastWin(0);
    setWildEffect({ cols: [], match: 0 });
    setCoins((c) => c - 1);
    setWinningLines([]); // 🔥 sterge liniile când apeși spin


    reelStrips.forEach((strip, col) => {
      setOffsets((prev) => {
        const updated = [...prev];
        updated[col] = 3000 + col * 200;
        return updated;
      });

      const stopIndex = Math.floor(Math.random() * strip.length);

      setStops((prev) => {
        const updated = [...prev];
        updated[col] = stopIndex;
        return updated;
      });

      setTimeout(() => {
        setOffsets((prev) => {
          const updated = [...prev];
          updated[col] = stopIndex * symbolSize;
          return updated;
        });

        if (col === reelsCount - 1) {
          setTimeout(() => setSpinning(false), 500);
        }
      }, 600 + col * 250);
    });
  }

  useEffect(() => {
    if (!spinning) {
      checkWin();
    }
  }, [spinning]);

  function getVisibleSymbols() {
    return stops.map((stopIndex, col) => {
      const strip = reelStrips[col];
      const len = strip.length;

      const top = stopIndex % len;
      const mid = (stopIndex + 1) % len;
      const bot = (stopIndex + 2) % len;

      return [strip[top], strip[mid], strip[bot]];
    });
  }

  function applyCrownWilds(visible) {
    return visible.map((colSymbols, col) => {
      if (colSymbols.includes("crown") && col >= 1 && col <= 3) {
        return ["crown", "crown", "crown"];
      }
      return colSymbols;
    });
  }

  function getLineMatchCount(lineSymbols) {
    const firstNonWildIndex = lineSymbols.findIndex((s) => s !== "crown");
    const target =
      firstNonWildIndex === -1 ? "crown" : lineSymbols[firstNonWildIndex];

    let count = 0;
    for (let i = 0; i < lineSymbols.length; i++) {
      const s = lineSymbols[i];
      if (s === target || s === "crown") count++;
      else break;
    }

    return count >= 3 ? count : 0;
  }

  function checkWin() {
  const visible = getVisibleSymbols();
  const withWilds = applyCrownWilds(visible);

  let totalWin = 0;
  let winningCols = new Set();
  let maxMatch = 0;
  let linesHit = []; // 🔥 aici salvăm liniile câștigătoare

  LINES.forEach((line, index) => {
    const lineSymbols = line.map((row, col) => withWilds[col][row]);
    const count = getLineMatchCount(lineSymbols);

    if (count) {
      totalWin += count * 5;
      maxMatch = Math.max(maxMatch, count);
      linesHit.push({ lineIndex: index, match: count });

      for (let i = 0; i < count; i++) {
        winningCols.add(i);
      }
    }
  });

  const crownWinningCols = Array.from(winningCols).filter((col) =>
    visible[col].includes("crown")
  );

  setWildEffect({
    cols: crownWinningCols,
    match: maxMatch,
  });

  setWinningLines(linesHit); // 🔥 salvăm liniile câștigătoare

  setLastWin(totalWin);
  if (totalWin > 0) setCoins((c) => c + totalWin);
}



  return (
  <>
    <div className="machine" style={{ position: "relative" }}>
      
      {/* 🔥 SVG PESTE simboluri */}
      <svg className="win-lines">
        {winningLines.map((obj, i) => {
          const line = LINES[obj.lineIndex];

          return (
            <polyline
              key={i}
              points={line
                .map((row, col) => `${col * 166 + 75},${row * 150 + 75}`)
                .join(" ")}
              className="line-anim"
            />
          );
        })}
      </svg>

      {/* 🔥 Simbolurile */}
      {reelStrips.map((strip, col) => (
        <div
          className={
            "reel " +
            (wildEffect.cols.includes(col)
              ? wildEffect.match === 3
                ? "wild-3"
                : wildEffect.match === 4
                ? "wild-4"
                : "wild-5"
              : "")
          }
          key={col}
        >
          <div
            className="reel-strip"
            style={{ transform: `translateY(-${offsets[col]}px)` }}
          >
            {strip.map((name, i) => (
              <Symbol key={i} src={symbols[name]} />
            ))}

            {strip.map((name, i) => (
              <Symbol key={`dup-${i}`} src={symbols[name]} />
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* PANEL */}
    <div className="panel">
      <div className="coins">COINS: {coins}</div>
      <div className={`win ${lastWin > 0 ? "win--visible" : ""}`}>
        WIN: {lastWin}
      </div>
      <button
        disabled={spinning || coins <= 0}
        onClick={spin}
        className="spin-btn"
      >
        {spinning ? "..." : coins <= 0 ? "NO COINS" : "SPIN"}
      </button>
    </div>
  </>
);

}
