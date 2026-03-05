---
title: "Chapter 2 — Combinational Logic Design"
---

Combinational logic circuits are the most basic building blocks of digital systems. Their outputs depend **only on the current inputs**, not on any past state.

In computer organization and architecture, combinational logic is widely used for data selection, address decoding, and arithmetic/logic operations. This chapter focuses on three representative modules:

- **Multiplexers and decoders**
- **Adders**
- **Arithmetic Logic Units (ALUs)**

## Multiplexers and Decoders

### Multiplexers

A multiplexer (MUX) is a combinational circuit that **selects one of multiple inputs** to drive a single output, based on control (select) signals. Common types include 2-to-1, 4-to-1, and 8-to-1 multiplexers.

For a **2-to-1 MUX**, the behavior is:

- If select signal **S = 0**, output **Y = D0**
- If select signal **S = 1**, output **Y = D1**

So the logic equation is:

$$Y = \overline{S}\cdot D_0 + S\cdot D_1$$

![2-to-1 multiplexer](/images/chap02/mux2.png)

In general, if the number of select bits is **n**, the number of input lines is **2^n**, e.g.:

| MUX type | Inputs | Select bits |
|---|---:|---:|
| 2-to-1 | 2 | 1 |
| 4-to-1 | 4 | 2 |
| 8-to-1 | 8 | 3 |

Multiplexers are used everywhere in CPU datapaths, such as:

- selecting between data sources
- selecting register write-back values
- selecting ALU operands
- selecting program counter (PC) update paths

In CPU design, MUX selection is typically driven by control signals from the control unit, enabling a clean separation between **control flow** and **data flow**.

### Decoders

A decoder does the “opposite” of a multiplexer: it converts a binary-encoded input into a **one-hot** output (exactly one output line is asserted). A typical decoder has **n** input lines and **2^n** output lines.

For a **2-to-4 decoder**:

- inputs: A1 A0 (2 bits)
- outputs: Y0 … Y3
- only one output is active at a time (here, active-high)

| A1 | A0 | Y0 | Y1 | Y2 | Y3 |
|---|---|---|---|---|---|
| 0 | 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 | 0 | 1 |

Decoders are commonly used for:

- memory address decoding
- instruction opcode decoding
- register selection

In a CPU control unit, decoders are an important component that translates **instruction bit patterns** into specific control signals.

### Experiment: Multiplexer and Decoder (Gate-Level Implementation)

#### Objectives

- Understand MUX/decoder functionality and how to describe them with truth tables.
- Use Logisim Evolution to build and verify a **4-to-1 MUX** and a **2-to-4 decoder**.

#### Environment

- Simulator: Logisim Evolution

#### Principles

A 4-to-1 MUX selects one of D0…D3 based on select bits (S1,S0):

$$
Y = \overline{S_1}\,\overline{S_0}D_0 + \overline{S_1}S_0D_1 + S_1\,\overline{S_0}D_2 + S_1S_0D_3
$$

A 2-to-4 decoder maps (A1,A0) to one-hot outputs:

$$
\begin{aligned}
Y_0 &= \overline{A_1}\,\overline{A_0} \\
Y_1 &= \overline{A_1}A_0 \\
Y_2 &= A_1\,\overline{A_0} \\
Y_3 &= A_1A_0
\end{aligned}
$$

#### Requirements

All circuits in this experiment must be built **only with basic gates** (do not use prebuilt MUX/decoder components).

#### Task 1: Build a 4-to-1 MUX using gates

1. **Place inputs/outputs**
   - Place 6 input pins and label them: D0, D1, D2, D3, S0, S1.
   - Place 1 output pin labeled **Y**.
2. **Generate inverted select signals**
   - Place two NOT gates to generate \(\overline{S_0}\) and \(\overline{S_1}\).
3. **Build the four selection paths**
   - Place four AND gates and set each to **3 inputs**.
   - Label the AND outputs as T0…T3.
   - Wire each AND gate according to the table below.
4. **OR together the paths**
   - Place one OR gate with **4 inputs**.
   - OR T0…T3 together to produce **Y**.

