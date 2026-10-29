/**
 * Deterministic queue-estimate gate for QueueLess.
 *
 * Estimates are computed in CODE, never by the model, so the sufficiency and
 * freshness policy can be checked and tested. The policy (initial, from the PRD):
 *
 *  1. Credibility  – observations come only from stored user visit reports that
 *                    passed /api/report validation; there is no free-text wait.
 *  2. Sufficiency  – at least QUEUE_MIN_OBSERVATIONS (=5) reports for the service.
 *  3. Freshness    – every report used must be at most QUEUE_MAX_AGE_HOURS (=168h
 *                    / 7 days) old, measured from reported_at.
 *  4. Consistency  – coefficient of variation (stdev/mean) at most
 *                    QUEUE_MAX_CV (=0.8); wildly different reports fail the gate.
 *
 * A failed check returns status "unknown" with the reason. A passing check
 * returns a rounded range (nearest 5 minutes, no false precision), the most
 * recent observation timestamp, a confidence in [0, 1], and the contributing
 * data window.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueueObservation {
  service_id: string;
  location_id: string | null;
  arrived_at: string;
  wait_minutes: number;
  outcome: string;
  reported_at: string;
}

export interface QueueDataWindow {
  from: string; // oldest contributing report time (ISO)
  to: string; // newest contributing report time (ISO)
  observations: number;
}

export interface QueueStatusResult {
  status: "unknown" | "estimated";
  /** The service this estimate is for; null when fully unknown. */
  service_id: string | null;
  wait_minutes: { min: number; max: number } | null;
  /** ISO date-time of the most recent observation used. */
  observed_at: string | null;
  /** Confidence in [0, 1]; higher = more recent, many, consistent reports. */
  confidence: number | null;
  /** Human-readable explanation shown to the user. */
  reason: string;
  /** Time window and count of contributing observations; null when unknown. */
  data_window: QueueDataWindow | null;
}

export interface GateConfig {
  minObservations: number;
  maxAgeHours: number;
  maxCV: number;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export function gateConfig(env: NodeJS.ProcessEnv = process.env): GateConfig {
  return {
    minObservations: toInt(env.QUEUE_MIN_OBSERVATIONS, 5),
    maxAgeHours: toInt(env.QUEUE_MAX_AGE_HOURS, 24 * 7),
    maxCV: toNum(env.QUEUE_MAX_CV, 0.8),
  };
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

export function loadObservations(): QueueObservation[] {
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "observations.jsonl"),
      "utf8",
    );
    const rows: QueueObservation[] = [];
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (
          typeof parsed.service_id === "string" &&
          typeof parsed.wait_minutes === "number" &&
          Number.isFinite(parsed.wait_minutes) &&
          parsed.wait_minutes >= 0 &&
          typeof parsed.reported_at === "string" &&
          Number.isFinite(Date.parse(parsed.reported_at))
        ) {
          rows.push({
            service_id: parsed.service_id,
            location_id:
              typeof parsed.location_id === "string" ? parsed.location_id : null,
            arrived_at:
              typeof parsed.arrived_at === "string" ? parsed.arrived_at : parsed.reported_at,
            wait_minutes: parsed.wait_minutes,
            outcome:
              typeof parsed.outcome === "string" ? parsed.outcome : "completed",
            reported_at: parsed.reported_at,
          });
        }
      } catch {
        /* skip malformed lines */
      }
    }
    return rows;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Per-service estimate
// ---------------------------------------------------------------------------

