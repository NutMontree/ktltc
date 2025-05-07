"use client";
// components/SnakeGame.tsx
import { useEffect, useState, useCallback } from "react";

type Position = { x: number; y: number };

const boardSize = 20; // 20x20 grid
const initialSnake = [{ x: 5, y: 5 }];
const initialFood = { x: 10, y: 10 };

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position>(initialFood);
  const [direction, setDirection] = useState<string>("RIGHT");
  const [gameOver, setGameOver] = useState(false);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === "ArrowUp" && direction !== "DOWN") {
        setDirection("UP");
      } else if (e.key === "ArrowDown" && direction !== "UP") {
        setDirection("DOWN");
      } else if (e.key === "ArrowLeft" && direction !== "RIGHT") {
        setDirection("LEFT");
      } else if (e.key === "ArrowRight" && direction !== "LEFT") {
        setDirection("RIGHT");
      }
    },
    [direction, gameOver]
  );

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      newSnake.unshift(head);

      // Check if the snake eats food
      if (head.x === food.x && head.y === food.y) {
        const newFood = {
          x: Math.floor(Math.random() * boardSize),
          y: Math.floor(Math.random() * boardSize),
        };
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      // Check if snake hits walls or itself
      if (
        head.x < 0 ||
        head.x >= boardSize ||
        head.y < 0 ||
        head.y >= boardSize ||
        newSnake
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
      } else {
        setSnake(newSnake);
      }
    };

    const interval = setInterval(moveSnake, 100);
    return () => clearInterval(interval);
  }, [snake, direction, food, gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const restartGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection("RIGHT");
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center  ">
      <div className="relative bg-gray-800 w-[401px] h-[401px] border border-gray-700">
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500"
            style={{
              top: `${segment.y * 20}px`,
              left: `${segment.x * 20}px`,
              width: "20px",
              height: "20px",
            }}
          ></div>
        ))}
        <div
          className="absolute bg-red-500"
          style={{
            top: `${food.y * 20}px`,
            left: `${food.x * 20}px`,
            width: "20px",
            height: "20px",
          }}
        ></div>
      </div>

      {gameOver && (
        <div className="mt-4 text-white">
          <div>Game Over</div>
          <button
            onClick={restartGame}
            className="px-4 py-2 mt-2 bg-blue-500 text-white rounded"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
