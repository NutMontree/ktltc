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
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <AnimatePresence mode="wait">
        {!displayYesScreen ? (
          <motion.div
            key="question"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className=" w-full h-full grid place-items-center"
          >
            <div className="space-y-10 lg:space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-5xl text-deep-red font-semibold text-center"
              >
                Will you be my valentine?
              </motion.h1>

              <div className="flex items-center space-x-4 justify-center">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 1.1 }}
                  onClick={() => {
                    sessionStorage.setItem("message", getRandomLine());
                    setDisplayYesScreen(true);
                  }}
                  className="bg-light-coral text-creamy-white p-5 rounded-md font-semibold text-3xl"
                >
                  YES
                </motion.button>

                <motion.button
                  onHoverStart={() => setPosition(getRandomPosition())}
                  onTouchStart={() => setPosition(getRandomPosition())}
                  animate={position}
                  transition={{ type: "spring", stiffness: 100, damping: 10 }}
                  className="bg-red-600 text-creamy-white p-5 rounded-md font-semibold text-3xl"
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
          className={`absolute inset-0 cursor-wait w-full h-full`}
        ></button>
      )}
    </div>
  );
}
