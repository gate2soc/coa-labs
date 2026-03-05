---
title: "Summary"
---

This chapter introduced **pipelining** as a core technique to improve instruction throughput by overlapping stages of multiple instructions.

Key takeaways:

- A pipeline increases throughput but adds hardware/control complexity.
- Pipeline registers must preserve intermediate state between stages.
- Dependencies and branches introduce **hazards** that break ideal parallelism.
- Common remedies are **stalling**, **forwarding**, and **flushing**.

Using Ripes’ visual 5-stage model, you should be able to:

- Understand the overall structure and flow of a pipelined processor.
- Explain the performance advantage and its costs compared to a single-cycle CPU.
- Recognize typical data/control hazards and the basic strategies to handle them.
