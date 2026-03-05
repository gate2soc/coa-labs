---
title: "Appendix A — RISC-V Instruction Card (RV32IM)"
---

This appendix provides a quick reference for the RV32IM unprivileged ISA (RV32I base integer + RV32M integer multiply/divide). Syntax uses ABI register names or placeholders:

- `rd`: destination register
- `rs1`/`rs2`: source registers
- `imm`: immediate
- `shamt`: shift amount

## Instruction formats (U / J)

RISC-V instructions are 32 bits and use several encoding formats. R/I/S/B formats are covered in Chapter 5’s encoding table; this appendix adds U/J format notes.

<a id="tab-instr-uj-format"></a>

| Format | Immediate field | Notes |
|---|---|---|
| U-type | imm[31:12] | imm is placed into the upper 20 bits; low 12 bits are zero |
| J-type | imm[20|10:1|11|19:12] | immediate bits are permuted in the encoding to reuse fields |

*Table A.1: U-type and J-type immediate encoding summary.*

## RV32I load/store

| Instr | Type | Syntax | Description |
|---|---|---|---|
| LB | I | `LB rd, imm(rs1)` | load byte, sign-extend to 32 bits |
| LH | I | `LH rd, imm(rs1)` | load halfword, sign-extend |
| LW | I | `LW rd, imm(rs1)` | load word (32-bit) |
| LBU | I | `LBU rd, imm(rs1)` | load byte, zero-extend |
| LHU | I | `LHU rd, imm(rs1)` | load halfword, zero-extend |
| SB | S | `SB rs2, imm(rs1)` | store low 8 bits of rs2 |
| SH | S | `SH rs2, imm(rs1)` | store low 16 bits of rs2 |
| SW | S | `SW rs2, imm(rs1)` | store 32 bits of rs2 |

## RV32I shifts

| Instr | Type | Syntax | Description |
|---|---|---|---|
| SLL | R | `SLL rd, rs1, rs2` | logical left shift by rs2[4:0] |
| SRL | R | `SRL rd, rs1, rs2` | logical right shift (zero-fill) |
| SRA | R | `SRA rd, rs1, rs2` | arithmetic right shift (sign-fill) |
| SLLI | I | `SLLI rd, rs1, shamt` | logical left shift immediate |
| SRLI | I | `SRLI rd, rs1, shamt` | logical right shift immediate |
| SRAI | I | `SRAI rd, rs1, shamt` | arithmetic right shift immediate |

## RV32I arithmetic

| Instr | Type | Syntax | Description |
|---|---|---|---|
| ADD | R | `ADD rd, rs1, rs2` | rd = rs1 + rs2 (wrap on overflow) |
| ADDI | I | `ADDI rd, rs1, imm` | rd = rs1 + sign_ext(imm) |
| SUB | R | `SUB rd, rs1, rs2` | rd = rs1 − rs2 (wrap on overflow) |
| LUI | U | `LUI rd, imm` | rd = imm << 12 (low 12 bits zero) |
| AUIPC | U | `AUIPC rd, imm` | rd = PC + (imm << 12) |

## RV32M multiply/divide

| Instr | Type | Syntax | Description |
|---|---|---|---|
| MUL | R | `MUL rd, rs1, rs2` | low 32 bits of signed product |
| MULH | R | `MULH rd, rs1, rs2` | high 32 bits (signed × signed) |
| MULHSU | R | `MULHSU rd, rs1, rs2` | high 32 bits (signed × unsigned) |
| MULHU | R | `MULHU rd, rs1, rs2` | high 32 bits (unsigned × unsigned) |
| DIV | R | `DIV rd, rs1, rs2` | signed division (toward zero) |
| DIVU | R | `DIVU rd, rs1, rs2` | unsigned division |
| REM | R | `REM rd, rs1, rs2` | signed remainder |
| REMU | R | `REMU rd, rs1, rs2` | unsigned remainder |

## RV32I logic

| Instr | Type | Syntax | Description |
|---|---|---|---|
| XOR | R | `XOR rd, rs1, rs2` | bitwise XOR |
| XORI | I | `XORI rd, rs1, imm` | XOR with sign-extended imm |
| OR | R | `OR rd, rs1, rs2` | bitwise OR |
| ORI | I | `ORI rd, rs1, imm` | OR with sign-extended imm |
| AND | R | `AND rd, rs1, rs2` | bitwise AND |
| ANDI | I | `ANDI rd, rs1, imm` | AND with sign-extended imm |

## RV32I compare/set

| Instr | Type | Syntax | Description |
|---|---|---|---|
| SLT | R | `SLT rd, rs1, rs2` | signed less-than → 1/0 |
| SLTI | I | `SLTI rd, rs1, imm` | signed compare with imm |
| SLTU | R | `SLTU rd, rs1, rs2` | unsigned less-than |
| SLTIU | I | `SLTIU rd, rs1, imm` | unsigned compare with imm |

## RV32I branches

Branch targets are PC-relative; immediates are 2-byte aligned (range ≈ ±4 KiB).

| Instr | Type | Syntax | Description |
|---|---|---|---|
| BEQ | B | `BEQ rs1, rs2, imm` | if rs1==rs2, PC ← PC + sign_ext(imm) |
| BNE | B | `BNE rs1, rs2, imm` | if rs1!=rs2, branch |
| BLT | B | `BLT rs1, rs2, imm` | signed less-than |
| BGE | B | `BGE rs1, rs2, imm` | signed ≥ |
| BLTU | B | `BLTU rs1, rs2, imm` | unsigned less-than |
| BGEU | B | `BGEU rs1, rs2, imm` | unsigned ≥ |

## RV32I jumps

| Instr | Type | Syntax | Description |
|---|---|---|---|
| JAL | J | `JAL rd, imm` | rd=PC+4; PC ← PC + sign_ext(imm) |
| JALR | I | `JALR rd, rs1, imm` | rd=PC+4; PC ← (rs1+sign_ext(imm)) & ~1 |

## FENCE

| Instr | Type | Syntax | Description |
|---|---|---|---|
| FENCE | I | `FENCE pred, succ` | ordering barrier for memory/I/O |
| FENCE.I | I | `FENCE.I` | instruction/data sync barrier |

## System

| Instr | Type | Syntax | Description |
|---|---|---|---|
| ECALL | I | `ECALL` | environment call trap |
| EBREAK | I | `EBREAK` | breakpoint trap |

## Zicsr (CSR) instructions

| Instr | Type | Syntax | Description |
|---|---|---|---|
| CSRRW | I | `CSRRW rd, csr, rs1` | read then write |
| CSRRS | I | `CSRRS rd, csr, rs1` | read then set bits |
| CSRRC | I | `CSRRC rd, csr, rs1` | read then clear bits |
| CSRRWI | I | `CSRRWI rd, csr, imm` | immediate write |
| CSRRSI | I | `CSRRSI rd, csr, imm` | immediate set bits |
| CSRRCI | I | `CSRRCI rd, csr, imm` | immediate clear bits |
