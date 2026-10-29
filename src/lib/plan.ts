import Ajv2020 from "ajv/dist/2020";
import serviceCorpus from "@/data/services.json";
import sourceCatalog from "@/data/sources.json";
import planSchema from "@/schemas/visit-plan.schema.json";
import type { OrderResult } from "@/lib/order-plan";
import type { QueueStatusResult } from "@/lib/queue-gate";

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addFormat("uri", (value: string) => {
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
});
ajv.addFormat("date", (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)));
ajv.addFormat("date-time", (value: string) => /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)));
const validateSchema = ajv.compile(planSchema);

export const serviceIds = [
  "ng_standard_passport_renewal",
  "ng_national_drivers_licence_renewal",
] as const;

export type ServiceId = (typeof serviceIds)[number];

export function extractRequestedServices(message: string) {
  const text = message.toLocaleLowerCase();
  const matches: Array<{ id: ServiceId; index: number }> = [];

  const passportAt = text.search(/\bpassport\b/);
  if (passportAt >= 0 && /\b(renew(?:al|ing)?|reissue|re-issue)\b/.test(text) && !/\b(new|fresh|lost|stolen)\s+(?:nigerian\s+)?passport\b/.test(text)) {
    matches.push({ id: serviceIds[0], index: passportAt });
  }

  const licenceAt = text.search(/\b(?:driver'?s?\s+(?:licen[cs]e)|driving\s+(?:licen[cs]e))\b/);
  const hasExistingExpiredLicence = /\b(expired|expiry)\b/.test(text) && /\b(my|existing|current)\b/.test(text);
  if (licenceAt >= 0 && (/\b(renew(?:al|ing)?|reissue|re-issue)\b/.test(text) || hasExistingExpiredLicence) && !/\b(new|fresh|first[- ]time)\s+(?:application|licen[cs]e)\b/.test(text)) {
    matches.push({ id: serviceIds[1], index: licenceAt });
  }

  const serviceTermsPresent = /\bpassport\b|\b(?:driver'?s?\s+(?:licen[cs]e)|driving\s+(?:licen[cs]e))\b/.test(text);
  const explicitlyOutsideScope = /\b(new|fresh|lost|stolen|first[- ]time)\b/.test(text) && serviceTermsPresent;
  const selectedIds = [...new Set(matches.sort((a, b) => a.index - b.index).map((match) => match.id))];

  let clarificationQuestion: string | null = null;
  if (!selectedIds.length && serviceTermsPresent) {
    clarificationQuestion = explicitlyOutsideScope
      ? "This pilot covers renewals only. Are you renewing an existing passport or driver's licence?"
      : "Are you applying for a new service or renewing an existing passport or driver's licence? This pilot covers renewals only.";
  } else if (!selectedIds.length) {
    clarificationQuestion = "This Lagos pilot covers standard passport renewal and driver's licence renewal. Which one do you need help preparing for?";
  }

  return { selectedIds, clarificationQuestion };
}

export function parseModelJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed);
}

export function buildValidatedPlan(draft: unknown, selectedIds: ServiceId[], ordering: OrderResult, queueStatus?: QueueStatusResult) {
  const summary = (draft as { request_summary?: unknown } | null)?.request_summary;
  const requestSummary = typeof summary === "string" && summary.trim().length > 0 && summary.length <= 180
    ? summary.trim()
    : "Your Lagos service visit plan";
  const selectedServices = serviceCorpus.services.filter((service) => selectedIds.includes(service.id as ServiceId));
  const sourceIds = [...new Set(selectedServices.flatMap((service) => service.source_ids))];
  const sources = sourceCatalog.sources
    .filter((source) => sourceIds.includes(source.id))
    .map((source) => ({ source_id: source.id, title: source.title, url: source.url, checked_on: source.checked_on }));

  const candidate = {
    schema_version: "1.0",
    request_summary: requestSummary,
    pilot_location: { city: "Lagos", state: "Lagos State", country: "Nigeria" },
    services: selectedServices.map((service) => ({
      service_id: service.id,
      status: "supported",
      eligibility: service.eligibility,
      checklist: service.required_documents.map((item) => ({
        item_id: item.id,
        label: item.label,
        status: "required",
        source_ids: item.source_ids,
      })),
      steps: service.preparation_steps.map((step) => step.label),
      fees: (service.fees ?? []).map((fee) => ({
        amount: fee.amount,
        currency: fee.currency,
        option: fee.option,
        source_ids: fee.source_ids,
      })),
      fee_note: service.fee_note,
    })),
    stops: ordering.order.map((step) => ({
      order: step.step,
      service_id: step.id,
      visit_mode: "in_person",
      location_name: null,
      reason: step.reason,
    })),
    order_basis: ordering.basis,
    queue_status: queueStatus ?? {
      status: "unknown",
      service_id: null,
      wait_minutes: null,
      observed_at: null,
      confidence: null,
      reason: "No sufficiently reliable, timestamped queue observations are configured for this pilot.",
      data_window: null,
    },
    sources,
    uncertainties: ["The selected services are handled by separate agencies.", "Exact processing-centre addresses, opening hours, appointment slots, travel times, and live queue observations are not configured."],
  };

  if (!validateSchema(candidate)) {
    const detail = ajv.errorsText(validateSchema.errors, { separator: "; " });
    throw new Error(`Validated plan did not match the response schema: ${detail}`);
  }

  // Final deterministic guards: service/source IDs must be from the selected corpus.
  // Queue status: only "unknown" or "estimated" are allowed. When "unknown",
  // wait_minutes must be null. When "estimated", all metadata must be present.
  const allowedServices = new Set(selectedIds);
  const allowedSources = new Set(sourceIds);
  if (candidate.services.some((service) => !allowedServices.has(service.service_id as ServiceId))) {
    throw new Error("Validated plan contains an unselected service.");
  }
  if (candidate.sources.some((source) => !allowedSources.has(source.source_id))) {
    throw new Error("Validated plan contains an unrelated source.");
  }
  if (candidate.queue_status.status === "unknown" && candidate.queue_status.wait_minutes !== null) {
    throw new Error("Queue status unknown but wait_minutes is not null.");
  }
  if (candidate.queue_status.status === "estimated" && (candidate.queue_status.wait_minutes === null || !candidate.queue_status.observed_at || candidate.queue_status.confidence === null || !candidate.queue_status.data_window)) {
    throw new Error("Queue status estimated but required metadata is missing.");
  }
  return candidate;
}
