"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
  userId: string | null;
  userName: string | null;
}

const UserContext = createContext<UserContextType>({ userId: null, userName: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextType>({ userId: null, userName: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUser({
      userId: params.get("userId"),
      userName: params.get("name"),
    });
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useAppUser() {
  return useContext(UserContext);
}
