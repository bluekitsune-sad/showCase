import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentName: user.departmentName,
      }}
    >
      {children}
    </AppShell>
  );
}
