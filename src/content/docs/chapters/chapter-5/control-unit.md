---
title: "Control Unit Design"
---

After the datapath is built, the next step is designing the **control unit**. In a single-cycle CPU, the control unit is **combinational logic** that reads the current instruction fields and produces control signals within the same cycle.

<a id="fig-datapath-overview"></a>

![Reference datapath](/images/chap05/data-path.png)

*Figure 5.5: Reference datapath diagram.*

Key control signals (for our minimal ISA subset):

- `RegWrite`: register file write enable
- `ImmSrc`: immediate type selection (I / S / B)
- `ALUSrc`: ALU operand B source (0 = reg, 1 = imm)
- `MemWrite`: data memory write enable
- `ResultSrc`: write-back source select (0 = ALU, 1 = RAM)
- `ALUControl`: ALU operation select
- `PCSrc`: PC update select (0 = PC+4, 1 = branch target)

Instruction fields used:

- `opcode = Instr[6:0]`
- `funct3 = Instr[14:12]`
- `funct7[5] = Instr[30]` (critical bit for ADD vs SUB)

A common implementation splits control into two blocks:

1. **Main decoder**: based on `opcode`, outputs structural control signals and an intermediate `ALUOp`.
2. **ALU decoder**: based on `ALUOp` plus `funct3` and key bits, outputs `ALUControl`.

<a id="fig-controller-block"></a>

![Controller block diagram](/images/chap05/cu-block.png)

*Figure 5.6: Control unit structure (main decoder + ALU decoder).*

For `BEQ`, whether the branch is taken depends on the comparison result. Typically:

- `PCSrc = Branch AND Zero`

## Experiment: Single-cycle control unit

### Objectives

- Understand where control signals come from and what they do.
- Learn a practical decoding design method.
- Implement a `ControlUnit` subcircuit in Logisim Evolution.

### Environment

- Simulator: Logisim Evolution

### Principles

Two-level decoding:

- main decoder: `opcode` → `RegWrite, ImmSrc, ALUSrc, MemWrite, ResultSrc, Branch, ALUOp`
- ALU decoder: `ALUOp` + `funct3` + key bits → `ALUControl`

And for BEQ:

- `PCSrc = Branch · Zero`

### Task 1: Fill the main decoder truth table

Encoding conventions:

- `ImmSrc`: 00 = I, 01 = S, 10 = B
- `ALUOp`: 00 = ADD, 01 = SUB (for BEQ), 10 = use funct fields

<a id="tab-main-decoder-truth"></a>

| Instr | opcode | RegWrite | ImmSrc | ALUSrc | MemWrite | ResultSrc | Branch | ALUOp |
|---|---|---|---|---|---|---|---|---|
| R-type | 0110011 |  |  |  |  |  |  |  |
| ADDI | 0010011 |  |  |  |  |  |  |  |
| LW | 0000011 |  |  |  |  |  |  |  |
| SW | 0100011 |  |  |  |  |  |  |  |
| BEQ | 1100011 |  |  |  |  |  |  |  |

*Table 5.4: Main decoder truth table (fill in during the lab; “don’t care” can be marked as `--`).*

### Task 2: Fill the ALU decoder truth table

Inputs: `ALUOp`, `funct3`, `{op5, funct7_5}`. Output: `ALUControl` (must match your ALU encoding).

<a id="tab-alu-decoder-truth"></a>

| Instr | ALUOp | funct3 | {op5, funct7_5} | ALUControl |
|---|---:|---|---|---|
| LW / SW | 00 |  |  |  |
| BEQ | 01 |  |  |  |
| ADD / ADDI | 10 |  |  |  |
| SUB | 10 |  |  |  |

*Table 5.5: ALU decoder truth table (fill in during the lab).*

### Task 3: Draw the `ControlUnit` subcircuit

Inputs:

- `Instr` (32-bit)
- `Zero`

Outputs:

- `RegWrite, ImmSrc, ALUSrc, MemWrite, ResultSrc, PCSrc, ALUControl`

Use tunnels to keep wiring clean.

### Task 4: Verify the control unit

Inject instruction encodings and check outputs:

<a id="tab-cu-test-instr"></a>

| Instr | Assembly | Hex encoding |
|---|---|---|
| ADD | `add x3, x1, x2` | `0x002081B3` |
| SUB | `sub x3, x1, x2` | `0x402081B3` |
| ADDI | `addi x3, x1, 4` | `0x00408193` |
| LW | `lw x3, 0(x1)` | `0x0000A183` |
| SW | `sw x3, 0(x1)` | `0x0030A023` |
| BEQ | `beq x1, x2, +8` | `0x00208463` |

*Table 5.6: Test instruction encodings for control-unit verification.*

### Results

- Screenshot of the complete control unit.
- Verification records for the test instructions (expected vs observed control signals).

### Questions

1. Why split decoding into “main decoder + ALU decoder”?
2. Why can’t `PCSrc` for BEQ be decided purely by opcode?
3. What should you do when encountering an unsupported instruction?
