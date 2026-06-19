"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const useColorMode = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colorMode = mounted ? (theme === "dark" ? "dark" : "light") : "light";
  
  const setColorMode = (newMode: string) => {
    setTheme(newMode);
  };

  return [colorMode, setColorMode] as const;
};

export default useColorMode;
