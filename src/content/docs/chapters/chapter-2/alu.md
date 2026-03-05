---
title: "Arithmetic Logic Unit (ALU)"
---

The ALU is the core combinational block in a CPU datapath. In this manual, you will build an ALU supporting four operations:

- Two’s-complement add: $A + B$
- Two’s-complement subtract: $A - B$
- Bitwise AND: $A \cdot B$
- Bitwise OR: $A\,|\,B$

Design idea:

- Reuse one adder for both add and subtract.
- Compute arithmetic (add/sub) and logic (and/or) results in parallel.
- Use a multiplexer to select the final output based on an opcode.

## Experiment: Adder/Subtractor

### Objectives

- Understand the two’s-complement identity: $A-B = A + (-B)$.
- Learn how to reuse an adder to implement subtraction.

### Principles

In two’s-complement, negation is $-B = \overline{B} + 1$. Therefore:

$$A - B = A + \overline{B} + 1$$

So if we conditionally invert B and conditionally add 1, we can implement subtraction with the same adder used for addition.

### Environment

- Simulator: Logisim Evolution

### Task 1: Controlled inverter (for B)

Use XOR’s properties:

- $B \oplus 0 = B$
- $B \oplus 1 = \overline{B}$

Let OP=0 mean add, OP=1 mean subtract.

1. Place input pin OP.
2. Place an 8-bit input pin B[7:0] and an 8-bit output pin (call it ~B[7:0] initially).
3. Place an 8-bit XOR gate.
4. Use a bit extender to expand OP (1 bit) to 8 bits, then XOR it with B[7:0].

<a id="fig-controlled-inverter"></a>

![Controlled inverter](/images/chap02/sub-1.png)

*Figure 2.12: Controlled inverter using XOR (OP selects pass-through vs bitwise inversion of B).*

Verify behavior for OP=0 (no inversion) and OP=1 (inversion).

### Task 2: Adder/subtractor

1. Add an 8-bit input A[7:0].
2. Rename the previous ~B output to S[7:0] (the final result) and disconnect it from the XOR output.
3. Place an 8-bit adder component.
4. Wire:
   - adder operand 1 ← A[7:0]
   - adder operand 2 ← (B[7:0] XOR OP)
   - adder $C_{in}$ ← OP

<a id="fig-adder-subtractor"></a>

![Adder/subtractor](/images/chap02/sub-2.png)

*Figure 2.13: Adder/subtractor circuit (reuse one adder for add and subtract via OP).*

Test examples:

- Addition (OP=0):
  - A=00000101 (5), B=00000011 (3) → S=00001000 (8)
  - A=11111100 (-4), B=00000011 (3) → S=11111111 (-1)
- Subtraction (OP=1):
  - A=00001001 (9), B=00000101 (5) → S=00000100 (4)
  - A=00000101 (5), B=00001001 (9) → S=11111100 (-4)

Also compare your results with the unified equation:

$$S = A + (B\oplus OP) + OP$$

### Results

- Circuit screenshots
- Test records: at least 6 cases total
  - ≥3 addition cases (include at least one case involving negative numbers)
  - ≥3 subtraction cases (include at least one case where A < B)
- For each case, record OP, A, B, S in both binary and signed decimal (two’s complement).

### Questions

1. Give a unified expression for S (hint: consider the XOR and $C_{in}$ together). Explain why it becomes $A+B$ when OP=0 and $A-B$ when OP=1.
2. Why should the bit extender use **sign extension**?
3. Can the adder carry-out be used as an overflow indicator?
   - For **unsigned** addition, is $C_{out}$ a correct overflow signal? Why?
   - For **signed** two’s-complement add/sub, is $C_{out}$ still reliable? If not, how do you detect signed overflow?

### Extension

Design and add a signed overflow signal. Provide at least two test cases that overflow (e.g., positive overflow and negative overflow), and explain why the signal should assert.

## Experiment: Arithmetic Logic Unit (ALU)

Build an ALU that supports the four operations above. The key structure is:

- compute all candidate results in parallel
- select one result using a MUX controlled by ALUCtrl

### Inputs and outputs

- Inputs: A[7:0], B[7:0] (interpreted as signed two’s-complement)
- Control: ALUCtrl[1:0]
- Output: Y[7:0]
- Flag: Z (1 if Y == 0)

### Design hints

1. Many gates (including MUXes) can be configured to operate on **multi-bit buses** in Logisim Evolution.
2. Arithmetic and bitwise logic can be computed in parallel.
3. Use a MUX to select the final Y.

### Results

- ALU circuit screenshots:
  - show A[7:0], B[7:0], ALUCtrl[1:0], Y[7:0]
  - clearly show the four parallel result paths and the final MUX selection
  - show how you generate Z (how you detect Y == 0)

- Functional test record (table form):
  - ≥8 test cases covering all four operations (≥2 cases per operation)
  - for each case record: ALUCtrl, A, B, Y (binary), Y (signed decimal), Z
  - include ≥2 cases where Y == 0 to validate Z

Example record table:

| ALUCtrl | A (bin) | B (bin) | Y (bin) | Y (dec) | Z |
|---|---|---|---|---:|---|
| … | … | … | … | … | … |

### Questions

1. Why do ALUs often use “parallel computation + MUX selection”? Discuss hardware reuse, combinational delay, and/or structural clarity.
2. Is the encoding of ALUCtrl unique? Why/why not?

### Extension

- Add a negative flag N (for two’s complement, it’s the MSB: Y[7]).
- Add a signed overflow flag V (consider add vs subtract separately).
- Add a carry/borrow flag C.
- Extend the ALU with an additional operation (XOR, compare, etc.), expanding ALUCtrl width and MUX inputs.
