---
title: "Summary"
---

This chapter guided you through designing and implementing a **single-cycle CPU** by building modules, wiring a datapath, designing a control unit, and validating the full system with assembly programs.

You should now understand:

- The single-cycle execution model: fetch → decode → execute → memory → write-back in one cycle.
- How datapath components (register file, ALU, memory, MUXes) are connected and how data flows.
- How the control unit decodes instruction fields into control signals to coordinate datapath behavior within one cycle.
- How to debug end-to-end by observing control/data signals and tracing incorrect results back to datapath/control mistakes.

A single-cycle CPU is not performance-optimal, but it is structurally clear and timing-simple—ideal for learning. In the next chapter we will introduce pipelining concepts (often via visual models) and the new hazards that arise.
