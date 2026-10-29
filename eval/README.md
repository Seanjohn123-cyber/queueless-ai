# Evaluation protocol

`scenarios.json` is the fixed 14-case question set and answer key. It was written before implementing the planner route.

For each case, compare:

1. **Plain-prompt baseline:** one Nemotron chat completion receives the user request and the full service corpus, with a plain instruction to answer helpfully.
2. **QueueLess planner:** the plan endpoint extracts intent, retrieves only selected corpus entries, generates the response, then validates the schema and normalizes requirements, fees, sources, and queue state.

Score each response against the scenario's `expected` fields. Record pass/fail per criterion, factual/source errors, unsupported assertions, response latency, and token use. A numeric queue estimate is an automatic failure because this pilot has no queue-observation fixture. Do not include the API key or raw hidden reasoning in saved results.

Results belong in `eval/results.json` and a compact table suitable for the pitch in `eval/results.md`. They are intentionally not prefilled with invented measurements; run the suite against the configured account before quoting results.
