---
title: "Appendix B — Full Lab Source Code"
---

This appendix collects the complete source code used in the Chapter 9 labs.

## B.1 Interrupt-driven I/O

### `utils.h`

Provides:

- MMIO base addresses for JTAG UART and PLIC
- minimal CSR helpers (`mie.MEIE`, `mstatus.MIE`)
- polling UART output (`uart_putc`)
- optional ring buffer implementation enabled by `USE_RX_QUEUE`

<a id="code-intr-utils-h"></a>

```c
#ifndef UTILS_H
#define UTILS_H

#include <stdint.h>

/* ========= Peripheral and PLIC base addresses ========= */
#define JTAG_UART_BASE 0x60000u
#define PLIC_BASE      0xc000000u

#define UART_DATA (*(volatile uint32_t *)(JTAG_UART_BASE + 0u))
#define UART_CTRL (*(volatile uint32_t *)(JTAG_UART_BASE + 4u))

#define UART_CTRL_RE    (1u << 0)   /* RX interrupt enable */
#define UART_DATA_VALID (1u << 15)  /* VALID bit for DATA register reads */

#define UART_IRQ_ID     1u          /* UART interrupt source ID in the PLIC */
#define PLIC_ENABLE     (*(volatile uint32_t *)(PLIC_BASE + 0x2000u))
#define PLIC_THRESHOLD  (*(volatile uint32_t *)(PLIC_BASE + 0x200000u))
#define PLIC_CLAIM      (*(volatile uint32_t *)(PLIC_BASE + 0x200004u))

/* ========= Minimal CSR access helpers ========= */
static inline void csr_set_mstatus_mie(void) {
  __asm__ volatile ("csrs mstatus, %0" :: "r"(0x8u));
}
static inline void csr_set_mie_meie(void) {
  __asm__ volatile ("csrs mie, %0" :: "r"(1u << 11));
}

/* ========= Output (still polling-based) ========= */
static inline int uart_can_write(void) {
  return ((UART_CTRL >> 16) & 0xFFFFu) != 0u;
}
static void uart_putc(uint8_t ch) {
  while (!uart_can_write()) { }
  UART_DATA = (uint32_t)ch;
}

/* ========= Ring buffer (enabled only when USE_RX_QUEUE is defined) ========= */
#ifdef USE_RX_QUEUE

#define RX_QUEUE_SIZE  32u                /* must be a power of two */
#define RX_QUEUE_MASK  (RX_QUEUE_SIZE - 1u)

static volatile uint8_t  g_rx_queue[RX_QUEUE_SIZE];
static volatile uint32_t g_rx_head;  /* head (read index, used by main loop) */
static volatile uint32_t g_rx_tail;  /* tail (write index, used by ISR) */

/* ISR: push one byte into the queue */
static void rx_push(uint8_t ch) {
  uint32_t next = (g_rx_tail + 1u) & RX_QUEUE_MASK;
  if (next == g_rx_head) {
    /* Queue full; overwrite the oldest byte */
    g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
  }
  g_rx_queue[g_rx_tail] = ch;
  g_rx_tail = next;
}

/* Main: pop one byte; return 1 on success */
static int rx_pop(uint8_t *ch) {
  if (g_rx_head == g_rx_tail) return 0;
  *ch = g_rx_queue[g_rx_head];
  g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
  return 1;
}

#endif /* USE_RX_QUEUE */

#endif /* UTILS_H */
```

### `uart_irq.c`

A complete example of PLIC initialization + external interrupt handling + a ring buffer between ISR and the main loop.

<a id="code-uart-irq-c"></a>

