---
title: "DMA"
---

With polling or interrupts, the CPU still performs the actual data movement (load/store per byte/word). For large transfers, that is slow and ties up the CPU.

**DMA (Direct Memory Access)** adds a hardware controller that copies data between memory and devices (or memory-to-memory) with minimal CPU involvement:

- CPU programs source, destination, length, and starts DMA
- DMA becomes a bus master and performs bulk transfers
- DMA signals completion via status or interrupt

## DMA engine register map (Logisim)

<a id="tab-dma-registers"></a>

| Offset | Register | Access | Description |
|---:|---|---|---|
| 0x00 | SRC_ADDR | R/W | source address (word-aligned) |
| 0x04 | DST_ADDR | R/W | destination address (word-aligned) |
| 0x08 | LENGTH | R/W | length in **bytes** (multiple of 4) |
| 0x0C | CONTROL | R/W | control bits |
| 0x10 | STATUS | R/W1C | status bits |
| 0x14 | BYTES_DONE | R | bytes transferred so far |

*Table 9.6: DMA engine MMIO registers (relative to base).*

<a id="tab-dma-control"></a>

| Bits | Name | Attr | Meaning |
|---|---|---|---|
| [0] | START | W | write 1 to start (ignored if BUSY=1 or LENGTH=0) |
| [1] | IRQ_EN | R/W | enable interrupt on completion |

*Table 9.7: DMA CONTROL fields.*

<a id="tab-dma-status"></a>

| Bits | Name | Attr | Meaning |
|---|---|---|---|
| [0] | BUSY | R | 1 while transfer in progress |
| [1] | DONE | R/W1C | set on completion; write 1 to clear |

*Table 9.8: DMA STATUS fields.*

## Experiment: DMA transfer to VGA (polling)

### Objectives

- Program the DMA engine (src/dst/length/start/status polling).
- Compare CPU copy vs DMA copy for a large buffer.

### Environment

- Simulator: Logisim Evolution
- Toolchain: `riscv64-unknown-elf-gcc`

<a id="fig-vga-dma-soc"></a>

![DMA SoC circuit](/images/chap09/dma.png)

*Figure 9.3: DMA + VGA SoC wiring.*

### Task: Complete a polling DMA copy function

Fill in the TODO in `copy_pixels_dma`:

<a id="code-vga-dma-task"></a>

```c
#include "utils.h"

void copy_pixels_cpu(uint32_t *dst, uint32_t *src, uint32_t pixels) {
  for (uint32_t i = 0; i < pixels; i++) {
    *dst++ = *src++;
  }
}

void copy_pixels_dma(uint32_t *dst, uint32_t *src, uint32_t pixels) {
  /* TODO: program DMA registers, start transfer, poll BUSY until done.
   *   1) write src to DMA_SRC_ADDR
   *   2) write dst to DMA_DST_ADDR
   *   3) write byte length to DMA_LENGTH (bytes = pixels * 4)
   *   4) write START to DMA_CONTROL (IRQ_EN = 0)
   *   5) poll DMA_STATUS BUSY until it becomes 0
   */
}
```

*Code 9.5: DMA copy task skeleton (`vga_dma_task.c`).*

### Results

- Completed source.
- Screenshot of VGA scrolling output.
- Measure cycles for one CPU scroll vs one (or eight) DMA scrolls; compute speedup.

### Questions

- Why is DMA much faster than CPU copy (instruction overhead vs burst hardware transfers)?
- What is the CPU doing while polling BUSY, and how could you overlap useful work or use an interrupt?
- Can CPU and DMA safely access the same memory region at the same time? Why/why not?