![4-to-1 MUX circuit](/images/chap02/mux-1.png)

Selection-path wiring reference:

| Path | Data input | Select condition | Meaning |
|---|---|---|---|
| T0 | D0 | \(\overline{S_1}\,\overline{S_0}\) | select D0 when S1S0 = 00 |
| T1 | D1 | \(\overline{S_1}S_0\) | select D1 when S1S0 = 01 |
| T2 | D2 | \(S_1\overline{S_0}\) | select D2 when S1S0 = 10 |
| T3 | D3 | \(S_1S_0\) | select D3 when S1S0 = 11 |

5. **Verify by truth table**
   - Fix inputs (example): D0=0, D1=1, D2=0, D3=1.
   - Set (S1,S0) to 00, 01, 10, 11 and confirm Y matches D0, D1, D2, D3.
   - Change D0…D3 and repeat.

#### Task 2: Build a 2-to-4 decoder using gates

1. **Place inputs/outputs**
   - Place input pins A0 and A1.
   - Place output pins Y0, Y1, Y2, Y3 (set them as outputs).
2. **Generate inverted inputs**
   - Use two NOT gates to generate \(\overline{A_0}\) and \(\overline{A_1}\).
3. **Build the four output paths**
   - Place four AND gates.
   - Wire each AND gate according to the table below.
4. **Connect outputs**
   - Connect each AND output to Y0…Y3.

![2-to-4 decoder circuit](/images/chap02/mux-2.png)

Output-path wiring reference:

| Output | AND inputs | Input combination | Meaning |
|---|---|---|---|
| Y0 | \(\overline{A_1},\overline{A_0}\) | A1A0 = 00 | assert Y0 |
| Y1 | \(\overline{A_1},A_0\) | A1A0 = 01 | assert Y1 |
| Y2 | \(A_1,\overline{A_0}\) | A1A0 = 10 | assert Y2 |
| Y3 | \(A_1,A_0\) | A1A0 = 11 | assert Y3 |

5. **Verify by truth table**
   - Test inputs 00, 01, 10, 11.
   - Confirm exactly one of Y0…Y3 is 1 each time.

#### Results

- 4-to-1 MUX: circuit screenshot + test screenshots proving Y = D0/D1/D2/D3 for S1S0 = 00/01/10/11.
- 2-to-4 decoder: test screenshots proving one-hot outputs.

#### Extension

Implement a NAND function using **only multiplexers**:

- Target: \(F = \overline{A \cdot B}\)
- Constraints: do **not** build a NAND by chaining an AND + NOT; you may use constant 0/1 sources.
- Hint: for a 2-to-1 MUX, \(Y = \overline{S}D_0 + SD_1\). Try using **B** as **S**, and choose D0/D1 based on the NAND truth table.

## Adders

Addition is one of the most fundamental operations in computers. Integer arithmetic, address calculation, and even multiplication/division ultimately rely on adders. In CPU datapaths, adders are core components inside the ALU.

### Half adder

A **half adder** adds two 1-bit numbers without a carry-in.

- Sum: \(S = A \oplus B\)
- Carry: \(C = A \cdot B\)

Truth table:

| A | B | S | C |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

Symbol:

![Half adder symbol](/images/chap02/bit-adder.png)

A half adder cannot directly build multi-bit addition because it lacks a carry-in input, so we need a **full adder**.

### Full adder

A **full adder** adds A and B with a carry-in \(C_{in}\):

- Sum: \(S = A \oplus B \oplus C_{in}\)
- Carry-out:

$$C_{out} = A\cdot B + A\cdot C_{in} + B\cdot C_{in}$$

Symbols / construction idea:

- Full adder symbol: ![Full adder symbol](/images/chap02/full-adder.png)
- Built from two half adders + one OR gate: ![Full adder from half adders](/images/chap02/full-adder-comp.png)

### Ripple-carry adder

Chaining \(n\) full adders forms an \(n\)-bit adder. The carry-out of each bit feeds the next bit’s carry-in. With \(C_{in}=0\) at the least significant bit, this is a **ripple-carry adder**.

