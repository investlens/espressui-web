"use client";

import { useEffect, useRef, useState } from "react";
import { Coffee, RotateCcw, Trophy, Zap } from "lucide-react";

type GameState = "ready" | "countdown" | "playing" | "result";

function calculateResult(position: number) {
  const distance = Math.abs(position - 50);

  const score = Math.max(
    100,
    Math.round(1000 - distance * 20)
  );

  if (distance <= 2.5) {
    return {
      score,
      rank: "PERFECT BREW",
      message: "Coffeyville approves. ☕🔥",
    };
  }

  if (distance <= 7.5) {
    return {
      score,
      rank: "EXCELLENT",
      message: "That was dangerously smooth.",
    };
  }

  if (distance <= 17.5) {
    return {
      score,
      rank: "GOOD BREW",
      message: "Solid cup. Try for the perfect zone.",
    };
  }

  if (position < 50) {
    return {
      score,
      rank: "TOO WEAK",
      message: "Needs another shot.",
    };
  }

  return {
    score,
    rank: "BURNT",
    message: "Coffeyville smells smoke. 😎",
  };
}

export default function BrewBattleGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [bestScore, setBestScore] = useState(0);
  const [result, setResult] = useState({
    score: 0,
    rank: "",
    message: "",
  });

  const positionRef = useRef(0);
  const directionRef = useRef(1);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = window.setInterval(() => {
      let next =
        positionRef.current + directionRef.current * 1.25;

      if (next >= 100) {
        next = 100;
        directionRef.current = -1;
        setDirection(-1);
      }

      if (next <= 0) {
        next = 0;
        directionRef.current = 1;
        setDirection(1);
      }

      positionRef.current = next;
      setPosition(next);
    }, 16);

    return () => window.clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdown === 0) {
      positionRef.current = 0;
      directionRef.current = 1;
      setPosition(0);
      setDirection(1);
      setGameState("playing");
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [countdown, gameState]);

  function startGame() {
    setCountdown(3);
    setResult({
      score: 0,
      rank: "",
      message: "",
    });
    setGameState("countdown");
  }

  function stopBrew() {
    if (gameState !== "playing") return;

    const finalResult = calculateResult(positionRef.current);

    setResult(finalResult);

    setBestScore((previous) =>
      Math.max(previous, finalResult.score)
    );

    setGameState("result");
  }

  const perfect =
    position >= 42.5 && position <= 57.5;

  return (
    <div className="brew-game">
      <div className="brew-game-header">
        <div>
          <span className="game-label">
            PRACTICE BREW
          </span>

          <h2>Perfect the pour.</h2>

          <p>
            Stop the pressure marker as close to the
            center of the Perfect Brew zone as possible.
          </p>
        </div>

        <div className="best-score">
          <Trophy size={17} />
          <div>
            <small>BEST</small>
            <strong>{bestScore}</strong>
          </div>
        </div>
      </div>

      <div className="brew-machine">
        <div className="machine-top">
          <span>BREW PRESSURE</span>

          <span className={perfect ? "perfect-live" : ""}>
            {gameState === "playing"
              ? perfect
                ? "PERFECT!"
                : direction > 0
                  ? "PRESSURE ↑"
                  : "PRESSURE ↓"
              : "READY"}
          </span>
        </div>

        <div className="brew-track">
          <div className="zone weak-zone" />
          <div className="zone good-zone-left" />
          <div className="zone perfect-brew-zone">
            <span>PERFECT</span>
          </div>
          <div className="zone good-zone-right" />
          <div className="zone burnt-zone" />

          <div
            className="brew-needle"
            style={{ left: `${position}%` }}
          >
            <div className="needle-head" />
          </div>
        </div>

        <div className="brew-scale">
          <span>WEAK</span>
          <span>GOOD</span>
          <strong>PERFECT BREW</strong>
          <span>GOOD</span>
          <span>BURNT</span>
        </div>

        <div className="game-stage">
          {gameState === "ready" && (
            <>
              <Coffee size={42} />
              <h3>Ready to brew?</h3>
              <p>
                Timing is everything. Aim for the exact
                center.
              </p>

              <button
                className="brew-button"
                onClick={startGame}
              >
                <Zap size={18} />
                START BREW
              </button>
            </>
          )}

          {gameState === "countdown" && (
            <div className="countdown">
              <span>{countdown || "BREW!"}</span>
            </div>
          )}

          {gameState === "playing" && (
            <>
              <span className="game-live">
                <span className="live-dot" />
                BREWING
              </span>

              <button
                className="brew-button stop-button"
                onClick={stopBrew}
              >
                ☕ STOP THE BREW
              </button>

              <small className="tap-hint">
                Tap when the marker reaches the center
              </small>
            </>
          )}

          {gameState === "result" && (
            <div className="brew-result">
              <span className="result-label">
                {result.rank}
              </span>

              <strong>{result.score}</strong>

              <small>BREW SCORE</small>

              <p>{result.message}</p>

              <button
                className="replay-button"
                onClick={startGame}
              >
                <RotateCcw size={16} />
                BREW AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="practice-warning">
        PRACTICE MODE · Scores are currently stored only
        for this session and are not eligible for rewards.
      </div>
    </div>
  );
}