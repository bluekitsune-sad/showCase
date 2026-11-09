// SQLite has no enum columns, so every constrained string lives here as a
// typed union plus its display label. Validate API input against these too.

export const ROLES = ["owner", "admin", "manager", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const LEAD_SOURCES = [
  "referral",
  "website",
  "outbound",
  "event",
  "partner",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  referral: "Referral",
  website: "Website",
  outbound: "Outbound",
  event: "Event",
  partner: "Partner",
  other: "Other",
};

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const EMPLOYEE_STATUSES = ["active", "on_leave", "ended"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const LEAVE_STATUSES = ["pending", "approved", "rejected"] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export const LEAVE_TYPES = ["annual", "sick", "personal", "unpaid"] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const ATTENDANCE_STATUSES = [
  "present",
  "remote",
  "absent",
  "leave",
  "holiday",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const CUSTOMER_STATUSES = ["active", "at_risk", "churned"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: "Active",
  at_risk: "At risk",
  churned: "Churned",
};

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const APPLICANT_STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;
export type ApplicantStage = (typeof APPLICANT_STAGES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isLeadStage(value: string): value is LeadStage {
  return (LEAD_STAGES as readonly string[]).includes(value);
}

export function isLeadSource(value: string): value is LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(value);
}

export function isCustomerStatus(value: string): value is CustomerStatus {
  return (CUSTOMER_STATUSES as readonly string[]).includes(value);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}
