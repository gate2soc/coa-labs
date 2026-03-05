---
title: "Register File"
---

A **register file** is a set of registers organized as an **addressed array**.

In CPUs, register files typically provide:

- multiple read ports (e.g., read two source operands in the same cycle)
- at least one write port (write back results on a clock edge)
- address selection for choosing which register to read/write

In this section you will build a simplified multi-port register file: **4 registers × 8 bits**, with **two read ports** and **one write port**, and observe its read/write behavior.

## Experiment: 4×8 multi-port register file

### Objectives

- Understand the structure: register array + write decoding + read selection.
- Understand the difference between ports:
  - the write port is clocked (synchronous write)
  - the read ports are address-selected (combinational read)

### Principles

#### 1) Interface

Registers: $R0\ldots R3$, each 8 bits.

Write port:

- $WA[1:0]$: write address
- $WD[7:0]$: write data
- $WE$: write enable
- $CLK$: clock

Two read ports:

- $RA1[1:0] \rightarrow RD1[7:0]$
- $RA2[1:0] \rightarrow RD2[7:0]$

#### 2) Behavior

- Synchronous write: when $WE=1$, on the rising clock edge write $WD$ into $Reg[WA]$.
- Combinational read: $RD1 = Reg[RA1]$, $RD2 = Reg[RA2]$.

#### 3) Implementation idea

- Register array: 4 parallel 8-bit registers ($R0\ldots R3$)
- Write selection: decode $WA$ with a 2-to-4 decoder; AND with $WE$ to form each register’s load/WE
- Read selection: two 4-to-1 MUXes, one for $RD1$, one for $RD2$

### Environment

- Simulator: Logisim Evolution

### Task 1: Build the 4×8 register array and write port

1. Place pins: $WA$, $WD$, $WE$, $CLK$.
2. Place 4 Register components (name them $R0\ldots R3$).
3. Set bit widths: $WA$ is 2 bits; $WD$ and each register are 8 bits.
4. Wire $WD$ to all register inputs; wire $CLK$ to all register clock inputs.
5. Decode write address:
   - place a 2-to-4 decoder for $WA$
   - AND each decoder output with $WE$ and feed to the corresponding register’s enable/write input

### Task 2: Build two read ports

1. Place pins: $RA1$, $RA2$, $RD1$, $RD2$.
2. Set bit widths: $RA1$ and $RA2$ are 2 bits; $RD1$ and $RD2$ are 8-bit outputs.
3. Place two 4-to-1 MUXes (select bits = 2).
4. Connect $R0\ldots R3$ outputs to the data inputs of both MUXes.
5. Wire $RA1$ to MUX1 select and MUX1 output to $RD1$.
6. Wire $RA2$ to MUX2 select and MUX2 output to $RD2$.

<a id="fig-reg-file"></a>

![Register file circuit](/images/chap03/reg_file.png)

*Figure 3.7: 4×8 multi-port register file circuit.*

### Task 3: Verification

Use probes to observe $RD1$ and $RD2$.

- **Case 1: Write and hold**
  - Set $WA=10$ (write $R2$), $WD=0xA5$, $WE=1$.
  - Trigger one rising edge on $CLK$, then set $WE=0$.
  - Change $WD$ to 0xFF and trigger multiple clocks: $R2$ should remain 0xA5.
  - Set $RA1=10$, $RA2=10$ and confirm both reads output 0xA5.

- **Case 2: Two read ports in parallel**
  - Write 0x3C to $R1$ and 0xF0 to $R3$ (each write requires $WE=1$ and a clock edge).
  - Set $RA1=01$, $RA2=11$ and confirm $RD1=0x3C$, $RD2=0xF0$.
  - Without clocking, change $RA2$ (e.g. to 00) and observe $RD2$ changes **immediately**.

- **Case 3: Read/write overlap**
  - Keep $RA1=10$ to continuously read $R2$.
  - Write 0x55 to $R1$ (set $WA=01$, $WD=0x55$, $WE=1$, trigger clock edge).
  - Confirm reading $R2$ remains unchanged; then set $RA2=01$ and confirm $RD2=0x55$.

### Results

- Circuit screenshot (including any extra probes/displays used).
- Verification notes:
  - why writing requires a clock edge
  - why changing $RA1/RA2$ changes $RD1/RD2$ immediately
  - why values do not change when $WE=0$ even if the clock toggles

### Questions

1. If you extend from 4 registers to 8, which key structures must change?
2. If $RA1=WA$ and a write happens in the same cycle, do you observe $RD1$ as the old value or new value? Explain based on your structure (read is combinational; write happens at the edge).

### Extension

- Make $R0$ hard-wired to 0 (always reads 0 regardless of writes).
- Add a global Reset to clear all registers.
- Scale up to $8\times 32$.
