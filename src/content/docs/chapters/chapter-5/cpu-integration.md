---
title: "System Integration & Testing"
---

After building the datapath and control unit separately, you must integrate them into a complete CPU. Only when the control signals correctly drive the datapath (and the datapath feeds needed signals back, such as `Zero`) will programs execute correctly.

## Experiment: Single-cycle CPU integration and validation

### Objectives

- Integrate datapath + control unit into a runnable single-cycle CPU.
- Debug end-to-end using small programs (ALU ops, memory ops, branches).

### Environment

- Simulator: Logisim Evolution

### Task 1: Connect control signals

1. Place the ControlUnit in the datapath circuit.
2. Replace manual control pins with tunnels, connected to the ControlUnit outputs.
3. Probe signals such as `Instr`, `Extend/Imm`, `SrcA`, `SrcB`, `ALUControl`, `ALUResult`, `PCTarget`, etc.

### Task 2: Program 1 (arithmetic chain)

Assembly:

```asm
addi x1, x0, 5      # x1 = 5
addi x2, x0, 7      # x2 = 7
add  x3, x1, x2     # x3 = 12
sub  x4, x3, x1     # x4 = 7
```

Hex:

```text
0x00000000: 0x00500093
0x00000004: 0x00700113
0x00000008: 0x002081b3
0x0000000c: 0x40118233
```

Check:

- `RegWrite` is 1 only for instructions that write registers.
- Final: `x1=5, x2=7, x3=12, x4=7`.

### Task 3: Program 2 (memory)

Assembly:

```asm
addi x1, x0, 0x100 # x1 = 0x100
addi x2, x0, 42    # x2 = 42
sw   x2, 0(x1)     # mem[0x100] = 42
lw   x3, 0(x1)     # x3 = mem[0x100]
sub  x4, x3, x2    # x4 = 0
```

Hex:

```text
0x00000000: 0x10000093
0x00000004: 0x02a00113
0x00000008: 0x0020a023
0x0000000c: 0x0000a183
0x00000010: 0x40218233
```

Check:

- On `SW`: `MemWrite=1`, write address is ALU `x1+imm`.
- On `LW`: write-back selects memory data.
- Final: `mem[0x100]=42, x3=42, x4=0`.

### Task 4: Program 3 (branch and loop)

Assembly:

```asm
addi x1, x0, 3      # x1 = 3 (counter)
addi x2, x0, 0      # x2 = 0 (sum)

loop:
add  x2, x2, x1     # sum += counter
addi x1, x1, -1     # counter--
beq  x1, x0, done   # if counter==0 break
beq  x0, x0, loop   # unconditional branch (always taken)

done:
addi x3, x2, 0      # x3 = sum (expected 6)
```

Hex:

```text
0x00000000: 0x00300093
0x00000004: 0x00000113
0x00000008: 0x00110133
0x0000000c: 0xfff08093
0x00000010: 0x00008463
0x00000014: 0xfe000ae3
0x00000018: 0x00010193
```

Check:

- For `beq x1,x0,done`, ALU comparison produces `Zero` correctly.
- When `x1` becomes 0, PC should jump from 0x10 to 0x18.
- Final: `x3=6`.

### Results

- CPU circuit screenshot.
- Program results (final register/memory values).
- One debugging record (what signals you probed and how you found/fixed the issue).

### Question

- This lab uses `beq x0, x0, label` for an unconditional branch. Which hardware facts/signals make this always taken?
