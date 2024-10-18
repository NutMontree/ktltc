"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import axios from "axios";
import { createContext, useState, useEffect } from "react";

axios.defaults.baseURL =
  "https://server-ktltc.vercel.app/?vercelToolbarCode=UzzbiJG7QxK-3Zf";
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
        {/* <NextUIProvider navigate={router.push}> */}
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        {/* </NextUIProvider> */}
      </UserContext.Provider>
    </>
  );
}
