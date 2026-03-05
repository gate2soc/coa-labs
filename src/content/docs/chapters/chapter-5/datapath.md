---
title: "Datapath Construction"
---

In a single-cycle CPU, the **datapath** describes how data flows through modules (PC, instruction memory, register file, ALU, data memory, multiplexers) during instruction execution. The datapath is relatively stable; control signals select which routes are active.

In this stage you will **not** fully automate control yet. You will manually fix or drive control signals and build up the datapath incrementally.

## Experiment: Build the datapath for `ADDI`

### Objectives

- Understand data flow between PC, instruction decode, ALU, and register file.
- Understand how `ADDI` executes on the datapath.
- Build a minimal working single-cycle datapath that can execute `ADDI` with sequential fetch.

### Principles

- `ADDI` (I-type) semantics: $reg[rd] \leftarrow reg[rs1] + imm$ (12-bit signed immediate sign-extended to 32 bits).
- Single-cycle: fetch/decode/execute/write-back all within one cycle; state updates at the rising edge.
- Minimal assumptions for this stage:
  - no branches/jumps/memory
  - PC always increments: $PC_{next}=PC+4$
  - ALU only needs add

### Environment

- Simulator: Logisim Evolution

### Task 1: PC increment and instruction fetch path

1. Place a 32-bit register named **PC**.
2. Place a 32-bit adder.
3. Place a 32-bit constant **4**.
4. Place a 32-bit ROM as instruction memory (e.g., address bits = 10).
5. Wire PC + 4 back into PC input.
6. Because Logisim memories are word-addressed (here 32-bit words), use a splitter to feed PC[11:2] into the ROM address.

<a id="fig-datapath-pc"></a>

![PC increment and instruction fetch datapath](/images/chap05/data-path-pc.png)

*Figure 5.1: PC increment and instruction fetch path.*

Verify PC increments by 4 each clock edge and the ROM output changes with PC.

### Task 2: Instruction field decode and immediate generation

1. Use a splitter to extract:
   - `rd = inst[11:7]`
   - `rs1 = inst[19:15]`
   - `imm12 = inst[31:20]`
2. Use a bit extender to sign-extend 12 → 32 bits to form `imm32`.

### Task 3: Import ALU and register file

- Reuse your ALU from the earlier ALU lab as a subcircuit (or recreate it).
- Change datapath widths to 32 bits.
- Import/place the provided `reg_file.circ` and place ALU + RegFile in the main circuit.

<a id="fig-datapath-alu"></a>

![32-bit ALU (example)](/images/chap05/alu.png)

*Figure 5.2: Example 32-bit ALU circuit.*

### Task 4: Wire the `ADDI` datapath

1. Connect `rs1` to RegFile `RA1`, and RegFile `RD1` to ALU SrcA.
2. Connect the sign-extended immediate to ALU SrcB.
3. Provide an input pin `ALUControl` to select add.
4. Connect ALU result to RegFile write data `WD`.
5. Connect `rd` to RegFile write address `WA`.
6. Provide an input pin `RegWrite` to drive the RegFile write enable.

<a id="fig-datapath-addi"></a>

![Datapath for ADDI](/images/chap05/data-path-addi.png)

*Figure 5.3: Datapath for the `ADDI` instruction.*

### Task 5: Verification

Design your own verification (refer to the report requirements and questions).

### Results

- Screenshot of your complete `ADDI` datapath.
- At least two `ADDI` instruction test traces: initial register values, instruction, and final `rd` value.
- Explain the roles of PC+4, sign-extension, and ALU in the result.

### Questions

1. What should RegFile `WE` and ALU `OP/ALUControl` be set to for `ADDI`?
2. What breaks if the instruction is not `ADDI`? How should a full design solve this?
3. Why must PC and register writes be clocked (sequential) rather than purely combinational?
4. If `imm` is negative, which part of the datapath ensures correctness?
5. If you add `ADD` later, which parts can be reused?

## Experiment: Add the datapath for `LW`

### Objectives

- Understand the flow “address calculation → memory read → write-back”.
- Use a MUX to select the write-back source.

### Principles

`LW`: $reg[rd] \leftarrow Mem[reg[rs1] + imm]$.

Compared with `ADDI`, the address calculation is the same; the difference is the write-back source (memory vs ALU).

### Environment

- Simulator: Logisim Evolution

### Task 1: Add data memory (RAM)

- Place a 32-bit RAM (e.g., address bits = 10).
- Feed RAM address from ALU result (use ALU[11:2] as word address).

### Task 2: Add a write-back MUX

- Place a 32-bit 2-to-1 MUX.
- Input 1: ALU result (for `ADDI`)
- Input 0: RAM read data (for `LW`)
- Output to RegFile `WD`
- Control pin `ResultSrc`:
  - 0: write back memory data (`LW`)
  - 1: write back ALU result (`ADDI`)

<a id="fig-datapath-lw"></a>

![Datapath including LW write-back selection](/images/chap05/data-path-lw.png)

*Figure 5.4: Datapath extended to support `LW`.*

### Task 3: Verification

Design your own verification.

### Results

- Screenshot of datapath after adding RAM + write-back MUX.
- At least one `LW` test trace: control pins, base register, immediate, memory contents, and final `rd`.
- Compare the write-back paths of `ADDI` vs `LW`.

### Questions

1. Why can `LW` reuse the `ADDI` ALU path?
2. For one `ADDI` and one `LW`, what are the correct control-pin settings and operation sequence?
3. To add `SW`, what additional datapath changes are needed?

## Experiment: Datapath analysis for R-type, S-type, and B-type instructions

Complete the provided comparison tables and summaries:

<a id="tab-rtype-vs-itype"></a>

| Comparison item | R-type | I-type |
|---|---|---|
| Uses immediate |  |  |
| Needs `rs2` read port |  |  |
| ALU operand B source |  |  |
| Accesses data memory |  |  |
| Write-back source |  |  |

*Table 5.2: Datapath comparison between R-type and I-type instructions (fill in during the lab).*

<a id="tab-sbtype-compare"></a>

| Comparison item | R-type | S-type | B-type |
|---|---|---|---|
| Uses immediate |  |  |  |
| Needs `rs2` read port |  |  |  |
| Writes register file |  |  |  |
| Accesses data memory |  |  |  |
| Modifies PC |  |  |  |

*Table 5.3: Datapath comparison for R/S/B types (fill in during the lab).*
