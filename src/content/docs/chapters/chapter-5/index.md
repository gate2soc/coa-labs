---
title: "Chapter 5 — Single-Cycle CPU: Design & Implementation"
---

In this chapter you will implement a **minimal single-cycle CPU**. Under a clock, you will connect combinational logic and storage elements into a system that can continuously execute a program. In a single-cycle design, each instruction completes fetch, decode, execute, memory access, and write-back within one clock cycle, with the architectural state (PC, registers, memory write) updating at the clock edge.

A single-cycle CPU is a great learning model because its structure and control are explicit and easy to debug. The target ISA subset for this chapter is a minimal RV32I set:

- `ADD`, `SUB`, `ADDI`, `LW`, `SW`, `BEQ`

The instruction formats used by these instructions are summarized below.

<a id="tab-single-cycle-isa-encoding"></a>

### R-type (register–register)

| Instr | funct7 | rs2 | rs1 | funct3 | rd | opcode |
|---|---|---|---|---|---|---|
| ADD | 0000000 | rs2 | rs1 | 000 | rd | 0110011 |
| SUB | 0100000 | rs2 | rs1 | 000 | rd | 0110011 |

### I-type (register–immediate)

| Instr | imm[31:20] | rs1 | funct3 | rd | opcode |
|---|---|---|---|---|---|
| ADDI | imm | rs1 | 000 | rd | 0010011 |
| LW | imm | rs1 | 010 | rd | 0000011 |

### S-type (store) and B-type (branch)

| Instr | imm[31:25] | rs2 | rs1 | funct3 | imm[11:7] | opcode |
|---|---|---|---|---|---|---|
| SW | imm[11:5] | rs2 | rs1 | 010 | imm[4:0] | 0100011 |
| BEQ | imm[12,10:5] | rs2 | rs1 | 000 | imm[4:1,11] | 1100011 |

*Table 5.1: Minimal instruction subset and encodings for the single-cycle CPU labs. Note: RISC-V branch immediates are 2-byte aligned, so the lowest bit is always 0 and is not explicitly encoded; BEQ’s immediate effectively has 13 bits after reconstruction.*

This chapter is organized in three layers:

- **Datapath construction** (start from functional modules and wire a working datapath)
- **Control unit design** (decode instructions into control signals)
- **System integration & testing** (run small programs end-to-end)
