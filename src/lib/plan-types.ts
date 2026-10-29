export type QueueStatus = {
  status: string;
  /** The service this estimate is for; null when fully unknown. */
  service_id: string | null;
  wait_minutes: { min: number; max: number } | null;
  observed_at: string | null;
  confidence: number | null;
  reason: string;
  data_window: {
    from: string;
    to: string;
    observations: number;
  } | null;
};

export type PlanResult = {
  request_summary: string;
  services: Array<{
    service_id: string;
    status: string;
    eligibility: string[];
    checklist: Array<{ item_id: string; label: string; status: string; source_ids: string[] }>;
    steps: string[];
    fees: Array<{ amount: number; currency: string; option: string; source_ids: string[] }>;
    fee_note: string;
  }>;
  stops: Array<{ order: number; service_id: string; visit_mode: string; location_name: string | null; reason: string }>;
  order_basis: string;
  queue_status: QueueStatus;
  sources: Array<{ source_id: string; title: string; url: string; checked_on: string }>;
  uncertainties: string[];
};

export type SavedTrip = {
  id: string;
  createdAt: string;
  status: "upcoming" | "past";
  plan: PlanResult;
};
