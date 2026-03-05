---
title: "Chapter 9 — I/O Interfaces"
---

So far, the CPU mostly interacted with memory (RAM/ROM). Real systems must interact with the outside world: keyboards, displays, serial links, storage, networks, etc. These rely on **I/O (input/output) interfaces**.

From the CPU’s perspective, the key question is how peripherals participate in the system without breaking the CPU’s execution model.

This chapter covers:

- **Memory-mapped I/O (MMIO)**
- I/O via **polling**
- I/O via **interrupts**
- I/O via **DMA**
