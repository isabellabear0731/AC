"use client";

import {
  createContext,
  useContext,
} from "react";

type PortalContextType = {
  role: string;

  selectedStudentId:
    string | null;

  children: {
    id: string;

    studentUser: {
      firstName: string;
      lastName: string;
    };
  }[];
};

const PortalContext =
  createContext<PortalContextType | null>(
    null
  );

export function PortalProvider({
  value,
  children,
}: {
  value: PortalContextType;

  children: React.ReactNode;
}) {
  return (
    <PortalContext.Provider
      value={value}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context =
    useContext(PortalContext);

  if (!context) {
    throw new Error(
      "PortalProvider missing."
    );
  }

  return context;
}