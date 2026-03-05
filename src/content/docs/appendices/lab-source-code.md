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

/* ========= 外设与 PLIC 基址 ========= */
#define JTAG_UART_BASE 0x60000u
#define PLIC_BASE      0xc000000u

#define UART_DATA (*(volatile uint32_t *)(JTAG_UART_BASE + 0u))
#define UART_CTRL (*(volatile uint32_t *)(JTAG_UART_BASE + 4u))

#define UART_CTRL_RE    (1u << 0)   /* 读中断使能 */
#define UART_DATA_VALID (1u << 15)  /* Data 寄存器读取有效位 */

#define UART_IRQ_ID     1u          /* UART 在 PLIC 中的中断源编号 */
#define PLIC_ENABLE     (*(volatile uint32_t *)(PLIC_BASE + 0x2000u))
#define PLIC_THRESHOLD  (*(volatile uint32_t *)(PLIC_BASE + 0x200000u))
#define PLIC_CLAIM      (*(volatile uint32_t *)(PLIC_BASE + 0x200004u))

/* ========= CSR 最小访问 ========= */
static inline void csr_set_mstatus_mie(void) {
  __asm__ volatile ("csrs mstatus, %0" :: "r"(0x8u));
}
static inline void csr_set_mie_meie(void) {
  __asm__ volatile ("csrs mie, %0" :: "r"(1u << 11));
}

/* ========= 输出：仍用轮询方式 ========= */
static inline int uart_can_write(void) {
  return ((UART_CTRL >> 16) & 0xFFFFu) != 0u;
}
static void uart_putc(uint8_t ch) {
  while (!uart_can_write()) { }
  UART_DATA = (uint32_t)ch;
}

/* ========= 循环队列（仅在定义 USE_RX_QUEUE 时启用） ========= */
#ifdef USE_RX_QUEUE

#define RX_QUEUE_SIZE  32u                /* 必须是 2 的幂 */
#define RX_QUEUE_MASK  (RX_QUEUE_SIZE - 1u)

static volatile uint8_t  g_rx_queue[RX_QUEUE_SIZE];
static volatile uint32_t g_rx_head;  /* 读指针（主程序读取） */
static volatile uint32_t g_rx_tail;  /* 写指针（ISR 写入） */

/* ISR 调用：将一个字符写入队列 */
static void rx_push(uint8_t ch) {
  uint32_t next = (g_rx_tail + 1u) & RX_QUEUE_MASK;
  if (next == g_rx_head) {
    /* 队列已满，覆盖最旧的字符 */
    g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
  }
  g_rx_queue[g_rx_tail] = ch;
  g_rx_tail = next;
}

/* 主程序调用：从队列中取出一个字符，成功返回 1 */
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

/* ========= 1) 外设与 PLIC 基址（按你的 SoC 填写） ========= */
#define JTAG_UART_BASE    0x60000u
#define PLIC_BASE         0xc000000u
#define PLIC_PENDING_WORD (*(volatile uint32_t *)(PLIC_BASE + 0x1000u))
#define PLIC_ENABLE_WORD  (*(volatile uint32_t *)(PLIC_BASE + 0x2000u))
#define PLIC_THRESHOLD    (*(volatile uint32_t *)(PLIC_BASE + 0x200000u))
#define PLIC_CLAIM        (*(volatile uint32_t *)(PLIC_BASE + 0x200004u))

/* JTAG UART 在 PLIC 中的中断源编号（按你的 SoC/PLIC 分配填写） */
#define UART_IRQ_ID    (1u)

/* ========= 2) JTAG UART MMIO ========= */
#define UART_DATA (*(volatile uint32_t *)(JTAG_UART_BASE + 0u))
#define UART_CTRL (*(volatile uint32_t *)(JTAG_UART_BASE + 4u))

#define UART_CTRL_RE     (1u << 0)    /* 读中断使能 */
#define UART_DATA_VALID  (1u << 15)   /* Data 读取有效位 */

/* ========= 3) PLIC =========*/

static inline void plic_init_for_uart(void) {
  /* 使能该中断源 */
  PLIC_ENABLE_WORD |= (1u << (UART_IRQ_ID % 32u));

  /* threshold=0：允许所有优先级>0 的中断进入 */
  PLIC_THRESHOLD = 0u;
}

