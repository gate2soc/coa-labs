---
title: "Toolchain: C to Bare-Metal Assembly"
---

Most compiled languages (C/C++/Rust/Go, etc.) translate source to an executable through preprocessing/compilation, assembling, and linking. Toolchains (GCC, LLVM/Clang, etc.) can emit assembly for debugging.

However, the generated assembly is often **too complex** for a simple educational CPU because it may depend on a standard library, runtime, or OS system calls.

This section shows practical ways to generate **bare-metal** RISC-V assembly from a restricted subset of C.

## Restrictions for “bare-metal friendly” C

When writing C for these labs:

- Do not include standard headers (`stdio.h`, `stdlib.h`, `string.h`, …) and do not call library functions (`printf`, `rand`, `memset`, …).
- Do not define global variables.
- Do not allocate heap memory (`malloc`/`free`).
- Ensure statements have observable effects (return values, memory writes). Otherwise the compiler may eliminate them as dead code.

## Using GCC to generate bare-metal assembly

GCC is widely used and supports many architectures. If your host machine is not RISC-V, you typically use a **cross compiler**.

Install a RISC-V bare-metal GCC toolchain (names vary by distro), commonly `riscv64-unknown-elf-gcc` (it can still target `riscv32`):

- Debian/Ubuntu: `sudo apt install gcc-riscv64-unknown-elf`
- Fedora: `sudo dnf install gcc-riscv64-linux-gnu`
- Arch: install `riscv64-unknown-elf-gcc` from AUR
- macOS: Homebrew package `riscv64-elf-gcc`

Example version output:

```text
$ riscv64-unknown-elf-gcc --version
riscv64-unknown-elf-gcc (14.2.0+19) 14.2.0
...
```

To compile `aplusb.c` into assembly `aplusb.s`:

```bash
riscv64-unknown-elf-gcc -march=rv32im -mabi=ilp32 -ffreestanding -O2 -S aplusb.c
```

Key flags (do not change casually):

- `-march` / `-mabi`: select ISA/ABI (wrong values may generate unsupported instructions).
- `-O2`: enable common optimizations.
- `-S`: emit assembly instead of an object/executable.
- `-ffreestanding`: prevent assumptions about standard library availability.

### Example: simple add function

<a id="code-aplusb-c"></a>

```c
int aplusb(int a, int b) {
  int sum = 0;
  for (int i = 0; i < 10; ++i)
    sum += i;
  return a + b + 19910000;
}
```

*Code 4.1: C source (`aplusb.c`).*

<a id="code-aplusb-gcc"></a>

```asm
  .file   "aplusb.c"
  .option nopic
  .attribute arch, "rv32i2p1_m2p0"
  .attribute unaligned_access, 0
  .attribute stack_align, 16
  .text
  .align  2
  .globl  aplusb
  .type   aplusb, @function
aplusb:
  add     a0,a0,a1
  li      a5,19910656
  addi    a5,a5,-656
  add     a0,a0,a5
  ret
  .size   aplusb, .-aplusb
  .ident  "GCC: (14.2.0+19) 14.2.0"
  .section        .note.GNU-stack,"",@progbits
```

*Code 4.2: GCC-generated assembly (`aplusb_gcc.s`). In our labs, assembler directives starting with `.` can usually be ignored.*

To run in Ripes, it is often convenient to remove `ret` (so it doesn’t jump to `ra`) and replace it with a self-loop:

<a id="code-aplusb-ripes"></a>

```asm
aplusb:
  add     a0, a0, a1
  li      a5, 19910656
  addi    a5, a5, -656
  add     a0, a0, a5
.end:
  j       .end
```

*Code 4.3: Ripes-friendly assembly (`aplusb_ripes.s`).*

## Using Clang to generate bare-metal assembly

Clang/LLVM supports many targets. For simple bare-metal assembly emission, you can often avoid installing a full target sysroot.

Example command:

```bash
clang --target=riscv32-unknown-elf -march=rv32im -mabi=ilp32 -O2 -S -nostdlib -ffreestanding sum.c
```

### Example: summing an integer array

<a id="code-sum-c"></a>

```c
int sum(int *p, int l) {
  int sum = 0;
  for (int i = 0; i < l; ++i)
    sum += p[i];
  return sum;
}
```

*Code 4.4: C source (`sum.c`).*

<a id="code-sum-clang"></a>

```asm
  .attribute  4, 16
  .attribute  5, "rv32i2p1_m2p0_zmmul1p0"
  .file   "sum.c"
  .text
  .globl  sum  # -- Begin function sum
  .p2align  2
  .type   sum,@function
sum:  # @sum
# %bb.0:
  li      a2, 0
  blez    a1, .LBB0_3
# %bb.1:
  slli    a1, a1, 2
  add     a1, a0, a1
.LBB0_2:  # =>This Inner Loop Header: Depth=1
  lw      a3, 0(a0)
  addi    a0, a0, 4
  add     a2, a3, a2
  bne     a0, a1, .LBB0_2
.LBB0_3:
  mv      a0, a2
  ret
```

*Code 4.5: Clang-generated assembly (`sum_clang.s`).*

<a id="code-sum-ripes"></a>

```asm
sum:
  li      a2, 0
  blez    a1, .LBB0_3
  slli    a1, a1, 2
  add     a1, a0, a1
.LBB0_2:
  lw      a3, 0(a0)
  addi    a0, a0, 4
  add     a2, a3, a2
  bne     a0, a1, .LBB0_2
.LBB0_3:
  mv      a0, a2
.end:
  j       .end
```

*Code 4.6: Ripes-friendly assembly (`sum_ripes.s`).*

## Using Compiler Explorer (godbolt.org)

Compiler Explorer is a free web tool to compile code in the browser and inspect generated assembly.

<a id="fig-godbolt"></a>

![Compiler Explorer UI](/images/chap04/compiler-explorer-ui.png)

*Figure 4.1: Compiler Explorer main UI.*

To generate RISC-V assembly:

- Set language to **C**.
- Choose a RISC-V 32-bit compiler (any recent version is fine).
- Use compilation options like:
  - `-march=rv32im -mabi=ilp32 -O2 -nostdlib -ffreestanding`

Enable the “Filter…” options to hide directives/comments if you want a cleaner view.
