import {
  APPLICANT_STAGE_LABELS,
  ATTENDANCE_STATUS_LABELS,
  EMPLOYEE_STATUS_LABELS,
  JOB_OPENING_STATUS_LABELS,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  isApplicantStage,
  isAttendanceStatus,
  isEmployeeStatus,
  isJobOpeningStatus,
  isLeaveStatus,
  isLeaveType,
} from "@/lib/domain";

const EMPLOYEE_TONE: Record<string, string> = {
  active: "bg-success-soft text-success",
  on_leave: "bg-warning-soft text-warning",
  ended: "bg-surface-sunken text-ink-muted",
};

const LEAVE_TONE: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
};

const ATTENDANCE_TONE: Record<string, string> = {
  present: "bg-success-soft text-success",
  remote: "bg-info-soft text-info",
  absent: "bg-danger-soft text-danger",
  leave: "bg-warning-soft text-warning",
  holiday: "bg-surface-sunken text-ink-muted",
};

const APPLICANT_TONE: Record<string, string> = {
  applied: "bg-surface-sunken text-ink-muted",
  screening: "bg-info-soft text-info",
  interview: "bg-accent-soft text-accent-ink",
  offer: "bg-warning-soft text-warning",
  hired: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
};

const OPENING_TONE: Record<string, string> = {
  open: "bg-success-soft text-success",
  on_hold: "bg-warning-soft text-warning",
  closed: "bg-surface-sunken text-ink-muted",
};

export function EmployeeStatusBadge({ status }: { status: string }) {
  if (!isEmployeeStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${EMPLOYEE_TONE[status]}`}>
      {EMPLOYEE_STATUS_LABELS[status]}
    </span>
  );
}

export function LeaveStatusBadge({ status }: { status: string }) {
  if (!isLeaveStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${LEAVE_TONE[status]}`}>
      {LEAVE_STATUS_LABELS[status]}
    </span>
  );
}

export function AttendanceStatusBadge({ status }: { status: string }) {
  if (!isAttendanceStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${ATTENDANCE_TONE[status]}`}>
      {ATTENDANCE_STATUS_LABELS[status]}
    </span>
  );
}

export function ApplicantStageBadge({ stage }: { stage: string }) {
  if (!isApplicantStage(stage)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{stage}</span>;
  }
  return (
    <span className={`pill ${APPLICANT_TONE[stage]}`}>
      {APPLICANT_STAGE_LABELS[stage]}
    </span>
  );
}

export function JobOpeningStatusBadge({ status }: { status: string }) {
  if (!isJobOpeningStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${OPENING_TONE[status]}`}>
      {JOB_OPENING_STATUS_LABELS[status]}
    </span>
  );
}

export function LeaveTypeLabel({ type }: { type: string }) {
  if (!isLeaveType(type)) return <span>{type}</span>;
  return <span>{LEAVE_TYPE_LABELS[type]}</span>;
}
