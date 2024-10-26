import React, { createContext, useContext, useState } from "react";

interface ProgressContextType {
  progress: number;
  setProgress: (progress: number) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  return (
    <ProgressContext.Provider
      value={{ progress, setProgress, isActive, setIsActive }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
