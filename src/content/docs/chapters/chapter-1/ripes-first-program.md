---
title: "Running Your First Program in Ripes"
---

## Experiment: Observing instruction execution in Ripes

### Objectives

- Learn basic Ripes usage.
- Observe how registers change during instruction execution.
- Build an intuitive link between instructions and hardware behavior.

### Principles

This experiment is based on the RISC-V ISA and uses a visual processor model to observe instruction execution.

### Environment

- Simulator: **Ripes**
- CPU model: **Single-Cycle Processor**

### Task: Step through an example program and observe registers

The following simple RISC-V assembly program adds two numbers:

```asm
addi x1, x0, 5   # x1 = 5
addi x2, x0, 7   # x2 = 7
add  x3, x1, x2  # x3 = x1 + x2
```

Steps:

1. Open Ripes and select **Single-Cycle Processor** as the CPU model.
2. Create a new program (or clear the editor) and paste the code above into the code editor.
3. Use single-step execution and observe how registers `x1`, `x2`, and `x3` change.

### Results

- A screenshot of the running program (including the registers window).
- Briefly explain how each instruction affects the register state.
- Verify whether the final result matches the program logic.

### Question

- If you switch the CPU model to a multi-cycle or pipelined model, how does the timing of register updates change?
