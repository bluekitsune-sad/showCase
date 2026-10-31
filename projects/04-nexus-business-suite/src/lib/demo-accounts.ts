// Representative demo logins, one per role, matching prisma/seed.ts.
// The full set of 18 seeded users is listed in the project README.

export type DemoAccount = {
  role: "owner" | "admin" | "manager" | "staff";
  name: string;
  email: string;
  department: string | null;
};

export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "owner",
    name: "Avery Nakamura",
    email: "avery@nexus.demo",
    department: null,
  },
  {
    role: "admin",
    name: "Jordan Ellis",
    email: "jordan@nexus.demo",
    department: "Operations",
  },
  {
    role: "manager",
    name: "Marcus Webb",
    email: "marcus@nexus.demo",
    department: "Sales",
  },
  {
    role: "staff",
    name: "Diego Alvarez",
    email: "diego@nexus.demo",
    department: "Sales",
  },
];