/* ========= 4) CSR 最小访问 ========= */
static inline void csr_write_mtvec(uint32_t v) {
  __asm__ volatile ("csrw mtvec, %0" :: "r"(v));
}
static inline void csr_set_mstatus_mie(void) {
  /* mstatus.MIE = 1 */
  __asm__ volatile ("csrs mstatus, %0" :: "r"(0x8u));
}
static inline void csr_set_mie_meie(void) {
  /* mie.MEIE = 1（机器态外部中断使能） */
  __asm__ volatile ("csrs mie, %0" :: "r"(1u << 11));
}

/* ========= 5) 输出：仍用轮询（规模可控，结构更清晰） ========= */
static inline int uart_can_write(void) {
  /* WSPACE = UART_CTRL[31:16] */
  uint32_t wspace = (UART_CTRL >> 16) & 0xFFFFu;
  return (wspace != 0u);
}

static void uart_putc(uint8_t ch) {
  while (!uart_can_write()) { }
  UART_DATA = (uint32_t)ch;
}

/* ========= 6) ISR 与主程序之间的循环队列通信 ========= */
/* 循环队列大小（必须是 2 的幂，便于取模优化） */
#define RX_QUEUE_SIZE  32u
#define RX_QUEUE_MASK  (RX_QUEUE_SIZE - 1u)

/* 循环队列：用于缓冲多个接收到的字符 */
static volatile uint8_t  g_rx_queue[RX_QUEUE_SIZE];
static volatile uint32_t g_rx_head;  /* 读指针（主程序从此处读取） */
static volatile uint32_t g_rx_tail;  /* 写指针（ISR 从此处写入） */

/* ========= 7) 中断处理：用 PLIC claim/complete 获取中断源 ========= */
void trap_handler(void *trap_frame, uint32_t mcause) {
  /* 最高位=1 表示中断；原因号 11 表示机器态外部中断 */
  if ((mcause >> 31) && ((mcause & 0x7FFFFFFFu) == 11u)) {

    uint32_t irq = PLIC_CLAIM;   /* claim：得到中断源编号 */

    if (irq == UART_IRQ_ID) {
      /* 循环读取 UART 缓冲区中的所有数据，直到缓冲区为空 */
      for (;;) {
        uint32_t v = UART_DATA;
        /* 检查数据是否有效 */
        if (!(v & UART_DATA_VALID)) {
          /* 数据无效，说明缓冲区已空，退出循环 */
          break;
        }
        /* 提取字符 */
        uint8_t ch = (uint8_t)(v & 0xFFu);
        /* 计算下一个写位置 */
        uint32_t next_tail = (g_rx_tail + 1u) & RX_QUEUE_MASK;
        /* 检查队列是否已满（如果下一个写位置等于读位置，说明队列已满） */
        if (next_tail == g_rx_head) {
          /* 队列已满，移动读指针以覆盖最旧的字符 */
          g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
        }
        /* 写入字符（无论队列是否已满都写入） */
        g_rx_queue[g_rx_tail] = ch;
        g_rx_tail = next_tail;  /* 更新写指针 */
      }
    }

    /* complete：写回同一个编号 */
    PLIC_CLAIM = irq;
    return;
  }

  /* 其他异常/中断：本实验不处理 */
}

/* ========= 8) 初始化：mtvec + CPU 中断 + PLIC + UART ========= */
static void uart_enable_rx_irq(void) {
  UART_CTRL = UART_CTRL | UART_CTRL_RE;
}

static void irq_init(void) {
  /* PLIC：设置优先级、使能位、阈值 */
  plic_init_for_uart();
  /* CPU：外部中断 + 全局中断 */
  csr_set_mie_meie();
  csr_set_mstatus_mie();
  /* UART：开启读中断 */
  uart_enable_rx_irq();
}

int main(void) {
  /* 初始化循环队列 */
  g_rx_head = 0u;
  g_rx_tail = 0u;

  irq_init();

  for (;;) {
    /* 检查队列是否非空（如果读指针不等于写指针，说明有数据） */
    if (g_rx_head != g_rx_tail) {
      /* 从队列中读取一个字符 */
      uint8_t ch = g_rx_queue[g_rx_head];
      /* 更新读指针 */
      g_rx_head = (g_rx_head + 1u) & RX_QUEUE_MASK;
      uart_putc(ch); /* 回显 */
    }
  }
}
```

### `start.s`

Minimal startup + a full trap entry which saves context, calls `trap_handler`, then restores and returns.

<a id="code-intr-start-s"></a>

```asm
    # 用户栈
    .section .bss.stack
    .align  4