```c
#include <stdint.h>

/* ========= 1) Peripheral and PLIC base addresses (fill in for your SoC) ========= */
#define JTAG_UART_BASE    0x60000u
#define PLIC_BASE         0xc000000u
#define PLIC_PENDING_WORD (*(volatile uint32_t *)(PLIC_BASE + 0x1000u))
#define PLIC_ENABLE_WORD  (*(volatile uint32_t *)(PLIC_BASE + 0x2000u))
#define PLIC_THRESHOLD    (*(volatile uint32_t *)(PLIC_BASE + 0x200000u))
#define PLIC_CLAIM        (*(volatile uint32_t *)(PLIC_BASE + 0x200004u))

/* UART interrupt source ID in the PLIC (per your SoC/PLIC wiring) */
#define UART_IRQ_ID    (1u)

/* ========= 2) JTAG UART MMIO ========= */
#define UART_DATA (*(volatile uint32_t *)(JTAG_UART_BASE + 0u))
#define UART_CTRL (*(volatile uint32_t *)(JTAG_UART_BASE + 4u))

#define UART_CTRL_RE     (1u << 0)    /* RX interrupt enable */
#define UART_DATA_VALID  (1u << 15)   /* DATA register read VALID bit */

/* ========= 3) PLIC =========*/

static inline void plic_init_for_uart(void) {
  /* Enable this interrupt source */
  PLIC_ENABLE_WORD |= (1u << (UART_IRQ_ID % 32u));

  /* threshold=0: allow all interrupts with priority > 0 */
  PLIC_THRESHOLD = 0u;
}

/* ========= 4) Minimal CSR access helpers ========= */
static inline void csr_write_mtvec(uint32_t v) {
  __asm__ volatile ("csrw mtvec, %0" :: "r"(v));
}
static inline void csr_set_mstatus_mie(void) {
  /* mstatus.MIE = 1 */
  __asm__ volatile ("csrs mstatus, %0" :: "r"(0x8u));
}
static inline void csr_set_mie_meie(void) {
  /* mie.MEIE = 1 (Machine external interrupt enable) */
  __asm__ volatile ("csrs mie, %0" :: "r"(1u << 11));
}

/* ========= 5) Output (still polling; keeps structure simple) ========= */
static inline int uart_can_write(void) {
  /* WSPACE = UART_CTRL[31:16] */
  uint32_t wspace = (UART_CTRL >> 16) & 0xFFFFu;
  return (wspace != 0u);
}

static void uart_putc(uint8_t ch) {
  while (!uart_can_write()) { }
  UART_DATA = (uint32_t)ch;
}

/* ========= 6) Ring buffer for ISR ↔ main communication ========= */
/* Queue size (must be a power of two for fast masking) */
#define RX_QUEUE_SIZE  32u
#define RX_QUEUE_MASK  (RX_QUEUE_SIZE - 1u)

/* Ring buffer for received bytes */
static volatile uint8_t  g_rx_queue[RX_QUEUE_SIZE];
static volatile uint32_t g_rx_head;  /* head (read index, used by main loop) */
static volatile uint32_t g_rx_tail;  /* tail (write index, used by ISR) */

/* ========= 7) Interrupt handling via PLIC claim/complete ========= */
void trap_handler(void *trap_frame, uint32_t mcause) {
  /* MSB=1 indicates interrupt; code 11 is Machine external interrupt */
  if ((mcause >> 31) && ((mcause & 0x7FFFFFFFu) == 11u)) {

    uint32_t irq = PLIC_CLAIM;   /* claim: get interrupt source ID */

    if (irq == UART_IRQ_ID) {
      /* Read all available UART bytes until RX FIFO is empty */
      for (;;) {
        uint32_t v = UART_DATA;
        /* Check whether the read is valid */
        if (!(v & UART_DATA_VALID)) {
          /* Not valid => FIFO empty; break */
          break;
        }
        /* Extract byte */
        uint8_t ch = (uint8_t)(v & 0xFFu);
        /* Compute next tail position */
        uint32_t next_tail = (g_rx_tail + 1u) & RX_QUEUE_MASK;
        /* Check queue full (next_tail == head) */
        if (next_tail == g_rx_head) {
          /* Queue full; advance head to overwrite oldest */
          g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
        }
        /* Store byte (after handling full condition) */
        g_rx_queue[g_rx_tail] = ch;
        g_rx_tail = next_tail;  /* Update tail */
      }
    }

    /* complete: write back the same ID */
    PLIC_CLAIM = irq;
    return;
  }

  /* Other traps/interrupts: not handled in this lab */
}

/* ========= 8) Init: mtvec + CPU interrupts + PLIC + UART ========= */
static void uart_enable_rx_irq(void) {
  UART_CTRL = UART_CTRL | UART_CTRL_RE;
}

static void irq_init(void) {
  /* PLIC: set priority/enable/threshold */
  plic_init_for_uart();
  /* CPU: enable external interrupts + global MIE */
  csr_set_mie_meie();
  csr_set_mstatus_mie();
  /* UART: enable RX interrupt */
  uart_enable_rx_irq();
}

int main(void) {
  /* Initialize ring buffer */
  g_rx_head = 0u;
  g_rx_tail = 0u;

  irq_init();

  for (;;) {
    /* If head != tail, queue is non-empty */
    if (g_rx_head != g_rx_tail) {
      /* Read one byte from the queue */
      uint8_t ch = g_rx_queue[g_rx_head];
      /* Update head */
      g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
      uart_putc(ch); /* Echo back */
    }
  }
}
```

