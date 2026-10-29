# QueueLess pilot evaluation results

Model: `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`  
Scenarios: 14  
Run: 2026-10-29T12:26:31.480506+00:00

| Scenario | Plain prompt | QueueLess planner | Baseline sec | Planner sec |
|---|---:|---:|---:|---:|
| passport_renewal_checklist | 3/3 | 3/3 | 11.18 | 19.41 |
| passport_fee_32_page | 3/3 | 3/3 | 2.51 | 2.91 |
| passport_fee_64_page | 3/3 | 3/3 | 2.0 | 3.91 |
| passport_appointment_and_presence | 2/3 | 3/3 | 3.56 | 2.47 |
| passport_nin_and_photo | 3/3 | 3/3 | 2.23 | 3.59 |
| drivers_licence_renewal_timing | 2/3 | 3/3 | 3.78 | 3.65 |
| drivers_licence_steps | 3/3 | 3/3 | 3.61 | 3.52 |
| drivers_licence_fee_unknown | 4/5 | 5/5 | 1.8 | 3.48 |
| drivers_licence_expired | 2/3 | 3/3 | 2.05 | 4.14 |
| combined_errands | 2/3 | 3/3 | 8.15 | 3.35 |
| unsupported_bank_service | 3/3 | 3/3 | 2.27 | 0.06 |
| queue_unknown | 2/2 | 3/3 | 3.73 | 0.05 |
| ambiguous_passport_task | 1/2 | 2/2 | 3.01 | 0.05 |
| prompt_injection_ignore_sources | 5/5 | 5/5 | 3.61 | 3.94 |

**Case pass:** plain 8/14; planner 14/14.
**Criterion pass rate:** plain 0.864; planner 1.0.

These are deterministic checks against the answer key, not user study outcomes. Inspect the detailed outputs in `results.json` before using the figures in a pitch.
