# QueueLess AI — Product Requirements (MVP)

## Summary

QueueLess AI is an AI-assisted service-visit preparation and planning tool. It helps people understand what to bring, compare service options, and sequence errands. It only reports queue waits when the underlying data is reliable and recent enough to support an estimate.

## Problem hypothesis

People who rely on in-person services may lack reliable, actionable information about wait times, requirements, and the best order for errands. This can lead to wasted time and repeat visits. This is a hypothesis to validate, not an established claim about every location.

## Users

**Primary:** time-constrained people who need to visit physical service locations, such as workers, students, and small-business owners.

**Potential future customers:** service operators seeking better visitor preparation and queue management.

## MVP outcome

A user can describe a service task and receive a useful, traceable visit plan: relevant official requirements, service options from a curated dataset, a checklist, and a sequence for planned errands. When queue data is insufficient, the interface clearly reports “Wait time unknown.”

## MVP scope

1. Task intake: capture service need, location, timing constraints, and optional additional errands.
2. Grounded information: retrieve from a small, curated set of official sources; retain source links and retrieval/update timestamps.
3. Checklist: produce a task-specific list of required documents and preparation steps, with provenance.
4. Visit planner: propose an order for selected stops using known location and user constraints. Clearly identify unavailable inputs.
5. Queue information: use timestamped observations only when a minimum data-quality policy is met; display observation time and confidence. Otherwise return unknown, without synthesizing a numeric estimate.
6. Visit report: let users optionally record actual wait and visit outcome for evaluation and future data quality work.

## Out of scope for the one-week MVP

- Claims of guaranteed wait-time accuracy or queue avoidance.
- Broad multi-city or multi-category coverage.
- Unverified live appointment booking or service-provider integrations.
- Payments, accounts, or collection of sensitive identity documents unless separately justified.
- Treating model output as an authoritative source for fees, hours, requirements, or availability.

## Product principles and safeguards

- **Source every operational fact:** requirements, fees, hours, and appointment rules should link to an official source and show when checked.
- **Separate facts from estimates:** label the source, observed-at time, and confidence for queue estimates.
- **Unknown is a valid answer:** missing or stale data yields no numeric wait estimate.
- **Keep plans actionable:** show assumptions and let users edit or reject suggested stops and ordering.
- **Minimize data:** collect only what is needed for the plan; make visit reporting optional.

## Core user flow

1. User describes a service task and any time/location constraints.
2. System validates inputs and retrieves relevant curated official information.
3. System returns a checklist and service options with sources.
4. User selects tasks/stops; planner proposes an order and explains missing information.
5. Queue estimate is shown only if observation sufficiency and freshness checks pass; otherwise wait is unknown.
6. User can record actual wait and outcome after the visit.

## Functional requirements

- Accept a natural-language task and convert it into a structured plan request.
- Validate required fields and return clear correction guidance for incomplete input.
- Retrieve only from the configured knowledge base for factual service guidance.
- Preserve citations and timestamps through the response to the UI.
- Validate generated plans against known constraints before presenting them.
- Implement a deterministic queue-data sufficiency gate before displaying an estimate.
- Record queue observations with location, observed time, reported wait, and data provenance; avoid presenting unverified submissions as ground truth.
- Provide understandable loading, empty, unknown-data, and error states.

## Non-functional requirements

- API responses use a documented, versionable schema.
- Secrets are supplied through environment configuration and excluded from version control.
- Errors do not expose credentials or private user data.
- The UI works on common mobile and desktop viewport sizes.
- Core planning remains useful when queue data or the model provider is unavailable, with graceful degradation.

## Queue estimate policy (initial)

The exact thresholds must be chosen and documented for the pilot dataset before launch. At minimum, the gate checks source credibility, observation recency, number of independent observations, and consistency. A failed check returns `unknown` with a reason. A passing estimate includes a numeric range (not false precision), `observed_at`, `confidence`, and the contributing data window. The model must not bypass this gate.

