---
title: "Chapter 6 — Pipeline Analysis (Ripes)"
---

In Chapter 5 you built a complete **single-cycle CPU**. In that model, every instruction completes fetch, decode, execute, memory, and write-back in one clock cycle. The structure is easy to understand, but it has a major performance limitation: **the clock period must be long enough for the slowest instruction**, which limits throughput.

Modern processors improve throughput with **pipelining**: split instruction execution into stages and let multiple instructions advance in parallel in different stages. Ideally, after the pipeline is filled, the CPU can complete **one instruction per cycle**.

Pipelining is not “free”:

- multiple instructions coexist in the CPU at different stages
- pipeline registers are needed between stages
- **hazards** arise from data dependencies and control flow

This chapter uses **Ripes**’ visual pipeline models to observe, analyze, and compare pipeline behavior.