export function estimateForService(
  serviceId: string,
  observations: QueueObservation[],
  cfg: GateConfig,
  now: number = Date.now(),
): QueueStatusResult {
  const byService = observations.filter((o) => o.service_id === serviceId);
  if (byService.length === 0) {
    return unknownResult(
      serviceId,
      "No visit reports have been recorded for this service yet.",
    );
  }

  // Freshness gate: check the most recent first to avoid wasting work.
  const latest = byService.reduce((a, b) =>
    a.reported_at > b.reported_at ? a : b,
  );
  const ageMs = now - Date.parse(latest.reported_at);
  const maxAgeMs = cfg.maxAgeHours * 3_600_000;
  if (ageMs > maxAgeMs) {
    return unknownResult(
      serviceId,
      `The most recent report for this service was on ${formatIsoDate(latest.reported_at)}, which is older than ${cfg.maxAgeHours} h. No estimate can be shown until recent reports exist.`,
    );
  }

  // Keep only recent observations.
  const recent = byService.filter(
    (o) => now - Date.parse(o.reported_at) <= maxAgeMs,
  );

  if (recent.length < cfg.minObservations) {
    return unknownResult(
      serviceId,
      `Only ${recent.length} recent visit report${recent.length === 1 ? "" : "s"} are available for this service; at least ${cfg.minObservations} are needed for an estimate.`,
    );
  }

  // Consistency gate.
  const waits = recent.map((o) => o.wait_minutes).sort((a, b) => a - b);
  const n = waits.length;
  const mean = waits.reduce((s, w) => s + w, 0) / n;
  const variance =
    n > 1
      ? waits.reduce((s, w) => s + (w - mean) ** 2, 0) / (n - 1) // sample variance
      : 0;
  const std = Math.sqrt(variance);
  const cv = mean > 0 ? std / mean : 0;

  if (cv > cfg.maxCV) {
    return unknownResult(
      serviceId,
      `The recent reports vary too much (CV = ${cv.toFixed(2)}) to give a reliable range.`,
    );
  }

  // ---- Passed: compute estimate ----
  const lo = round5(Math.max(0, mean - std));
  let hi = round5(mean + std);
  if (hi <= lo) hi = lo + 5;

  // Confidence: product of recency, sufficiency, and consistency factors.
  const nFactor = Math.min(n / cfg.minObservations, 1);
  const consistency = Math.max(0, 1 - Math.min(cv, 1));
  const recency = Math.max(0, 1 - ageMs / maxAgeMs);
  const confidence =
    Math.round(nFactor * consistency * recency * 100) / 100;

  // Data window.
  const from = recent.reduce((a, b) => (a.reported_at < b.reported_at ? a : b));
  const to = recent.reduce((a, b) => (a.reported_at > b.reported_at ? a : b));

  return {
    status: "estimated",
    service_id: serviceId,
    wait_minutes: { min: lo, max: hi },
    observed_at: to.reported_at,
    confidence,
    reason: `Based on ${n} visit report${n === 1 ? "" : "s"} recorded between ${formatIsoDate(from.reported_at)} and ${formatIsoDate(to.reported_at)}.`,
    data_window: { from: from.reported_at, to: to.reported_at, observations: n },
  };
}

// ---------------------------------------------------------------------------
// Plan-level (multi-service) gate
// ---------------------------------------------------------------------------

/**
 * Compute a single queue_status for a plan with the given service IDs.
 *
 * - If only one service is selected → that service's estimate.
 * - If multiple: if at least one service passes the gate, report the most
 *   recently observed estimate (pick the freshest). The reason names the
 *   other services and why they have no estimate. If every service fails,
 *   return unknown with an aggregated reason.
 */
export function getQueueStatus(
  serviceIds: string[],
  observations?: QueueObservation[],
  cfg?: GateConfig,
  now?: number,
): QueueStatusResult {
  const obs = observations ?? loadObservations();
  const cfg_ = cfg ?? gateConfig();
  const now_ = now ?? Date.now();

  const results = serviceIds.map((id) =>
    estimateForService(id, obs, cfg_, now_),
  );

  const estimated = results.filter((r) => r.status === "estimated");

  if (estimated.length === 0) {
    const reasons = results.map((r) => r.reason).filter(Boolean);
    const reason =
      reasons.length > 0
        ? reasons.join(" ")
        : "No reliable queue observations are configured for this pilot.";
    return {
      status: "unknown",
      service_id: null,
      wait_minutes: null,
      observed_at: null,
      confidence: null,
      reason,
      data_window: null,
    };
  }

  // Pick the freshest estimate.
  estimated.sort(
    (a, b) => Date.parse(b.observed_at!) - Date.parse(a.observed_at!),
  );
  const pick = estimated[0];
  const unestimated = results.filter(
    (r) => r.status !== "estimated",
  );

  if (unestimated.length > 0) {
    const names = unestimated
      .map((r) => r.service_id ?? "another service")
      .join(", ");
    pick.reason += ` No reliable estimate is available for ${names}.`;
  }

  return pick;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function unknownResult(
  serviceId: string | null,
  reason: string,
): QueueStatusResult {
  return {
    status: "unknown",
    service_id: serviceId, // null only when no service was assessed
    wait_minutes: null,
    observed_at: null,
    confidence: null,
    reason,
    data_window: null,
  };
}

function round5(x: number): number {
  return Math.round(x / 5) * 5;
}

function formatIsoDate(iso: string): string {
  // "2026-10-21T11:17:11.256Z" → "21 Oct 2026"
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toInt(raw: string | undefined, fallback: number): number {
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toNum(raw: string | undefined, fallback: number): number {
  const n = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}