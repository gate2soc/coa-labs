---
title: "Five-Stage Pipeline"
---

Ripes provides a classic **five-stage pipeline** model:

- **IF**: Instruction Fetch
- **ID**: Instruction Decode / Register Fetch
- **EX**: Execute / Address Calculation
- **MEM**: Memory Access
- **WB**: Write Back

Even though one instruction still needs all five stages to complete, pipeline stages overlap across cycles so multiple instructions progress in parallel.

## Experiment: Basic execution in a five-stage pipeline

### Objectives

- Get familiar with the 5-stage pipeline model in Ripes.
- Understand what each stage does.
- Observe multiple instructions flowing through the pipeline.
- Recognize pipeline fill and drain behavior.

### Environment

- Simulator: Ripes
- CPU model: **5-stage Processor w/o Forwarding or Hazard Detection** (no forwarding, no hazard detection)

### Principles

To focus on “flow” rather than hazards, we use a program with no data dependencies and a deterministic stop loop.

### Task 1: Load a no-hazard program and observe pipeline fill

Use the following program:

```asm
    # Independent initializations to avoid RAW hazards
    addi x10, x0, 10    # A
    addi x11, x0, 20    # B
    addi x12, x0, 30    # C
    addi x13, x0, 40    # D

    # Independent operations
    add  x14, x0, x0    # E
    sub  x15, x10, x0   # F (x10 will have been written back)

end:
    j end
```

1. Select processor model: **5-stage Processor w/o Forwarding or Hazard Detection**.
2. Click **Clock** repeatedly.
3. Observe the fill process:
   - Cycle 1: A in IF
   - Cycle 2: A in ID, B in IF
   - Cycle 3: A in EX, B in ID, C in IF
   - Cycle 4: A in MEM, B in EX, C in ID, D in IF
   - Cycle 5: A in WB; the pipeline is fully filled

### Task 2: Pipeline registers and MEM behavior

While stepping:

1. Watch the pipeline registers (IF/ID, ID/EX, EX/MEM, MEM/WB). What gets latched each cycle (instruction bits, PC, immediate, control signals, operands, etc.)?
2. When `ADDI` is in MEM, does it actually access data memory (do memory read/write signals toggle)?
3. In which cycle does instruction A complete write-back?

### Results

- Screenshot of the pipeline when it is first fully filled, annotating which instruction (A–F) is in IF/ID/EX/MEM/WB.
- A “stage–cycle” table for at least 10 cycles.

<a id="tab-pipe-timetable-nohazard"></a>

| Cycle | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---:|---|---|---|---|---|---|---|---|---|---|
| IF | A | B | C | D | E | F | … | … | … | … |
| ID |   | A | B | C | D | E | … | … | … | … |
| EX |   |   | A | B | C | D | … | … | … | … |
| MEM |  |   |   | A | B | C | … | … | … | … |
| WB |   |   |   |   | A | B | … | … | … | … |

*Table 6.2: Example format for a pipeline stage table (fill based on your observation).*

### Questions

1. **Latency vs throughput**: an instruction takes 5 stages of latency, but once filled, ideally one instruction completes every how many cycles?
2. **Resource conflicts**: why can IF (instruction fetch) and MEM (data access) happen in the same cycle in this model? (Harvard vs von Neumann memory organization.)
3. **Why go through MEM**: `ADDI` doesn’t need data memory—why does it still pass through MEM? What would break if it “skipped” MEM?