_stack:
    .space  1024
_stack_top: # 用户栈顶

    # 异常栈：用于中断处理
    .section .bss.trap_stack
    .align  4
_trap_stack:
    .space  1024
_trap_stack_top: # 异常栈顶

    # 程序入口
    .section .text._start
    .globl  _start
_start:
    # 设置用户栈顶
    la      sp, _stack_top
    # 设置 mscratch CSR 为异常栈顶
    la      t0, _trap_stack_top
    csrw    mscratch, t0
    # 设置 mtvec CSR 为异常处理入口
    la      t0, _trap_entry
    csrw    mtvec, t0
    # 调用 main 函数
    call    main
    # 陷入死循环
_loop:
    j       _loop

    # 异常处理入口
    .section .text.trap
    .align  2
_trap_entry:
    # --- 阶段 1: 交换栈顶 (Context Switch Initial) ---
    # 此时：t0 是用户的，mscratch 是异常栈顶
    csrrw   t0, mscratch, t0   
    # 此时：t0 是异常栈顶，mscratch 是用户 t0

    # 在异常栈上分配 144 字节空间 (36个4字节寄存器位)
    addi    t0, t0, -144

    # --- 阶段 2: 保存通用寄存器 ---
    # 先保存 ra 和用户的 t0 (目前在 mscratch 里)
    sw      ra, 0(t0)
    csrr    ra, mscratch       # 将用户 t0 读到 ra 中转
    sw      ra, 4(t0)          # 保存用户 t0 到偏移 4

    # 保存原始的用户栈指针 (sp)
    sw      sp, 124(t0)        # 保存用户 sp 到偏移 124

    # 此时可以安全地切换 sp 到异常栈了
    mv      sp, t0

    # 保存其余所有通用寄存器
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

    # --- 阶段 3: 保存 CSR 状态 ---
    csrr    t1, mstatus
    sw      t1, 112(sp)
    csrr    t1, mepc
    sw      t1, 116(sp)
    csrr    t1, mcause
    sw      t1, 120(sp)
    csrr    t1, mtval
    sw      t1, 128(sp)        # 额外保存 mtval，方便调试

    # --- 阶段 4: 调用 C 处理函数 ---
    # 传递参数：a0 = trap 帧的指针，a1 = mcause
    mv      a0, sp
    csrr    a1, mcause
    call    trap_handler

    # --- 阶段 5: 恢复 CSR 状态 ---
    lw      t1, 112(sp)
    csrw    mstatus, t1
    lw      t1, 116(sp)
    csrw    mepc, t1

    # --- 阶段 6: 恢复通用寄存器 ---
    # 恢复除了 sp 和 t0 以外的所有寄存器
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

    # --- 阶段 7: 安全归还栈并退出 ---
    # 1. 先把异常栈的原始位置（sp + 144）放回 mscratch，准备下次中断使用
    addi    t0, sp, 144
    csrw    mscratch, t0

    # 2. 从栈帧中读出原始的用户 t0 到 t0 寄存器
    lw      t0, 4(sp)

    # 3. 最后恢复原始用户栈 sp
    lw      sp, 124(sp)

    # 返回被中断的程序
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

/* ========= VGA 相关定义 ========= */
#define VGA_BUFFER  0x00010000u
#define VGA_WIDTH   160
#define VGA_HEIGHT  120
#define STRIPE_ROW  15

#define NUM_STRIPES   (VGA_HEIGHT / STRIPE_ROW)
#define STRIPE_PIXELS (VGA_WIDTH * STRIPE_ROW)
#define TOTAL_PIXELS  (VGA_WIDTH * VGA_HEIGHT)

/* ========= DMA 寄存器映射 ========= */
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

/* ========= 颜色表 ========= */
/* 红、绿、蓝、黄、品红、青、白、黑 */
static const uint32_t COLORS[8] = {
  0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00,
  0xFF00FF, 0x00FFFF, 0xFFFFFF, 0x000000
};

/* ========= 辅助函数 ========= */

/* 绘制一条颜色条纹（STRIPE_ROW 行 × VGA_WIDTH 列） */
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
