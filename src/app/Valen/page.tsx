"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ThankYou from "./thank-you";
import { getRandomLine } from "./lines";

export default function Valen() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [displayYesScreen, setDisplayYesScreen] = useState(false);
  const buttonSize = { width: 200, height: 100 };
  const [screenDisabled, setScreenDisabled] = useState(false);

  const disableScreen = () => {
    setScreenDisabled(false);
  };

  useEffect(() => {
    const updateBounds = () => {
      setBounds({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  const getRandomPosition = () => {
    const maxX = bounds.width - buttonSize.width - 40;
    const maxY = bounds.height - buttonSize.height - 40;
    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY - maxY / 2;
    return { x, y };
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!displayYesScreen ? (
          <motion.div
            key="question"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid h-full w-full place-items-center"
          >
            <div className="space-y-10 lg:space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-deep-red text-center text-3xl font-semibold lg:text-5xl"
              >
                Will you be my valentine?
              </motion.h1>

              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 1.1 }}
                  onClick={() => {
                    sessionStorage.setItem("message", getRandomLine());
                    setDisplayYesScreen(true);
                  }}
                  className="bg-light-coral text-creamy-white rounded-md p-5 text-3xl font-semibold"
                >
                  YES
                </motion.button>

                <motion.button
                  onHoverStart={() => setPosition(getRandomPosition())}
                  onTouchStart={() => setPosition(getRandomPosition())}
                  animate={position}
                  transition={{ type: "spring", stiffness: 100, damping: 10 }}
                  className="text-creamy-white rounded-md bg-red-600 p-5 text-3xl font-semibold"
                >
                  NO
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="thankyou"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute inset-0"
          >
            <ThankYou
              position={position}
              setPosition={setPosition}
              getRandomPosition={getRandomPosition}
              disableScreen={disableScreen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {screenDisabled && (
        <button
          disabled={screenDisabled}
          className={`absolute inset-0 h-full w-full cursor-wait`}
        ></button>
      )}
    </div>
  );
}
