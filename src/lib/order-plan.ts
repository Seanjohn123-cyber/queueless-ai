/**
 * Deterministic errand ordering for QueueLess.
 * Drop into: src/lib/order-plan.ts
 *
 * Ordering is decided by CODE, not by the model, so it is repeatable and testable.
 * It never uses queue or wait data (you have none). Every step explains the rule
 * that placed it.
 *
 * Rules, in priority order:
 *  1. dependency  - if the corpus says service B depends on A, A comes first.
 *                   Only add `dependsOn` in services.json when an official
 *                   source confirms it. Never guess a dependency.
 *  2. urgent      - the user gave a deadline for this errand.
 *  3. ready       - fewer missing items first, so something can be finished this trip.
 *  4. request     - otherwise keep the order the user asked in.
 */

export interface OrderInput {
  id: string;
  name: string;
  /** Items the user said they are missing for this service. 0 if unknown/none. */
  missingCount?: number;
  /** Service ids that must be completed first. Only when officially sourced. */
  dependsOn?: string[];
  /** True if the user stated a deadline for this errand. */
  urgent?: boolean;
  /** Position in the user's request (0-based). Used as the final tie-break. */
  requestIndex: number;
}

export type OrderRule = "dependency" | "urgent" | "ready" | "request";

export interface OrderedStep {
  step: number;
  id: string;
  name: string;
  rule: OrderRule;
  reason: string;
}

export interface OrderResult {
  order: OrderedStep[];
  /** Show this in the UI so the basis of the ordering is never overstated. */
  basis: string;
}

const BASIS =
  "Order is based on listed dependencies, your deadlines, and what you already have. It does not use queue or waiting-time data.";

export function orderServices(items: OrderInput[]): OrderResult {
  const byId = new Map(items.map((i) => [i.id, i]));
  const remaining = new Set(items.map((i) => i.id));
  const done = new Set<string>();
  const order: OrderedStep[] = [];

  // Only honour dependencies that point at services actually in this request.
  const depsOf = (i: OrderInput) =>
    (i.dependsOn ?? []).filter((d) => byId.has(d) && d !== i.id);

  const dependentsLeft = (id: string) =>
    [...remaining].filter((r) => r !== id && depsOf(byId.get(r)!).includes(id));

  const cmp = (a: OrderInput, b: OrderInput): number => {
    const ua = a.urgent ? 1 : 0;
    const ub = b.urgent ? 1 : 0;
    if (ua !== ub) return ub - ua;
    const ma = a.missingCount ?? 0;
    const mb = b.missingCount ?? 0;
    if (ma !== mb) return ma - mb;
    return a.requestIndex - b.requestIndex;
  };

  while (remaining.size > 0) {
    let candidates = [...remaining]
      .map((id) => byId.get(id)!)
      .filter((i) => depsOf(i).every((d) => done.has(d)));

    // Circular dependencies in the corpus: fall back to request order.
    let cycle = false;
    if (candidates.length === 0) {
      cycle = true;
      candidates = [...remaining].map((id) => byId.get(id)!);
    }

    candidates.sort(cmp);
    const pick = candidates[0];
    const others = candidates.slice(1);
    const blocked = dependentsLeft(pick.id).map((id) => byId.get(id)!.name);

    let rule: OrderRule;
    let reason: string;

    if (cycle) {
      rule = "request";
      reason =
        "The listed dependencies conflict, so this follows the order you asked in.";
    } else if (blocked.length > 0) {
      rule = "dependency";
      reason = `Do this first: ${blocked.join(", ")} depends on it.`;
    } else if (pick.urgent && others.some((o) => !o.urgent)) {
      rule = "urgent";
      reason = "You gave a deadline for this one.";
    } else if (
      others.length > 0 &&
      (pick.missingCount ?? 0) < Math.max(...others.map((o) => o.missingCount ?? 0))
    ) {
      rule = "ready";
      const m = pick.missingCount ?? 0;
      reason =
        m === 0
          ? "You already have what this needs, so you can finish it this trip."
          : `You are only missing ${m} item${m === 1 ? "" : "s"}, fewer than the others.`;
    } else {
      rule = "request";
      reason = "Nothing separates these errands, so this follows the order you asked in.";
    }

    order.push({ step: order.length + 1, id: pick.id, name: pick.name, rule, reason });
    remaining.delete(pick.id);
    done.add(pick.id);
  }

  return { order, basis: BASIS };
}