### `start.s`

Minimal startup + a full trap entry which saves context, calls `trap_handler`, then restores and returns.

<a id="code-intr-start-s"></a>

```asm
    # User stack
    .section .bss.stack
    .align  4
_stack:
    .space  1024
_stack_top: # Top of user stack

    # Trap stack (used during interrupt/trap handling)
    .section .bss.trap_stack
    .align  4
_trap_stack:
    .space  1024
_trap_stack_top: # Top of trap stack

    # Program entry
    .section .text._start
    .globl  _start
_start:
    # Set user stack pointer
    la      sp, _stack_top
    # Set mscratch CSR to top of trap stack
    la      t0, _trap_stack_top
    csrw    mscratch, t0
    # Set mtvec to trap entry
    la      t0, _trap_entry
    csrw    mtvec, t0
    # Call main
    call    main
    # Spin forever
_loop:
    j       _loop

    # Trap entry
    .section .text.trap
    .align  2
_trap_entry:
    # --- Stage 1: Swap stack pointers (Context Switch Initial) ---
    # At this point: t0 is the user's, mscratch holds top of trap stack
    csrrw   t0, mscratch, t0   
    # Now: t0 is top of trap stack, mscratch holds the user's t0

    # Allocate 144 bytes on trap stack (36 × 4-byte slots)
    addi    t0, t0, -144

    # --- Stage 2: Save GPRs ---
    # Save ra and the user's t0 (currently in mscratch)
    sw      ra, 0(t0)
    csrr    ra, mscratch       # Move user's t0 into ra as a temporary
    sw      ra, 4(t0)          # Save user's t0 at offset 4

    # Save original user stack pointer (sp)
    sw      sp, 124(t0)        # Save user sp at offset 124

    # Now it is safe to switch sp to the trap stack
    mv      sp, t0

    # Save the remaining general-purpose registers
    sw      t1, 8(sp)
    sw      t2, 12(sp)
    sw      s0, 16(sp)
    sw      s1, 20(sp)
    sw      a0, 24(sp)
    sw      a1, 28(sp)
    sw      a2, 32(sp)
    sw      a3, 36(sp)
    sw      a4, 40(sp)
    sw      a5, 44(sp)
    sw      a6, 48(sp)
    sw      a7, 52(sp)
    sw      s2, 56(sp)
    sw      s3, 60(sp)
    sw      s4, 64(sp)
    sw      s5, 68(sp)
    sw      s6, 72(sp)
    sw      s7, 76(sp)
    sw      s8, 80(sp)
    sw      s9, 84(sp)
    sw      s10, 88(sp)
    sw      s11, 92(sp)
    sw      t3, 96(sp)
    sw      t4, 100(sp)
    sw      t5, 104(sp)
    sw      t6, 108(sp)

    # --- Stage 3: Save CSR state ---
    csrr    t1, mstatus
    sw      t1, 112(sp)
    csrr    t1, mepc
    sw      t1, 116(sp)
    csrr    t1, mcause
    sw      t1, 120(sp)
    csrr    t1, mtval
    sw      t1, 128(sp)        # Also save mtval for easier debugging

    # --- Stage 4: Call C handler ---
    # Pass args: a0 = trap frame pointer, a1 = mcause
    mv      a0, sp
    csrr    a1, mcause
    call    trap_handler

    # --- Stage 5: Restore CSR state ---
    lw      t1, 112(sp)
    csrw    mstatus, t1
    lw      t1, 116(sp)
    csrw    mepc, t1

    # --- Stage 6: Restore GPRs ---
    # Restore all registers except sp and t0
    lw      ra, 0(sp)
    lw      t1, 8(sp)
    lw      t2, 12(sp)
    lw      s0, 16(sp)
    lw      s1, 20(sp)
    lw      a0, 24(sp)
    lw      a1, 28(sp)
    lw      a2, 32(sp)
    lw      a3, 36(sp)
    lw      a4, 40(sp)
    lw      a5, 44(sp)
    lw      a6, 48(sp)
    lw      a7, 52(sp)
    lw      s2, 56(sp)
    lw      s3, 60(sp)
    lw      s4, 64(sp)
    lw      s5, 68(sp)
    lw      s6, 72(sp)
    lw      s7, 76(sp)
    lw      s8, 80(sp)
    lw      s9, 84(sp)
    lw      s10, 88(sp)
    lw      s11, 92(sp)
    lw      t3, 96(sp)
    lw      t4, 100(sp)
    lw      t5, 104(sp)
    lw      t6, 108(sp)

    # --- Stage 7: Return stacks safely and exit trap ---
    # 1) Put the original trap stack top (sp + 144) back into mscratch for the next trap
    addi    t0, sp, 144
    csrw    mscratch, t0

    # 2) Restore the original user t0 from the trap frame into t0
    lw      t0, 4(sp)

    # 3) Finally restore the original user sp
    lw      sp, 124(sp)

    # Return to interrupted code
    mret
```

