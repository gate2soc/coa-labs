---
title: "Building Your First Circuit in Logisim Evolution"
---

## Experiment: Two-Input AND Gate

### Objectives

- Become familiar with basic Logisim Evolution operations.
- Learn how to use input pins, logic gates, and output pins.

### Principles

A two-input AND gate is one of the most basic combinational logic devices. Its behavior is:

- The output is **1 if and only if** all inputs are 1.

Let inputs be **A** and **B**, and output be **Y**. The logic expression is:

- $Y = A \cdot B$

### Task: Build and verify a two-input AND gate

1. **Prepare input and output pins**
   1. In the **Wiring** category, place two **Pin** components. In the properties panel (or using the text tool), name them **A** and **B**.
   2. Place one more **Pin**, name it **Y**, and set its **Type** to **Output** in the properties panel.
2. **Place the AND gate**
   1. In the **Gates** category, place one **AND gate**.
3. **Wire the circuit**
   1. Connect inputs **A** and **B** to the two inputs of the AND gate.
   2. Connect the AND gate output to **Y**.
4. **Verify functionality**
   1. Click pins **A** and **B** to cycle through input combinations: (A,B) = 00, 01, 10, 11.
   2. Observe how output **Y** changes.

### Results

- A full screenshot of your completed AND-gate circuit.
- Complete the experiment record table below.

| A | B | Y |
|---|---|---|
| 0 | 0 |   |
| 0 | 1 |   |
| 1 | 0 |   |
| 1 | 1 |   |

### Questions

1. If you replace the AND gate with an OR gate, how does the output logic change?
2. Does this circuit have “memory” (i.e., can it keep a previous output state after the inputs change)? Why?
