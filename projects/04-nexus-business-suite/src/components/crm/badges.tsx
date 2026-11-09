import {
  CUSTOMER_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STAGE_LABELS,
  isCustomerStatus,
  isLeadSource,
  isLeadStage,
} from "@/lib/domain";

const STAGE_TONE: Record<string, string> = {
  new: "bg-surface-sunken text-ink-muted",
  contacted: "bg-info-soft text-info",
  qualified: "bg-accent-soft text-accent-ink",
  proposal: "bg-warning-soft text-warning",
  negotiation: "bg-warning-soft text-warning",
  won: "bg-success-soft text-success",
  lost: "bg-danger-soft text-danger",
};

const CUSTOMER_TONE: Record<string, string> = {
  active: "bg-success-soft text-success",
  at_risk: "bg-warning-soft text-warning",
  churned: "bg-danger-soft text-danger",
};

export function LeadStageBadge({ stage }: { stage: string }) {
  if (!isLeadStage(stage)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{stage}</span>;
  }
  return <span className={`pill ${STAGE_TONE[stage]}`}>{LEAD_STAGE_LABELS[stage]}</span>;
}

export function CustomerStatusBadge({ status }: { status: string }) {
  if (!isCustomerStatus(status)) {
    return <span className="pill bg-surface-sunken text-ink-muted">{status}</span>;
  }
  return (
    <span className={`pill ${CUSTOMER_TONE[status]}`}>
      {CUSTOMER_STATUS_LABELS[status]}
    </span>
  );
}

export function SourceLabel({ source }: { source: string }) {
  if (!isLeadSource(source)) return <span>{source}</span>;
  return <span>{LEAD_SOURCE_LABELS[source]}</span>;
}