![4-bit ripple-carry adder](/images/chap02/ripple-adder.png)

Ripple-carry adders are simple and great for teaching, but carry propagation makes delay grow roughly linearly with bit width, so modern CPUs use faster adder designs.

### Experiment: Hierarchical adder design

#### Objectives

- Build a 1-bit half adder using gates.
- Build a 1-bit full adder in a modular (hierarchical) way.
- Build a 4-bit ripple-carry adder from full adders and observe carry propagation.

#### Environment

- Simulator: Logisim Evolution

#### Task 1: Gate-level 1-bit half adder

1. Place input pins A and B.
2. Place output pins S and C.
3. Build \(S = A\oplus B\) with one XOR gate.
4. Build \(C = A\cdot B\) with one AND gate.

![1-bit half adder circuit](/images/chap02/adder-1.png)

Test (A,B) = 00, 01, 10, 11 and confirm (S,C) matches the truth table.

#### Task 2: 1-bit full adder (modular)

1. Rename the current circuit to **HalfAdder**.

![Rename circuit](/images/chap02/circuit-name.png)

2. Create a new circuit named **FullAdder** and set it as the main circuit.
3. Place inputs A, B, and \(C_{in}\); place outputs S and \(C_{out}\).
4. Place **two HalfAdder** subcircuits.
   - First HalfAdder: inputs A, B; outputs \(S_1\), \(C_1\)
   - Second HalfAdder: inputs \(S_1\), \(C_{in}\); outputs S, \(C_2\)
5. Use an OR gate to compute \(C_{out} = C_1 + C_2\).

![1-bit full adder circuit](/images/chap02/adder-2.png)

Test all combinations (A,B,\(C_{in}\)) from 000 to 111.

#### Task 3: 4-bit ripple-carry adder

1. Create a new main circuit named **RippleAdder4**.
2. Place 4-bit inputs A[3:0], B[3:0] and 1-bit input \(C_{in}\).
3. Place 4-bit output S[3:0] and 1-bit output \(C_{out}\).
4. Use splitters to break out bits A0…A3, B0…B3, S0…S3.
5. Place four FullAdder blocks and chain their carries.

![4-bit ripple-carry adder circuit](/images/chap02/adder-3.png)

Functional checks (example test vectors):

- No carry chain: A=0010, B=0001 → S=0011, \(C_{out}=0\)
- Multi-bit carry: A=1111, B=0001 → S=0000, \(C_{out}=1\)
- Random vectors: verify against hand calculation

Observe carry propagation using an input that causes a continuous carry chain.

#### Results

- Half adder: circuit screenshot + truth table test screenshot.
- Full adder: circuit screenshot + test screenshots for 000…111.
- RippleAdder4: circuit screenshot + screenshots for at least 3 test cases + a screenshot showing carry propagation.

#### Extension

- Package RippleAdder4 and extend it to an 8-bit adder; discuss delay impact of longer carry chains.
- How would you generate an overflow signal?

## Arithmetic Logic Unit (ALU)

The ALU is the core combinational block in a CPU datapath. In this manual, you will build an ALU supporting four operations:

- Two’s-complement add: \(A + B\)
- Two’s-complement subtract: \(A - B\)
- Bitwise AND: \(A \cdot B\)
- Bitwise OR: \(A\,|\,B\)

Design idea:

- Reuse one adder for both add and subtract.
- Compute arithmetic (add/sub) and logic (and/or) results in parallel.
- Use a multiplexer to select the final output based on an opcode.

### Experiment: Adder/Subtractor

#### Objectives

- Understand the two’s-complement identity: \(A-B = A + (-B)\).
- Learn how to reuse an adder to implement subtraction.

#### Principles

In two’s-complement, negation is \(-B = \overline{B} + 1\). Therefore:

$$A - B = A + \overline{B} + 1$$

So if we conditionally invert B and conditionally add 1, we can implement subtraction with the same adder used for addition.

#### Environment

- Simulator: Logisim Evolution

#### Task 1: Controlled inverter (for B)

Use XOR’s properties:

