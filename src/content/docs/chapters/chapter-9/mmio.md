---
title: "Memory-Mapped I/O (MMIO)"
---

There are two broad architectural approaches to CPU–device access:

1. Separate I/O space with special I/O instructions
2. **Memory-mapped I/O (MMIO)**: map device registers into the normal address space so the CPU uses ordinary load/store

RISC-V commonly uses MMIO.

In MMIO, the CPU simply reads/writes an address; hardware address decoding decides whether that access goes to RAM/ROM or to a device register.

<a id="fig-mmio-soc"></a>

![Example SoC address map](/images/chap09/mmio-soc.png)

*Figure 9.1: Example system address partitioning (RAM/ROM ranges and an MMIO range for devices).*

A key behavioral difference:

- Memory reads/writes primarily **store/retrieve data**.
- MMIO reads/writes often **trigger device behavior** or **query device state**.

So repeated reads may change over time, and writes may have immediate side effects.
