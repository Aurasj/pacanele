import { useState, useEffect } from "react";
import { symbols, reelStrips } from "./symbols";
import Symbol from "./Symbol";
import Gamble from "./Gamble";
import BigWin from "./BigWin";
import { createPortal } from "react-dom";


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
  const [showGamble, setShowGamble] = useState(false);
  

  const LINES = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ];

  /* ============================================
     SPIN
  ============================================ */
  function spin() {
    if (spinning || coins <= 0) return;

    setSpinning(true);
        // Dacă jucătorul NU a dublat, adunăm câștigul la bani
      if (lastWin > 0) {
        setCoins(c => c + lastWin);
      }

      // Resetăm win-ul pentru noul spin
      setLastWin(0);

    setWildEffect({ cols: [], match: 0 });
    setWinningLines([]);
    setWinningSymbols([]);
    setCoins((c) => c - 35);

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

  /* ============================================
     EFFECT WHEN REELS STOP
  ============================================ */
  // Rulează checkWin doar după ce TOATE rolele au terminat primul spin
useEffect(() => {
  if (!spinning && stops.some(s => s !== 0)) {
    checkWin();
  }
}, [spinning]);


  /* ============================================
     GET VISIBLE SYMBOLS
  ============================================ */
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

  /* ============================================
     EXPANDING WILDS
  ============================================ */
  function applyCrownWilds(visible) {
    let wildCols = [];

    const updated = visible.map((colSymbols, col) => {
      if (colSymbols.includes("crown") && col >= 1 && col <= 3) {
        wildCols.push(col);
        return ["crown", "crown", "crown"];
      }
      return colSymbols;
    });

    return { updated, wildCols };
  }

  /* ============================================
     LINE MATCH CHECK
  ============================================ */
  function getLineMatchCount(lineSymbols) {
    const filtered = lineSymbols.map((s) => (s === "dollar" ? null : s));

    const firstNonWildIndex = filtered.findIndex(
      (s) => s && s !== "crown"
    );

    const target =
      firstNonWildIndex === -1 ? "crown" : filtered[firstNonWildIndex];

    let count = 0;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === target || filtered[i] === "crown") count++;
      else break;
    }

    return count >= 3 ? count : 0;
  }

  /* ============================================
     CHECK WIN LOGIC
  ============================================ */
  function checkWin() {
    const visible = getVisibleSymbols();
    const { updated: withWilds, wildCols } = applyCrownWilds(visible);

    let totalWin = 0;
    let maxMatch = 0;
    let linesHit = [];
    let symbolsHit = [];

    /* ---- PAYLINES ---- */
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

    setWildEffect({ cols: wildCols, match: maxMatch });

    /* ---- SCATTER LOGIC ---- */
    let dollarCount = 0;
    let scatterHits = [];

    visible.forEach((colSymbols, c) => {
      const isExpanded = wildCols.includes(c) && maxMatch >= 3;

      colSymbols.forEach((sym, r) => {
        if (isExpanded && sym === "dollar") return;

        if (sym === "dollar") {
          dollarCount++;
          scatterHits.push({ col: c, row: r });
        }
      });
    });

    if (dollarCount >= 3) {
      const scatterWin = dollarCount * 10;
      totalWin += scatterWin;

      scatterHits.forEach((hit) =>
        symbolsHit.push({ col: hit.col, row: hit.row, isDollar: true })
      );
    }

    /* ---- APPLY WINS ---- */
        setWinningLines(linesHit);
        setWinningSymbols(symbolsHit);

        setLastWin(totalWin);
        if (totalWin >= 100) {
  setTimeout(() => {
    setLastWin(0);  // 🔥 ascunde BigWin după 3 secunde
  }, 3000);
}



    
  }

  /* ============================================
     WINNING SYMBOL (DUPLICATE STRIP FIX)
  ============================================ */
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

  /* ============================================
     EXPANDED CROWN (VISUAL)
  ============================================ */
  function isExpandedCrown(col, index, stripLen) {
    if (!wildEffect.cols.includes(col) || wildEffect.match < 3)
      return false;

    const top = stops[col] % stripLen;
    const mid = (stops[col] + 1) % stripLen;
    const bot = (stops[col] + 2) % stripLen;

    return (
      index % stripLen === top ||
      index % stripLen === mid ||
      index % stripLen === bot
    );
  }

  /* ============================================
     RENDER
  ============================================ */
  return (
    <>
      {/* ================= MACHINE ================= */}
    <div className="slot-wrapper">
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

          const reelClass =
            wildEffect.cols.includes(col) && wildEffect.match >= 3
              ? `reel wild-${wildEffect.match}`
              : "reel";

          return (
            <div key={col} className={reelClass}>
              <div
                className="reel-strip"
                style={{ transform: `translateY(-${offsets[col]}px)` }}
              >
                {fullStrip.map((name, index) => {
                  const forceCrown = isExpandedCrown(col, index, len);
                  const isDollar = name === "dollar";

                  const win =
                    !forceCrown && isWinningSymbol(col, index, len)
                      ? isDollar
                        ? "win-dollar"
                        : "win-symbol"
                      : "";

                  return (
                    <Symbol
                      key={index}
                      src={forceCrown ? symbols["crown"] : symbols[name]}
                      className={win}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showGamble &&
  document.body.appendChild(
    Object.assign(
      document.createElement("div"),
      { id: "gamble-root" }
    )
  ) && null}
{showGamble && 
  createPortal(
    <Gamble 
      win={lastWin}
      onClose={() => setShowGamble(false)}
      onCollect={(amount) => {
        setCoins(c => c + amount);
        setShowGamble(false);
        setLastWin(0);
      }}
    />,
    document.getElementById("gamble-root")
  )
}


      {lastWin >= 100 && <BigWin amount={lastWin} />}

      {/* ================= PANEL ================= */}
<div className="panel-container">

  <div className="panel-box">
    <div className="coins-label">BANI</div>
    <div className="coins-value">{coins} LEI</div>

    <div className="win-label">CASTIG</div>
    <div className="win-value">{lastWin} LEI</div>
  </div>

  <div className="panel-buttons">
    <button
      disabled={spinning || coins <= 0}
      onClick={spin}
      className="spin-big"
    >
      Da o mana
    </button>

    <button
  className={`gamble-btn ${lastWin > 0 ? "active" : "disabled"}`}
  disabled={lastWin <= 0}
  onClick={() => lastWin > 0 && setShowGamble(true)}
>
  DUBLEAZA
</button>

  </div>
</div>
</div>

    </>
  );
}