### `link.ld`

<a id="code-intr-link-ld"></a>

```text
ENTRY(_start)

SECTIONS
{
  . = 0x00000000;
  .text : {
    KEEP(*(.text._start))
    *(.text*)
  }
  .rodata : { *(.rodata*) }
  .data   : { *(.data*) }
  .bss    : { *(.bss*) *(COMMON) }
}
```

Build command:

```bash
riscv64-unknown-elf-gcc -march=rv32i_zicsr -mabi=ilp32 \
  -ffreestanding -nostdlib -nostartfiles \
  -Wl,-T,link.ld \
  -O2 -o uart_irq.elf start.s uart_irq.c
```

## B.2 DMA data transfer (VGA)

### `utils.h`

<a id="code-dma-utils-h"></a>

```c
#ifndef UTILS_H
#define UTILS_H

#include <stdint.h>

/* ========= VGA definitions ========= */
#define VGA_BUFFER  0x00010000u
#define VGA_WIDTH   160
#define VGA_HEIGHT  120
#define STRIPE_ROW  15

#define NUM_STRIPES   (VGA_HEIGHT / STRIPE_ROW)
#define STRIPE_PIXELS (VGA_WIDTH * STRIPE_ROW)
#define TOTAL_PIXELS  (VGA_WIDTH * VGA_HEIGHT)

/* ========= DMA register mapping ========= */
#define DMA_BASE       0xf0000000u
#define DMA_SRC_ADDR   (*(volatile uint32_t *)(DMA_BASE + 0x00u))
#define DMA_DST_ADDR   (*(volatile uint32_t *)(DMA_BASE + 0x04u))
#define DMA_LENGTH     (*(volatile uint32_t *)(DMA_BASE + 0x08u))
#define DMA_CONTROL    (*(volatile uint32_t *)(DMA_BASE + 0x0cu))
#define DMA_STATUS     (*(volatile uint32_t *)(DMA_BASE + 0x10u))
#define DMA_BYTES_DONE (*(volatile uint32_t *)(DMA_BASE + 0x14u))

#define DMA_CONTROL_START  (1u << 0)
#define DMA_CONTROL_IRQ_EN (1u << 1)
#define DMA_STATUS_BUSY    (1u << 0)
#define DMA_STATUS_DONE    (1u << 1)

/* ========= Color table ========= */
/* red, green, blue, yellow, magenta, cyan, white, black */
static const uint32_t COLORS[8] = {
  0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00,
  0xFF00FF, 0x00FFFF, 0xFFFFFF, 0x000000
};

/* ========= Helper functions ========= */

/* Draw one color stripe (STRIPE_ROW rows × VGA_WIDTH columns) */
static void draw_stripe(uint32_t *buffer, uint32_t color) {
  for (int i = 0; i < STRIPE_ROW; i++) {
    for (int j = 0; j < VGA_WIDTH; j++) {
      buffer[i * VGA_WIDTH + j] = color;
    }
  }
}

#endif /* UTILS_H */
```

### `vga_dma.c`

<a id="code-vga-dma-c"></a>

