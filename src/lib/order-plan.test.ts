// Run with: npx tsx src/lib/order-plan.test.ts
import assert from "node:assert/strict";
import { orderServices } from "./order-plan";

const ids = (r: ReturnType<typeof orderServices>) => r.order.map((s) => s.id);

// 1. Dependency beats everything else.
{
  const r = orderServices([
    { id: "B", name: "B", requestIndex: 0, dependsOn: ["A"], urgent: true },
    { id: "A", name: "A", requestIndex: 1 },
  ]);
  assert.deepEqual(ids(r), ["A", "B"]);
  assert.equal(r.order[0].rule, "dependency");
}

// 2. Urgent errand goes first when there is no dependency.
{
  const r = orderServices([
    { id: "A", name: "A", requestIndex: 0 },
    { id: "B", name: "B", requestIndex: 1, urgent: true },
  ]);
  assert.deepEqual(ids(r), ["B", "A"]);
  assert.equal(r.order[0].rule, "urgent");
}

// 3. Fewer missing items goes first.
{
  const r = orderServices([
    { id: "A", name: "A", requestIndex: 0, missingCount: 3 },
    { id: "B", name: "B", requestIndex: 1, missingCount: 0 },
  ]);
  assert.deepEqual(ids(r), ["B", "A"]);
  assert.equal(r.order[0].rule, "ready");
}

// 4. No signal: keep request order.
{
  const r = orderServices([
    { id: "A", name: "A", requestIndex: 0 },
    { id: "B", name: "B", requestIndex: 1 },
  ]);
  assert.deepEqual(ids(r), ["A", "B"]);
  assert.equal(r.order[0].rule, "request");
}

// 5. Circular dependency does not crash or loop.
{
  const r = orderServices([
    { id: "A", name: "A", requestIndex: 0, dependsOn: ["B"] },
    { id: "B", name: "B", requestIndex: 1, dependsOn: ["A"] },
  ]);
  assert.equal(r.order.length, 2);
}

// 6. Dependency on a service not in this request is ignored.
{
  const r = orderServices([{ id: "A", name: "A", requestIndex: 0, dependsOn: ["Z"] }]);
  assert.deepEqual(ids(r), ["A"]);
}

console.log("order-plan: all checks passed");