- \(B \oplus 0 = B\)
- \(B \oplus 1 = \overline{B}\)

Let OP=0 mean add, OP=1 mean subtract.

1. Place input pin OP.
2. Place an 8-bit input pin B[7:0] and an 8-bit output pin (call it ~B[7:0] initially).
3. Place an 8-bit XOR gate.
4. Use a bit extender to expand OP (1 bit) to 8 bits, then XOR it with B[7:0].

![Controlled inverter](/images/chap02/sub-1.png)

Verify behavior for OP=0 (no inversion) and OP=1 (inversion).

#### Task 2: Adder/subtractor

1. Add an 8-bit input A[7:0].
2. Rename the previous ~B output to S[7:0] (the final result) and disconnect it from the XOR output.
3. Place an 8-bit adder component.
4. Wire:
   - adder operand 1 ← A[7:0]
   - adder operand 2 ← (B[7:0] XOR OP)
   - adder \(C_{in}\) ← OP

![Adder/subtractor](/images/chap02/sub-2.png)

Test examples:

- Addition (OP=0):
  - A=00000101 (5), B=00000011 (3) → S=00001000 (8)
  - A=11111100 (-4), B=00000011 (3) → S=11111111 (-1)
- Subtraction (OP=1):
  - A=00001001 (9), B=00000101 (5) → S=00000100 (4)
  - A=00000101 (5), B=00001001 (9) → S=11111100 (-4)

Also compare your results with the unified equation:

$$S = A + (B\oplus OP) + OP$$

#### Results

- Circuit screenshots
- Test records: at least 6 cases total
  - ≥3 addition cases (include at least one case involving negative numbers)
  - ≥3 subtraction cases (include at least one case where A < B)
- For each case, record OP, A, B, S in both binary and signed decimal (two’s complement).

#### Questions

1. Give a unified expression for S (hint: consider the XOR and \(C_{in}\) together). Explain why it becomes \(A+B\) when OP=0 and \(A-B\) when OP=1.
2. Why should the bit extender use **sign extension**?
3. Can the adder carry-out be used as an overflow indicator?
   - For **unsigned** addition, is \(C_{out}\) a correct overflow signal? Why?
   - For **signed** two’s-complement add/sub, is \(C_{out}\) still reliable? If not, how do you detect signed overflow?

#### Extension

Design and add a signed overflow signal. Provide at least two test cases that overflow (e.g., positive overflow and negative overflow), and explain why the signal should assert.

### Experiment: Arithmetic Logic Unit (ALU)

Build an ALU that supports the four operations above. The key structure is:

- compute all candidate results in parallel
- select one result using a MUX controlled by ALUCtrl

#### Inputs and outputs

- Inputs: A[7:0], B[7:0] (interpreted as signed two’s-complement)
- Control: ALUCtrl[1:0]
- Output: Y[7:0]
- Flag: Z (1 if Y == 0)

#### Design hints

1. Many gates (including MUXes) can be configured to operate on **multi-bit buses** in Logisim Evolution.
2. Arithmetic and bitwise logic can be computed in parallel.
3. Use a MUX to select the final Y.

#### Results

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

#### Questions

1. Why do ALUs often use “parallel computation + MUX selection”? Discuss hardware reuse, combinational delay, and/or structural clarity.
2. Is the encoding of ALUCtrl unique? Why/why not?

#### Extension

- Add a negative flag N (for two’s complement, it’s the MSB: Y[7]).
- Add a signed overflow flag V (consider add vs subtract separately).
- Add a carry/borrow flag C.
- Extend the ALU with an additional operation (XOR, compare, etc.), expanding ALUCtrl width and MUX inputs.

## Summary

This chapter developed the core ideas of **combinational logic design** through analysis and experiments on multiplexers/decoders, adders, and an ALU:

- Combinational outputs depend only on current inputs.
- Complex functions can be built hierarchically from basic gates.
- Data selection, arithmetic, and logic operations are fundamental datapath behaviors.

In the next chapter, we will introduce **sequential logic** (latches, flip-flops, registers) and study clocked state holding and updates, including a finite state machine experiment.
