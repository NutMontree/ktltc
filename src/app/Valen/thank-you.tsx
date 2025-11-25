/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { lines } from "./lines";
import toast from "react-hot-toast";

export default function ThankYou({
  disableScreen,
}: {
  disableScreen: () => void;
  position: any;
  setPosition: (position: any) => void;
  getRandomPosition: () => any;
}) {
  const colors = {
    background: "#FFF0F5",
    text: "#E32636",
    heart: "#FF597D",
  };

  const message = sessionStorage.getItem("message") || lines[0];

  const disableScreenMessage = message === lines[1];
  const callGodMessage = message === lines[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full grid place-items-center p-6 lg:p-0 overflow-hidden absolute top-0 left-0"
      style={{ backgroundColor: colors.background }}
    >
      <motion.div
        className="text-center space-y-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.h1
          className="text-7xl font-bold mb-4"
          style={{ color: colors.text }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          YAAAY! 🎉
        </motion.h1>

        <motion.h1
          className="text-xl lg:text-3xl font-bold mb-4"
          style={{ color: colors.text }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {message}
        </motion.h1>

        {callGodMessage && (
          <motion.p
            className="text-lg lg:text-2xl"
            style={{ color: colors.text }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            😇
          </motion.p>
        )}

        <motion.div
          className="mt-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.7,
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
        >
          <div className="w-64 h-64 mx-auto relative">
            {/* Two hearts coming together animation */}
            <motion.svg
              viewBox="0 0 200 100"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {/* Left heart */}
              <motion.g
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 1.2,
                }}
              >
                <path
                  fill={colors.heart}
                  d="M50 80L45 75C30 60 20 50 20 37.5C20 27.5 28 20 37.5 20C43 20 48 22.5 50 26.5C52 22.5 57 20 62.5 20C72 20 80 27.5 80 37.5C80 50 70 60 55 75L50 80Z"
                />
              </motion.g>

              {/* Right heart */}
              <motion.g
                initial={{ x: 50 }}
                animate={{ x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 1.2,
                }}
              >
                <path
                  fill={colors.heart}
                  d="M150 80L145 75C130 60 120 50 120 37.5C120 27.5 128 20 137.5 20C143 20 148 22.5 150 26.5C152 22.5 157 20 162.5 20C172 20 180 27.5 180 37.5C180 50 170 60 155 75L150 80Z"
                  opacity="0.8"
                />
              </motion.g>

              <motion.circle
                cx="100"
                cy="50"
                r="3"
                fill={colors.text}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              <motion.circle
                cx="100"
                cy="40"
                r="2"
                fill={colors.text}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: 2.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              <motion.circle
                cx="100"
                cy="60"
                r="2"
                fill={colors.text}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: 2.4,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </motion.svg>
          </div>
        </motion.div>

        {disableScreenMessage && (
          <motion.button
            whileTap={{ scale: 1.1 }}
            onClick={disableScreen}
            onHoverEnd={() => {
              toast("Don't fix, it's better this way 🥹 ");
            }}
            onTouchEnd={() => {
              toast("Don't fix, it's better this way 🥹 ");
            }}
            whileHover={{ rotate: [-2, 2, -2, 2, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.1 }}
            className="bg-light-coral text-creamy-white p-5 rounded-md font-semibold text-3xl"
          >
            {"Fix my screen 🥹"}
          </motion.button>
        )}

        {callGodMessage && (
          <motion.button
            whileTap={{ scale: 1.1 }}
            onClick={disableScreen}
            onHoverEnd={() => {
              toast("Don't call God 🥹 ");
            }}
            onTouchEnd={() => {
              toast("Don't call God 🥹 ");
            }}
            whileHover={{ rotate: [-2, 2, -2, 2, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.1 }}
            className="bg-[#25D366] text-creamy-white p-5 rounded-md font-semibold text-3xl"
          >
            {"Call 📞 🥹"}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
