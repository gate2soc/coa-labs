---
title: "Hamming Code (ECC)"
---

As memory systems scale up, bit errors (e.g., due to radiation or electrical noise) become non-negligible. Reliability can be improved by storing **redundant check bits** alongside data to detect and sometimes correct errors.

## Parity check

Parity adds 1 bit so the total number of 1s satisfies an even/odd constraint. For even parity on data $D_{n-1}\ldots D_0$:

$$P = D_{n-1} \oplus D_{n-2} \oplus \cdots \oplus D_0$$

Parity is simple, but:

- it detects only odd-number-of-bit flips
- it cannot locate or correct errors

## Hamming code

Hamming codes can **locate and correct single-bit errors**.

For $k$ data bits and $r$ parity bits, a Hamming code needs:

$$2^r \ge k + r + 1$$

A classic example is **Hamming(7,4)**: 4 data bits + 3 parity bits.

Parity bits are placed at positions $1,2,4$ (powers of two). Data fills the remaining positions:

<a id="tab-hamming74"></a>

| Position | Type | Binary index | Covered by |
|---:|---|---|---|
| 1 | $P_1$ | 001 | positions with LSB=1: (1,3,5,7) |
| 2 | $P_2$ | 010 | positions with middle bit=1: (2,3,6,7) |
| 3 | $D_1$ | 011 |  |
| 4 | $P_3$ | 100 | positions with MSB=1: (4,5,6,7) |
| 5 | $D_2$ | 101 |  |
| 6 | $D_3$ | 110 |  |
| 7 | $D_4$ | 111 |  |

*Table 7.1: Bit meanings and parity coverage for Hamming(7,4).*

With even parity:

- $P_1 = D_1 \oplus D_2 \oplus D_4$
- $P_2 = D_1 \oplus D_3 \oplus D_4$
- $P_3 = D_2 \oplus D_3 \oplus D_4$

On read, compute syndrome $S=S_3S_2S_1$ from received bits (primes denote received):

- $S_1 = P'_1 \oplus D'_1 \oplus D'_2 \oplus D'_4$
- $S_2 = P'_2 \oplus D'_1 \oplus D'_3 \oplus D'_4$
- $S_3 = P'_3 \oplus D'_2 \oplus D'_3 \oplus D'_4$

If $S=000$, no error. Otherwise, the binary value of $S$ indicates the **bit position** (1–7) that flipped.

## Experiment: Hamming code detection and correction

### Objectives

- Understand redundancy via parity bits.
- Implement Hamming(7,4) encoding and syndrome checking.
- Verify single-bit error correction in a circuit.

### Principles

Encode: compute parity bits and assemble the 7-bit codeword. Decode: compute syndrome, locate the error, and flip the indicated bit.

### Environment

- Simulator: Logisim Evolution

### Task 1: Build a Hamming(7,4) encoder

- Inputs: $D_1\ldots D_4$
- Outputs: $C_1\ldots C_7$ (7-bit codeword)
- Use XOR gates to generate $P_1\ldots P_3$ and assemble bits by position (1…7).

### Task 2: Build a single-bit error injector

Use XOR properties: $A\oplus 0=A$, $A\oplus 1=\overline{A}$.

- Split the 7-bit codeword into 7 wires.
- Put an XOR gate on each bit.
- Drive the second XOR input with a control pin (0 = no flip, 1 = flip).

### Task 3: Syndrome computation and correction

- Recompute $S_1\ldots S_3$ from the injected word.
- Use a 3-to-8 decoder to decode $S$:
  - output 0 means “no error”
  - outputs 1–7 indicate which bit flipped
- Use another set of XOR gates to flip the indicated bit back.
- Extract corrected data bits $D_1\ldots D_4$ as final outputs.

### Results

- Circuit screenshots (encoder + injector + corrector).
- Demonstrate correction of an injected error at bit position 6.
- Briefly analyze what happens for a double-bit error and why miscorrection can occur.

### Questions

1. If parity bit $P_1$ flips (bit 1 error), can the circuit correct it? Is that correction meaningful in practice?
2. SECDED (single error correction, double error detection) is common in servers. How many additional check bits are needed beyond Hamming(7,4) to detect double-bit errors?
