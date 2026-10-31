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
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[var(--sidebar-width)]">
        <Topbar onMenu={() => setSidebarOpen(true)} user={user} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