```c
#include <stdint.h>

#define VGA_BUFFER 0x00010000
#define VGA_WIDTH 160
#define VGA_HEIGHT 120
#define STRIPE_ROW 15

const uint32_t NUM_STRIPES = VGA_HEIGHT / STRIPE_ROW;
const uint32_t STRIPE_PIXELS = VGA_WIDTH * STRIPE_ROW;
const uint32_t TOTAL_PIXELS = VGA_WIDTH * VGA_HEIGHT;

#define DMA_BASE 0xf0000000
#define DMA_SRC_ADDR (*(volatile uint32_t *)(DMA_BASE + 0x00))
#define DMA_DST_ADDR (*(volatile uint32_t *)(DMA_BASE + 0x04))
#define DMA_LENGTH (*(volatile uint32_t *)(DMA_BASE + 0x08))
#define DMA_CONTROL (*(volatile uint32_t *)(DMA_BASE + 0x0c))
#define DMA_STATUS (*(volatile uint32_t *)(DMA_BASE + 0x10))
#define DMA_BYTES_DONE (*(volatile uint32_t *)(DMA_BASE + 0x14))

#define DMA_CONTROL_START ((1 << 0))
#define DMA_CONTROL_IRQ_EN ((1 << 1))
#define DMA_STATUS_BUSY ((1 << 0))
#define DMA_STATUS_DONE ((1 << 1))

// colors for the stripes
// red, green, blue, yellow, magenta, cyan, white, black
const uint32_t COLORS[8] = {0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00,
                            0xFF00FF, 0x00FFFF, 0xFFFFFF, 0x000000};

// draw a stripe of a given color
void draw_stripe(uint32_t *buffer, uint32_t color) {
  for (int i = 0; i < STRIPE_ROW; i++) {
    for (int j = 0; j < VGA_WIDTH; j++) {
      buffer[i * VGA_WIDTH + j] = color;
    }
  }
}

void copy_pixels_cpu(uint32_t *dst, uint32_t *src, uint32_t pixels) {
  for (int i = 0; i < pixels; i++) {
    *dst++ = *src++;
  }
}

void copy_pixels_dma_poll(uint32_t *dst, uint32_t *src, uint32_t pixels) {
  DMA_SRC_ADDR = (uint32_t)(uintptr_t)src;
  DMA_DST_ADDR = (uint32_t)(uintptr_t)dst;
  DMA_LENGTH = pixels * sizeof(uint32_t); // in bytes
  DMA_CONTROL = DMA_CONTROL_START & ~DMA_CONTROL_IRQ_EN;
  // wait for the DMA to finish
  while (DMA_STATUS & DMA_STATUS_BUSY) {
    // busy wait for ~60 cycles
    for (int i = 0; i < 20; i++) {
      asm volatile("nop");
    }
  }
  return;
}

void shift_stripes_up(uint32_t *buffer, int use_dma) {
  void (*copy_func)(uint32_t *, uint32_t *, uint32_t) =
      use_dma ? copy_pixels_dma_poll : copy_pixels_cpu;
  // store the first STRIPE_ROW rows in a temporary buffer after the main buffer
  uint32_t *tmp =
      (uint32_t *)((uintptr_t)VGA_BUFFER + TOTAL_PIXELS * sizeof(uint32_t));
  // copy the first STRIPE_ROW rows to the temporary buffer
  copy_func(tmp, buffer, STRIPE_PIXELS);
  // shift the stripes up
  copy_func(buffer, buffer + STRIPE_PIXELS, TOTAL_PIXELS - STRIPE_PIXELS);
  // copy the temporary buffer back to the last STRIPE_ROW rows
  copy_func(buffer + (TOTAL_PIXELS - STRIPE_PIXELS), tmp, STRIPE_PIXELS);
}

int main() {
  uint32_t *buffer = (uint32_t *)VGA_BUFFER;
  // draw rainbow stripes with 8 colors, each spanning STRIPE_ROW
  for (int i = 0; i < NUM_STRIPES; i++) {
    draw_stripe(buffer + i * STRIPE_PIXELS, COLORS[i % 8]);
  }
  // shift the stripes up using CPU
  shift_stripes_up(buffer, 0);
  // shift the stripes up using DMA
  for (int i = 0; i < 8; i++) {
    shift_stripes_up(buffer, 1);
  }
  // wait forever
  while (1);
}
```

### `start.s`

<a id="code-dma-start-s"></a>

```asm
    .section .bss.stack
    .align  4
_stack:
    .space  1024
_stack_top:

    .section .text._start
    .globl  _start
_start:
    la      sp, _stack_top
    call    main
_loop:
    j       _loop
```

### `link.ld`

<a id="code-dma-link-ld"></a>

```text
ENTRY(_start)

SECTIONS
{
  . = 0x00000000;
  .text : {
    KEEP(*(.text._start))
    *(.text*)
  }
  .rodata : { *(.rodata*) }
  .data   : { *(.data*) }
  .bss    : { *(.bss*) *(COMMON) }
}
```

Build command:

```bash
riscv64-unknown-elf-gcc -march=rv32im -mabi=ilp32 \
  -ffreestanding -nostdlib -nostartfiles \
  -Wl,-T,link.ld \
  -O2 -o vga_dma.elf start.s vga_dma.c
```
