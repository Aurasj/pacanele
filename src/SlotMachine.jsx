import { useState } from "react";
import { symbols, reelStrips } from "./symbols";
import Symbol from "./Symbol";

export default function SlotMachine() {
  const reelsCount = 5;
  const symbolSize = 150;

  const [offsets, setOffsets] = useState(Array(reelsCount).fill(0));
  const [stops, setStops] = useState(Array(reelsCount).fill(0)); // indexul real de stop pe fiecare rolă
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(500);
  const [lastWin, setLastWin] = useState(0);
  const [wildCols, setWildCols] = useState([]); // coloanele cu coroane (wild)

  // cele 5 linii ca la Shining Crown (0 = sus, 1 = mijloc, 2 = jos)
  const LINES = [
    [1, 1, 1, 1, 1], // linia 1 - mijloc
    [0, 0, 0, 0, 0], // linia 2 - sus
    [2, 2, 2, 2, 2], // linia 3 - jos
    [0, 1, 2, 1, 0], // linia 4 zig-zag
    [2, 1, 0, 1, 2]  // linia 5 zig-zag invers
  ];

  function spin() {
    if (spinning || coins <= 0) return;

    setSpinning(true);
    setLastWin(0);
    setWildCols([]);
    setCoins(c => c - 1);

    reelStrips.forEach((strip, col) => {
      const speed = 50 + col * 20;
      let y = 0;

      const interval = setInterval(() => {
        y = (y + speed) % (strip.length * symbolSize);
        setOffsets(prev => {
          const updated = [...prev];
          updated[col] = y;
          return updated;
        });
      }, 30);

      setTimeout(() => {
        clearInterval(interval);

        const stopIndex = Math.floor(Math.random() * strip.length);
        const finalY = stopIndex * symbolSize;

        setOffsets(prev => {
          const updated = [...prev];
          updated[col] = finalY;
          return updated;
        });

        setStops(prev => {
          const updated = [...prev];
          updated[col] = stopIndex;
          return updated;
        });

        if (col === reelsCount - 1) {
          setSpinning(false);
          setTimeout(checkWin, 100);
        }
      }, 800 + col * 300);
    });
  }

  // simbolurile VIZIBILE (sus / mijloc / jos) pentru fiecare rolă,
  // calculate direct din stopIndex, nu din offset -> fără decalaje
  function getVisibleSymbols() {
    return stops.map((stopIndex, col) => {
      const strip = reelStrips[col];
      const len = strip.length;

      const top = (stopIndex - 1 + len) % len;
      const mid = stopIndex;
      const bot = (stopIndex + 1) % len;

      return [strip[top], strip[mid], strip[bot]];
    });
  }

  // aplicăm comportamentul de WILD pentru coloanele cu coroane
  // (logic, + glow vizual pe coloană)
  function applyCrownWilds(visible) {
    const wildIndexes = [];
    const updated = visible.map((colSymbols, col) => {
      if (colSymbols.includes("crown")) {
        wildIndexes.push(col);
        // logic: toată coloana devine crown (wild)
        return ["crown", "crown", "crown"];
      }
      return colSymbols;
    });

    setWildCols(wildIndexes);
    return updated;
  }

  // calculăm câte simboluri consecutive de la stânga sunt "aceleași",
  // cu crown ca WILD (substituie orice)
  function getLineMatchCount(lineSymbols) {
    const firstNonWildIndex = lineSymbols.findIndex(s => s !== "crown");
    const target = firstNonWildIndex === -1
      ? "crown"
      : lineSymbols[firstNonWildIndex];

    let count = 0;
    for (let i = 0; i < lineSymbols.length; i++) {
      const s = lineSymbols[i];
      if (s === target || s === "crown") {
        count++;
      } else {
        break;
      }
    }

    return count >= 3 ? count : 0;
  }

  function checkWin() {
    const visible = getVisibleSymbols();          // ce vezi TU
    const withWilds = applyCrownWilds(visible);   // după efectul de WILD

    let totalWin = 0;

    LINES.forEach(line => {
      const lineSymbols = line.map((row, col) => withWilds[col][row]);
      const count = getLineMatchCount(lineSymbols);
      if (count) {
        totalWin += count * 5; // payout simplu: 5 * număr simboluri
      }
    });

    setLastWin(totalWin);
    if (totalWin > 0) {
      setCoins(c => c + totalWin);
    }
  }

  return (
    <>
      <div className="machine">
        {reelStrips.map((strip, col) => (
          <div
            className={`reel ${wildCols.includes(col) ? "wild" : ""}`}
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
