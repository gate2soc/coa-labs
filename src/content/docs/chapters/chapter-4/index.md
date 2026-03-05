---
title: "Chapter 4 — Generating Assembly Programs"
---

Machine language is the set of binary-encoded instructions a processor can execute. **Assembly language** is the human-readable textual form of machine language. Using mnemonics, programmers can write machine instructions without memorizing encodings and can control hardware directly.

For this lab manual, you do **not** need to become an expert at handwriting large assembly programs. Before continuing with later processor labs, you should be able to:

- Understand the basics of the RISC-V ISA (especially the unprivileged `RV32I` subset): registers, common instruction categories, and naming.
- Read simple RISC-V assembly and recognize how common control-flow constructs (`if`, `for`, `while`) appear after compilation.

The table below lists RV32I general-purpose registers and their common ABI names.

<a id="tab-riscv-registers"></a>

| Register | ABI name | Saved by | Notes |
|---|---|---|---|
| x0 | zero | — | Always 0; writes are ignored |
| x1 | ra | Caller | Return address |
| x2 | sp | Callee | Stack pointer |
| x3 | gp | — | Global pointer |
| x4 | tp | — | Thread pointer |
| x5–x7 | t0–t2 | Caller | Temporaries |
| x8 | s0/fp | Callee | Saved register / frame pointer |
| x9 | s1 | Callee | Saved register |
| x10–x11 | a0–a1 | Caller | Args / return values |
| x12–x17 | a2–a7 | Caller | Function arguments |
| x18–x27 | s2–s11 | Callee | Saved registers |
| x28–x31 | t3–t6 | Caller | Temporaries |

*Table 4.1: RV32I general-purpose registers and ABI names.*

This chapter focuses on **generating assembly programs** using existing toolchains: turning familiar high-level code (e.g., C) into bare-metal RISC-V assembly (no standard library, no OS calls) for use in later labs.
