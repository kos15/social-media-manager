"use client";

import { createContext, useContext } from "react";

type SidebarCtx = {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SidebarContext = createContext<SidebarCtx>({
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
