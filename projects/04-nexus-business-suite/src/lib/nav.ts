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
      { label: "Leads", href: "/leads" },
      { label: "Pipeline", href: "/pipeline" },
      { label: "Customers", href: "/customers" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Employees", href: "/employees" },
      { label: "Attendance", href: "/attendance" },
      { label: "Leave", href: "/leave" },
      { label: "Recruitment", href: "/recruitment" },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Tasks", href: "/tasks" },
      { label: "Notifications", href: "/notifications" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Activity log", href: "/activity", planned: true }],
  },
];
