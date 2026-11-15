"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Role } from "@/lib/domain";

export type ShellUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  departmentName: string | null;
};

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[var(--sidebar-width)]">
        <Topbar
          onMenu={() => setSidebarOpen(true)}
          menuOpen={sidebarOpen}
          user={user}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 py-6 outline-none lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
