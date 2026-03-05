---
title: "Chapter 3 — Sequential Logic Design"
---

Unlike combinational circuits, **sequential logic circuits** have outputs that depend not only on current inputs, but also on the circuit’s **stored past state**. This ability to “remember” makes sequential logic the foundation for registers, counters, finite state machines (FSMs), and processor control units.

In computer systems, instruction-by-instruction execution, program counter updates, and saving/restoring register contents all rely on stable state storage and orderly state transitions under a **clock signal**.

This chapter focuses on three representative sequential modules:

- **Latches and flip-flops**
- **Register files**
- **Finite state machines (FSMs)**
