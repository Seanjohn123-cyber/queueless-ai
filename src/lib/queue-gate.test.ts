// Run with: npx tsx src/lib/queue-gate.test.ts
import assert from "node:assert/strict";
import {
  estimateForService,
  getQueueStatus,
  gateConfig,
  type QueueObservation,
  type GateConfig,
} from "./queue-gate";

const CFG: GateConfig = { minObservations: 5, maxAgeHours: 24 * 7, maxCV: 0.8 };
const NOW = Date.parse("2026-10-21T12:00:00Z");
const RECENT = "2026-10-21T10:00:00Z";

function obs(overrides: Partial<QueueObservation>): QueueObservation {
  return {
    service_id: "ng_standard_passport_renewal",
    location_id: null,
    arrived_at: RECENT,
    wait_minutes: 20,
    outcome: "completed",
    reported_at: RECENT,
    ...overrides,
  };
}

// 1. No observations → unknown
{
  const r = estimateForService("ng_standard_passport_renewal", [], CFG, NOW);
  assert.equal(r.status, "unknown");
  assert.equal(r.wait_minutes, null);
  assert.match(r.reason, /No visit reports/);
}

// 2. Below min observations → unknown with count reason
{
  const o = [obs({ wait_minutes: 15 })];
  const r = estimateForService("ng_standard_passport_renewal", o, CFG, NOW);
  assert.equal(r.status, "unknown");
  assert.match(r.reason, /Only 1 recent/);
}

// 3. Stale observations → unknown with age reason
{
  const staleTime = new Date(
    NOW - (CFG.maxAgeHours * 3_600_000 + 60_000),
  ).toISOString();
  const o = Array.from({ length: 5 }, () => obs({ reported_at: staleTime }));
  const r = estimateForService("ng_standard_passport_renewal", o, CFG, NOW);
  assert.equal(r.status, "unknown");
  assert.match(r.reason, /older/);
}

// 4. Sufficient consistent observations → estimated
{
  const o = Array.from({ length: 5 }, (_, i) =>
    obs({ wait_minutes: 18 + i }),
  );
  const r = estimateForService("ng_standard_passport_renewal", o, CFG, NOW);
  assert.equal(r.status, "estimated");
  assert.ok(r.wait_minutes !== null);
  assert.ok(r.wait_minutes.min >= 0);
  assert.ok(r.wait_minutes.max >= r.wait_minutes.min);
  assert.equal(typeof r.service_id, "string");
  assert.ok(typeof r.observed_at === "string");
  assert.ok(r.confidence !== null && r.confidence >= 0 && r.confidence <= 1);
  assert.ok(r.data_window !== null);
  assert.equal(r.data_window.observations, 5);
  assert.match(r.reason, /Based on 5 visit reports/);
}

// 5. Highly inconsistent observations → unknown
{
  const o = [
    obs({ wait_minutes: 2 }),
    obs({ wait_minutes: 150 }),
    obs({ wait_minutes: 300 }),
    obs({ wait_minutes: 5 }),
    obs({ wait_minutes: 480 }),
  ];
  const r = estimateForService("ng_standard_passport_renewal", o, CFG, NOW);
  assert.equal(r.status, "unknown");
  assert.match(r.reason, /vary too much/);
}

// 6. Range is rounded to nearest 5 (no false precision)
{
  const o = Array.from({ length: 5 }, () => obs({ wait_minutes: 22 }));
  const r = estimateForService("ng_standard_passport_renewal", o, CFG, NOW);
  assert.equal(r.status, "estimated");
  assert.ok(r.wait_minutes!.min % 5 === 0);
  assert.ok(r.wait_minutes!.max % 5 === 0);
}

// 7. Collapse protection: min == max → max widened by 5
{
  const o = Array.from({ length: 5 }, () => obs({ wait_minutes: 10 }));
  const r = estimateForService("ng_standard_passport_renewal", o, CFG, NOW);
  assert.equal(r.status, "estimated");
  assert.ok(r.wait_minutes!.max > r.wait_minutes!.min);
}

// 8. Plan-level: single service delegates to estimateForService
{
  const o = Array.from({ length: 5 }, (_, i) =>
    obs({ wait_minutes: 20 + i }),
  );
  const r = getQueueStatus(["ng_standard_passport_renewal"], o, CFG, NOW);
  assert.equal(r.status, "estimated");
  assert.equal(r.service_id, "ng_standard_passport_renewal");
}

// 9. Plan-level: all unknown → aggregated unknown
{
  const r = getQueueStatus(
    [
      "ng_standard_passport_renewal",
      "ng_national_drivers_licence_renewal",
    ],
    [],
    CFG,
    NOW,
  );
  assert.equal(r.status, "unknown");
  assert.equal(r.wait_minutes, null);
}

// 10. Plan-level: mixed services → picks the freshest estimated, notes the other
{
  // Stale: passport observations are > 7 days from NOW.
  const staleDate = "2026-10-07T08:00:00Z";
  const oldObs = Array.from({ length: 5 }, () =>
    obs({
      service_id: "ng_standard_passport_renewal",
      wait_minutes: 25,
      reported_at: staleDate,
    }),
  );
  const freshObs = Array.from({ length: 5 }, () =>
    obs({
      service_id: "ng_national_drivers_licence_renewal",
      wait_minutes: 10,
      reported_at: "2026-10-21T09:00:00Z",
    }),
  );
  const r = getQueueStatus(
    [
      "ng_standard_passport_renewal",
      "ng_national_drivers_licence_renewal",
    ],
    [...oldObs, ...freshObs],
    CFG,
    NOW,
  );
  assert.equal(r.status, "estimated");
  assert.equal(r.service_id, "ng_national_drivers_licence_renewal");
  assert.match(r.reason, /no reliable estimate is available for ng_standard_passport_renewal/i);
}

// 11. getQueueStatus with no service IDs → unknown
{
  const r = getQueueStatus([], [], CFG, NOW);
  assert.equal(r.status, "unknown");
}

// 12. getQueueStatus with one service that passes → estimate
{
  const o = Array.from({ length: 5 }, () =>
    obs({ wait_minutes: 15 }),
  );
  const r = getQueueStatus(["ng_standard_passport_renewal"], o, CFG, NOW);
  assert.equal(r.status, "estimated");
  assert.equal(r.service_id, "ng_standard_passport_renewal");
}

console.log("queue-gate: all checks passed");