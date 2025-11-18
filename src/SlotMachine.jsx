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

  const [wildEffect, setWildEffect] = useState({ cols: [], match: 0 });
  const [winningLines, setWinningLines] = useState([]);
  const [winningSymbols, setWinningSymbols] = useState([]);

  const LINES = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ];

  // ----------------------------------------------
  // SPIN
  // ----------------------------------------------
  function spin() {
    if (spinning || coins <= 0) return;

    setSpinning(true);
    setLastWin(0);
    setWildEffect({ cols: [], match: 0 });
    setWinningLines([]);
    setWinningSymbols([]);
    setCoins((c) => c - 1);

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

  // ----------------------------------------------
  // After reels stop
  // ----------------------------------------------
  useEffect(() => {
    if (!spinning) checkWin();
  }, [spinning]);

  // ----------------------------------------------
  // Visible symbols
  // ----------------------------------------------
  function getVisibleSymbols() {
    return stops.map((stopIndex, col) => {
      const strip = reelStrips[col];
      const len = strip.length;

      return [
        strip[stopIndex % len],
        strip[(stopIndex + 1) % len],
        strip[(stopIndex + 2) % len],
      ];
    });
  }

  // ----------------------------------------------
  // Expanding crowns
  // ----------------------------------------------
  function applyCrownWilds(visible) {
    let wildCols = [];

    const updated = visible.map((colSymbols, col) => {
      if (colSymbols.includes("crown") && col >= 1 && col <= 3) {
        wildCols.push(col);
        return ["crown", "crown", "crown"];
      }
      return colSymbols;
    });

    setWildEffect((prev) => ({ ...prev, cols: wildCols }));
    return updated;
  }

  // ----------------------------------------------
  // Line check
  // ----------------------------------------------
  function getLineMatchCount(lineSymbols) {
    const firstNonWildIndex = lineSymbols.findIndex((s) => s !== "crown");
    const target =
      firstNonWildIndex === -1 ? "crown" : lineSymbols[firstNonWildIndex];

    let count = 0;
    for (let i = 0; i < lineSymbols.length; i++) {
      if (lineSymbols[i] === target || lineSymbols[i] === "crown") count++;
      else break;
    }

    return count >= 3 ? count : 0;
  }

  // ----------------------------------------------
  // WIN LOGIC
  // ----------------------------------------------
  function checkWin() {
    const visible = getVisibleSymbols();
    const withWilds = applyCrownWilds(visible);

    let totalWin = 0;
    let maxMatch = 0;
    let linesHit = [];
    let symbolsHit = [];

    LINES.forEach((line, idx) => {
      const lineSymbols = line.map((row, col) => withWilds[col][row]);
      const count = getLineMatchCount(lineSymbols);

      if (count > 0) {
        totalWin += count * 5;
        maxMatch = Math.max(maxMatch, count);
        linesHit.push({ lineIndex: idx, match: count });

        for (let col = 0; col < count; col++) {
          symbolsHit.push({ col, row: line[col] });
        }
      }
    });

    setWildEffect((prev) => ({ ...prev, match: maxMatch }));
    setWinningLines(linesHit);
    setWinningSymbols(symbolsHit);

    if (totalWin > 0) setCoins((c) => c + totalWin);
    setLastWin(totalWin);
  }

  // ----------------------------------------------
  // FIX PULSE BUG — CHECK SYMBOL IN DUPLICATED STRIP
  // ----------------------------------------------
  const isWinningSymbol = (col, globalIndex, stripLen) => {
    return winningSymbols.some((s) => {
      if (s.col !== col) return false;

      const winningIndex = (stops[col] + s.row) % stripLen;

      return (
        globalIndex === winningIndex ||
        globalIndex === winningIndex + stripLen
      );
    });
  };

  // ----------------------------------------------
  // RENDER
  // ----------------------------------------------
  return (
    <>
      <div className="machine">

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

        {reelStrips.map((strip, col) => {
          const len = strip.length;
          const fullStrip = [...strip, ...strip];

          return (
            <div
              key={col}
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
            >
              <div
                className="reel-strip"
                style={{ transform: `translateY(-${offsets[col]}px)` }}
              >
                {fullStrip.map((name, index) => {
                  const win =
                    isWinningSymbol(col, index, len) ? "win-symbol" : "";

                  return (
                    <Symbol
                      key={index}
                      src={symbols[name]}
                      className={win}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <div className="coins">{coins} LEI</div>
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
