---
title: "Capacity Expansion (Address Mapping & Chip Select)"
---

Parallel chips widen the word but do not increase addressable capacity. To **increase capacity**, a system must map different address ranges to different modules using **address mapping** and **chip-select (CS)**.

## Address partitioning

A common approach:

- Use high-order address bits to select the memory module (chip select).
- Use low-order bits as the internal address within the selected module.

Only the selected module responds; others remain inactive.

## Experiment: Address mapping and chip select

### Objectives

- Understand how chip select expands address space.
- Generate CS signals from address bits using decoding logic.

### Principles

Partition the address: high bits select the module, low bits index within the module.

### Environment

- Simulator: Logisim Evolution

### Task 1: What goes wrong without chip select?

First, try the **incorrect** wiring:

- Connect multiple RAMs in parallel on address/data/WE.
- No CS.

Observe:

1. When writing one address, do all RAMs get written?
2. When reading, can the shared data bus become undefined/conflicting?

### Task 2: Implement chip select

1. Place two RAMs (`RAM_0`, `RAM_1`), each 8-bit data, 4-bit address (16 locations).
2. Use a 5-bit system address.
3. Split the address into:
   - $A_4$ (MSB): module select
   - $A_{3:0}$: internal address
4. Connect $A_{3:0}$ to both RAMs’ address ports.
5. Generate CS:
   - $CS_0 = \overline{A_4}$
   - $CS_1 = A_4$
6. Connect CS to each RAM’s enable.
7. Connect WE to both RAMs.
8. Connect both RAM data ports to the shared data bus (only the enabled RAM should drive it).

### Results

- Circuit screenshots for Task 1 and Task 2.
- At least two tests covering both address regions ($A_4=0$ and $A_4=1$).
- Explain how the high address bit determines which RAM is selected.

### Questions

1. If you extend to 4 modules, how many address bits are needed for CS?
2. What happens if you use low-order bits for CS instead of high-order bits?
3. Besides CS, what must the data interface guarantee to safely share a bus?

### Extension

Design a memory map for a 16-bit address bus and 8-bit data bus using only 8K×8 RAM chips and 4K×8 ROM chips:

- Lowest 4K addresses: ROM (firmware)
- Next 16K addresses: RAM (data)

Implement it in Logisim Evolution.