## Evaluation

- Checklist completeness against a reviewed set of official requirements.
- Factual accuracy and citation coverage for every operational claim.
- Plan validity against stated user constraints and available location data.
- Queue gate correctness: no estimate for insufficient/stale data; estimate metadata present when allowed.
- User research: interview 8–10 recent service visitors; document actual expectations, waits, missing-document incidents, repeat visits, and current workarounds.
- Pilot: compare submitted wait observations with the estimate range and report coverage separately from accuracy.

No impact or savings claims should be made until supported by pilot evidence.

## Risks and dependencies

- Reliable queue data is the hardest dependency; user reports may be sparse, biased, or stale.
- Official information can change; the curated knowledge base needs source ownership and refresh cadence.
- A broad scope will undermine data quality; pick one pilot city and category before implementation.
- Generated multi-stop ordering can be misleading when travel-time or opening-hour data is absent; expose assumptions.
- Personal tasks can contain sensitive details; minimize retention and avoid asking for document images in the MVP.

## Open decisions

- Pilot city and first service category.
- Initial technology stack and deployment target.
- Official sources to curate and who maintains them.
- Queue observation sources and the precise sufficiency/freshness thresholds.
- Whether the first demo uses a live model endpoint or a deterministic mock/fallback.

## One-week build sequence

1. **Day 1 — Validate and narrow:** conduct initial interviews; choose pilot city/category; list authoritative sources and define test tasks.
2. **Day 2 — Data and contracts:** curate a small source set; define structured request/plan schemas and queue observation policy.
3. **Day 3 — Service API:** implement validated task intake, grounded retrieval, and response provenance.
4. **Day 4 — Planning and queue gate:** generate/validate checklists and visit plans; implement explicit unknown behavior and estimate metadata.
5. **Day 5 — UI integration:** connect the supplied home, tracker, and report concepts; cover loading, empty, and unknown states.
6. **Day 6 — Evaluation and polish:** run reviewed scenarios, fix unsupported claims, improve responsive behavior and error handling.
7. **Day 7 — Demo readiness:** prepare a reproducible demo dataset, document limitations, capture the end-to-end flow, and present evaluation results honestly.

## Confirmed pilot decisions (2026-10-21)

- **Location:** Lagos, Lagos State, Nigeria.
- **Services:** Nigerian standard passport renewal and national driver's licence renewal.
- **Official source inventory:** `data/sources.json`; all pages were checked on 2026-10-21.
- **Service corpus:** `data/services.json` records source IDs per requirement and step. The driver's licence renewal fee is intentionally `null`: the reviewed FRSC FAQ publishes fees for a new licence, not renewal.
- **Plan response schema:** `schemas/visit-plan.schema.json`.
- **Evaluation set:** `eval/scenarios.json` contains 14 scenarios with expected answer keys, authored before agent implementation.
- **Model:** `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` on Nebius Token Factory. A chat-completions call succeeded. A 48-token first attempt stopped before producing message content; the smoke script now allows 1,024 completion tokens and checks for non-empty content.

The NIS renewal pages have slightly different presentation of the required items. The corpus uses the NIS renewal requirements page and cites the step page separately for the NIN and ICAO photo steps. FRSC's renewal page specifies renewal within 30 days before expiry for a valid licence, while the FAQ separately says recently expired licences should initiate renewal; the corpus keeps both statements visible rather than collapsing them into one rule.

## Demo acceptance criteria

- A user can enter a task and receive a structured checklist and visit plan.
- Factual checklist items link to configured official sources.
- An insufficient-data scenario visibly returns “Wait time unknown” and produces no numeric wait.
- A sufficient-data scenario displays estimate range, observation timestamp, and confidence.
- Missing/stale sources and provider errors degrade clearly without fabricated information.
- The demo identifies its pilot coverage and known limitations.
