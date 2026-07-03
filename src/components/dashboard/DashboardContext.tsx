"use client";
import { createContext, useContext, useState } from "react";

interface DashboardContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
