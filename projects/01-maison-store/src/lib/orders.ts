const FLOW = [
  "processing",
  "packed",
  "shipped",
  "in_transit",
  "delivered",
] as const;

const DAY = 24 * 60 * 60 * 1000;

const OFFSETS: Record<string, number> = {
  processing: 0,
  packed: 1,
  shipped: 2,
  in_transit: 4,
  delivered: 6,
  cancelled: 1,
};

const DESCRIPTIONS: Record<string, string> = {
  processing: "Order received and payment confirmed.",
  packed: "Your pieces are being wrapped at the atelier.",
  shipped: "Handed to the carrier with a tracking reference.",
  in_transit: "On its way to the delivery address.",
  delivered: "Delivered and signed for.",
  cancelled: "This order was cancelled and nothing was charged.",
};

export type TimelineState = "complete" | "current" | "upcoming";

export type TimelineStep = {
  status: string;
  label: string;
  description: string;
  at: Date;
  state: TimelineState;
};

export function statusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/^\w/, (character) => character.toUpperCase());
}

function flowIndex(status: string): number {
  const index = FLOW.indexOf(status as (typeof FLOW)[number]);
  return index === -1 ? 0 : index;
}

export function orderTimeline(order: {
  status: string;
  placedAt: Date;
}): TimelineStep[] {
  const now = Date.now();
  const placed = order.placedAt.getTime();

  if (order.status === "cancelled") {
    return [
      {
        status: "processing",
        label: statusLabel("processing"),
        description: DESCRIPTIONS.processing,
        at: order.placedAt,
        state: "complete",
      },
      {
        status: "cancelled",
        label: statusLabel("cancelled"),
        description: DESCRIPTIONS.cancelled,
        at: new Date(Math.min(now, placed + DAY)),
        state: "current",
      },
    ];
  }

  const currentIndex = flowIndex(order.status);

  return FLOW.map((status, index) => {
    let at: Date;
    if (index <= currentIndex) {
      at = new Date(Math.min(placed + OFFSETS[status] * DAY, now));
    } else {
      const currentStatus = FLOW[currentIndex];
      const base = Math.max(now, placed + OFFSETS[currentStatus] * DAY);
      at = new Date(base + (OFFSETS[status] - OFFSETS[currentStatus]) * DAY);
    }

    return {
      status,
      label: statusLabel(status),
      description: DESCRIPTIONS[status],
      at,
      state:
        index < currentIndex
          ? "complete"
          : index === currentIndex
            ? "current"
            : "upcoming",
    };
  });
}
