import {
  PROJECT_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  isProjectStatus,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/domain";

const PROJECT_TONE: Record<string, string> = {
  planning: "bg-surface-sunken text-ink-muted",
  active: "bg-success-soft text-success",
  on_hold: "bg-warning-soft text-warning",
  completed: "bg-info-soft text-info",
  archived: "bg-surface-sunken text-ink-subtle",
};

const TASK_TONE: Record<string, string> = {
  todo: "bg-surface-sunken text-ink-muted",
  in_progress: "bg-info-soft text-info",
  blocked: "bg-danger-soft text-danger",
  done: "bg-success-soft text-success",
};

const PRIORITY_TONE: Record<string, string> = {
  low: "bg-surface-sunken text-ink-muted",
  medium: "bg-info-soft text-info",
  high: "bg-warning-soft text-warning",
  urgent: "bg-danger-soft text-danger",
};

export function ProjectStatusBadge({ status }: { status: string }) {
  if (!isProjectStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${PROJECT_TONE[status]}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  if (!isTaskStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${TASK_TONE[status]}`}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: { priority: string }) {
  if (!isTaskPriority(priority)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{priority}</span>;
  }
  return (
    <span className={`pill ${PRIORITY_TONE[priority]}`}>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
