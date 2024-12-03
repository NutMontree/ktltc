"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import axios from "axios";
import { createContext, useState, useEffect } from "react";

axios.defaults.baseURL = "http://localhost:8000";
// axios.defaults.baseURL = "https://server-ktltc.vercel.app/";
axios.defaults.withCredentials = true;

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export const UserContext = createContext({});

export function UserContextProvider({ children, themeProps }: ProvidersProps) {
  const [user, setUser] = useState(null);
  //   const router = useRouter();
  useEffect(() => {
    if (!user) {
      axios.get("/profile").then(({ data }) => {
        setUser(data);
      });
    }
  }, []);
  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </UserContext.Provider>
    </>
  );
}
