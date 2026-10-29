import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import locations from "@/data/locations.json";
import { getQueueStatus, gateConfig, loadObservations, type QueueObservation } from "@/lib/queue-gate";

export const runtime = "nodejs";

const allowedServices = new Set([
  "ng_standard_passport_renewal",
  "ng_national_drivers_licence_renewal",
]);
const allowedOutcomes = new Set(["completed", "return_required", "not_completed"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.service_id !== "string" || !allowedServices.has(body.service_id)) {
      return NextResponse.json({ error: "Select one of the two pilot services." }, { status: 400 });
    }
    if (body.location_id !== undefined && body.location_id !== null && typeof body.location_id !== "string") {
      return NextResponse.json({ error: "Select a valid listed location." }, { status: 400 });
    }
    const selectedLocation = typeof body.location_id === "string"
      ? locations.locations.find((location) => location.id === body.location_id)
      : null;
    if (typeof body.location_id === "string" && !selectedLocation) {
      return NextResponse.json({ error: "Select a valid listed location." }, { status: 400 });
    }
    const expectedLocationService = body.service_id === "ng_standard_passport_renewal" ? "passport" : "drivers_licence";
    if (selectedLocation && selectedLocation.service !== expectedLocationService) {
      return NextResponse.json({ error: "The selected location does not match the service visited." }, { status: 400 });
    }
    if (typeof body.wait_minutes !== "number" || !Number.isInteger(body.wait_minutes) || body.wait_minutes < 0 || body.wait_minutes > 1440) {
      return NextResponse.json({ error: "Enter a wait between 0 and 1,440 minutes." }, { status: 400 });
    }
    if (typeof body.arrived_at !== "string" || !Number.isFinite(Date.parse(body.arrived_at))) {
      return NextResponse.json({ error: "Enter a valid arrival time." }, { status: 400 });
    }
    if (typeof body.outcome !== "string" || !allowedOutcomes.has(body.outcome)) {
      return NextResponse.json({ error: "Select a valid visit outcome." }, { status: 400 });
    }
    if (body.missing_items !== undefined && (typeof body.missing_items !== "string" || body.missing_items.length > 500)) {
      return NextResponse.json({ error: "Keep the checklist note under 500 characters." }, { status: 400 });
    }
    if (process.env.VERCEL) {
      return NextResponse.json({ error: "Report storage is not configured for the deployed pilot yet." }, { status: 503 });
    }

    const row = {
      service_id: body.service_id,
      location_id: selectedLocation?.id ?? null,
      arrived_at: new Date(body.arrived_at).toISOString(),
      wait_minutes: body.wait_minutes,
      outcome: body.outcome,
      missing_items: typeof body.missing_items === "string" ? body.missing_items.trim() : "",
      reported_at: new Date().toISOString(),
    };
    await appendFile(join(process.cwd(), "data", "observations.jsonl"), `${JSON.stringify(row)}\n`, { encoding: "utf8" });

    // Return updated queue gate status for the reported service.
    const allObs = [...loadObservations(), row as QueueObservation];
    const queueStatus = getQueueStatus([body.service_id], allObs, gateConfig());
    return NextResponse.json({ saved: true, queue_status: queueStatus });
  } catch {
    return NextResponse.json({ error: "The report could not be saved." }, { status: 500 });
  }
}
