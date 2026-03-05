---
title: "Bit-Width Expansion (Parallel Chips)"
---

In real systems, a single memory chip often provides only a small data width per access (e.g., 4/8/16 bits), while a CPU data bus is typically 32 or 64 bits. A basic solution is **parallel chip organization**: multiple chips share the same address/control signals and together provide the full word width.

## The idea of a rank

A **rank** is a logical group of chips that operate in parallel, sharing address/control signals and collectively providing a full data width.

- If each chip is ×8, then 8 chips can form a 64-bit rank.
- If each chip is ×16, then 4 chips can form a 64-bit rank.

Parallel organization increases **word width**, not the number of addressable words.

## Experiment: Parallel organization of memory chips

### Objectives

- Understand the width limitation of a single chip.
- Build a wider logical memory using parallel RAM blocks.
- Observe that chips in a rank read/write the same address simultaneously.

### Principles

Parallel chips share address/control. Each chip stores/outputs a subset of the word bits; data lines are concatenated logically.

### Environment

- Simulator: Logisim Evolution

### Procedure

1. **Place two RAM blocks**
   - Place two RAMs: `RAM_L` and `RAM_H`.
   - Set each to data bits = 8, address bits = 4.
2. **Share address and write-enable**
   - Place a 4-bit address input pin `ADDR` and connect it to both RAM address ports.
   - Place `WE` and connect to both RAMs.
3. **Split and join the data bus**
   - Place a 16-bit data input (CPU write data).
   - Use a splitter to separate low 8 bits and high 8 bits.
   - Low 8 → `RAM_L` data; high 8 → `RAM_H` data.
   - Join the outputs into a 16-bit read data bus.
4. **Verify**
   - Write 16-bit data (e.g., 0xABCD) to an address.
   - Confirm `RAM_H` stores 0xAB and `RAM_L` stores 0xCD.
   - Read back and confirm the reconstructed 16-bit value matches.
   - Repeat for at least two addresses.

### Results

- Screenshot of the parallel RAM circuit.
- At least two test cases (different addresses and values).
- A brief explanation of how both RAMs participate in one access.

### Questions

1. If you replace two ×8 RAMs with four ×4 RAMs, how do address and data wiring change?
2. Does parallel organization change the number of addressable words? Why?
3. To extend 16-bit to 32-bit, how many ×8 RAMs are needed?
