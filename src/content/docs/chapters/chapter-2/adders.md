---
title: "Adders"
---

Addition is one of the most fundamental operations in computers. Integer arithmetic, address calculation, and even multiplication/division ultimately rely on adders. In CPU datapaths, adders are core components inside the ALU.

## Half adder

A **half adder** adds two 1-bit numbers without a carry-in.

- Sum: $S = A \oplus B$
- Carry: $C = A \cdot B$

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

## Full adder

A **full adder** adds A and B with a carry-in $C_{in}$:

- Sum: $S = A \oplus B \oplus C_{in}$
- Carry-out:

$$C_{out} = A\cdot B + A\cdot C_{in} + B\cdot C_{in}$$

Symbols / construction idea:

- Full adder symbol: ![Full adder symbol](/images/chap02/full-adder.png)
- Built from two half adders + one OR gate: ![Full adder from half adders](/images/chap02/full-adder-comp.png)

## Ripple-carry adder

Chaining $n$ full adders forms an $n$-bit adder. The carry-out of each bit feeds the next bit’s carry-in. With $C_{in}=0$ at the least significant bit, this is a **ripple-carry adder**.

![4-bit ripple-carry adder](/images/chap02/ripple-adder.png)

Ripple-carry adders are simple and great for teaching, but carry propagation makes delay grow roughly linearly with bit width, so modern CPUs use faster adder designs.

## Experiment: Hierarchical adder design

## Objectives

- Build a 1-bit half adder using gates.
- Build a 1-bit full adder in a modular (hierarchical) way.
- Build a 4-bit ripple-carry adder from full adders and observe carry propagation.

## Environment

- Simulator: Logisim Evolution

## Task 1: Gate-level 1-bit half adder

1. Place input pins A and B.
2. Place output pins S and C.
3. Build $S = A\oplus B$ with one XOR gate.
4. Build $C = A\cdot B$ with one AND gate.

![1-bit half adder circuit](/images/chap02/adder-1.png)

Test (A,B) = 00, 01, 10, 11 and confirm (S,C) matches the truth table.

## Task 2: 1-bit full adder (modular)

1. Rename the current circuit to **HalfAdder**.

![Rename circuit](/images/chap02/circuit-name.png)

2. Create a new circuit named **FullAdder** and set it as the main circuit.
3. Place inputs A, B, and $C_{in}$; place outputs S and $C_{out}$.
4. Place **two HalfAdder** subcircuits.
   - First HalfAdder: inputs A, B; outputs $S_1$, $C_1$
   - Second HalfAdder: inputs $S_1$, $C_{in}$; outputs S, $C_2$
5. Use an OR gate to compute $C_{out} = C_1 + C_2$.

![1-bit full adder circuit](/images/chap02/adder-2.png)

Test all combinations (A,B,$C_{in}$) from 000 to 111.

## Task 3: 4-bit ripple-carry adder

1. Create a new main circuit named **RippleAdder4**.
2. Place 4-bit inputs A[3:0], B[3:0] and 1-bit input $C_{in}$.
3. Place 4-bit output S[3:0] and 1-bit output $C_{out}$.
4. Use splitters to break out bits A0…A3, B0…B3, S0…S3.
5. Place four FullAdder blocks and chain their carries.

![4-bit ripple-carry adder circuit](/images/chap02/adder-3.png)

Functional checks (example test vectors):

- No carry chain: A=0010, B=0001 → S=0011, $C_{out}=0$
- Multi-bit carry: A=1111, B=0001 → S=0000, $C_{out}=1$
- Random vectors: verify against hand calculation

Observe carry propagation using an input that causes a continuous carry chain.

## Results

- Half adder: circuit screenshot + truth table test screenshot.
- Full adder: circuit screenshot + test screenshots for 000…111.
- RippleAdder4: circuit screenshot + screenshots for at least 3 test cases + a screenshot showing carry propagation.

## Extension

- Package RippleAdder4 and extend it to an 8-bit adder; discuss delay impact of longer carry chains.
- How would you generate an overflow signal?
