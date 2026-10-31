export type NavItem = {
  label: string;
  href: string;
  /** Rendered disabled until the surface ships in a later milestone. */
  planned?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    label: "CRM",
    items: [
      { label: "Leads", href: "/leads", planned: true },
      { label: "Customers", href: "/customers", planned: true },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Employees", href: "/employees", planned: true },
      { label: "Attendance", href: "/attendance", planned: true },
      { label: "Leave", href: "/leave", planned: true },
      { label: "Recruitment", href: "/recruitment", planned: true },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Projects", href: "/projects", planned: true },
      { label: "Tasks", href: "/tasks", planned: true },
    ],
  },
  {
    label: "System",
    items: [{ label: "Activity log", href: "/activity", planned: true }],
  },
];
