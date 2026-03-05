---
title: "Pipeline Hazards"
---

Ideal pipelining assumes independent instructions. In real programs, dependencies and branches break this ideal and cause **hazards**.

## Hazard types

- **Structural hazards**: multiple instructions compete for the same hardware resource in one cycle.
- **Data hazards**: a later instruction needs a value produced by an earlier instruction that hasn’t become available yet. The most common is **RAW** (read-after-write).
- **Control hazards**: branches/jumps change PC; instructions fetched on the wrong path must be discarded.

Ripes visualizes stalls and flushes by highlighting inserted `nop` bubbles.

## Ripes control / forwarding / hazard signals

Ripes exposes a set of control signals that help you understand stalls/forwarding/flush behavior.

<a id="fig-ripes-control-signals"></a>

![Control / forwarding / hazard signal lists](/images/chap06/control.png)

*Figure 6.3: Ripes control signals (Control / Forwarding / Hazard units).*

<a id="fig-ripes-forwarding"></a>

![Forwarding unit signals](/images/chap06/forwarding.png)

*Figure 6.4: Forwarding-unit signals.*

<a id="fig-ripes-hazard"></a>

![Hazard unit signals](/images/chap06/hazard.png)

*Figure 6.5: Hazard-unit signals.*

## Experiment: Data hazard — stalls vs forwarding

### Objectives

- Observe RAW data hazards.
- Compare stalling vs forwarding.

### Environment

- Simulator: Ripes
- CPU models:
  - 5-stage w/o forwarding or hazard detection
  - 5-stage w/o forwarding unit
  - 5-stage (with forwarding + hazard detection)

### Principles

ALU results are produced in EX but normally written back in WB. A dependent instruction may read the old value in ID unless the CPU stalls or forwards.

### Task 1: Observe incorrect behavior (no forwarding, no hazard detection)

Program:

```asm
    addi x1, x0, 5      # I1: x1 <- 5
    addi x2, x1, 7      # I2: x2 <- x1 + 7  (RAW on x1)
    sub  x3, x2, x1     # I3: x3 <- x2 - x1
end:
    j    end
```

Run with the no-forwarding/no-hazard model and find the cycle where I2 reads x1 too early.

### Task 2: Stall-only handling (no forwarding)

Switch to the model with hazard detection but no forwarding, reset, and run again. Identify the inserted `nop` bubbles and confirm final values are correct.

### Task 3: Forwarding enabled

Switch to the full 5-stage model with forwarding. Compare with Task 2:

- Are there fewer bubbles?
- Can you see the ALU operand MUX selecting a forwarded value (green dot / value change)?

### Results

- Final register values (`x1`, `x2`, `x3`) under all three models.
- Cycle counts under all three models with a brief explanation.

### Questions

1. In this RAW pattern, where is I1’s result produced earliest, and when is it written back latest?
2. How many stall cycles occur in the stall-only model?
3. In the forwarding model, which pipeline register provides the forwarded operand to I2?
4. If you change I2 to a load (`lw x2, 0(x1)`) followed by `add x3, x2, x0`, can forwarding fully eliminate stalls? Why?

## Experiment: Control hazard — branch decision and flush

### Objectives

- Observe control hazards caused by branches.
- Understand where the branch is resolved and how flushes occur.

### Environment

- Simulator: Ripes
- CPU model: 5-stage Processor

### Principles

Branches are usually resolved in EX (or later). IF continues fetching before the decision is known. If the branch is taken, wrong-path instructions must be **flushed** (turned into `nop`s), costing cycles.

### Task 1: Create a taken branch and observe flush

```asm
  addi x1, x0, 1
  beq  x1, x1, L1     # taken branch
  addi x10, x0, 111   # wrong path
  addi x11, x0, 222   # wrong path
L1:
  addi x12, x0, 333   # target
end:
  j    end
```

Step and observe when `nop` bubbles appear. Verify that x10/x11 are not written, and x12 becomes 333.

### Task 2: Quantify branch penalty

- Use the **stage table** to count how many wrong-path instructions are flushed.
- Compare CPI/IPC with and without the branch (replace branch with a no-op like `addi x0,x0,0`).

### Results

- Key signal observations around the branch (branch control, compare result, PC selection, hazard signals).
- CPI/IPC with and without the branch.
- A summary of branch penalty in terms of inserted `nop`s and performance impact.
