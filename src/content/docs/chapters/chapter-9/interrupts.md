---
title: "Interrupt-Driven I/O"
---

Polling wastes CPU time when events are rare. **Interrupts** let the device notify the CPU only when service is needed.

High-level flow:

1. CPU runs the main program.
2. Device raises an interrupt request when ready (new input, TX space, etc.).
3. CPU finishes the current instruction, then enters an interrupt handler.
4. Handler saves context, services the device, and returns.

A key design pattern:

- ISR: do minimal data movement (FIFO ↔ software buffer)
- Main loop: process data from/to the software buffer

## PLIC (Platform-Level Interrupt Controller)

RISC-V uses a PLIC for external interrupts.

<a id="tab-plic-role"></a>

| Component | Responsibility | Example |
|---|---|---|
| Device | raise interrupt request | UART receives a byte |
| PLIC | collect pending requests, prioritize, notify hart | select which IRQ to deliver |
| CPU (hart) | handle interrupt, then complete | claim ID, service, complete ID |

*Table 9.4: Roles in an interrupt system with a PLIC.*

<a id="tab-plic-map"></a>

| Block | Typical offset (relative to PLIC base) | Notes |
|---|---:|---|
| Priority | 0x000000… | one register per interrupt source ID |
| Pending | 0x001000… | read-only bitmap |
| Enable | 0x002000… (per context) | bitmap enabling sources to a context |
| Threshold | 0x200000… (per context) | filters priorities ≤ threshold |
| Claim/Complete | 0x200004… (per context) | read to claim ID (clears pending); write ID to complete |

*Table 9.5: Typical PLIC register blocks.*

## Experiment: Interrupt-driven UART I/O

### Objectives

- Understand interrupt-driven I/O flow.
- Configure PLIC (priority/enable/threshold + claim/complete).
- Separate ISR vs main-loop responsibilities.

### Environment

- Simulator: Logisim Evolution
- Toolchain: `riscv64-unknown-elf-gcc`

### Task 1: Echo directly inside the ISR

Set the UART read interrupt threshold to 8 (interrupt on any received byte).

Fill the TODOs:

<a id="code-uart-irq-task1"></a>

```c
#include "utils.h"

static void irq_init(void) {
  UART_CTRL |= UART_CTRL_RE;

  /* TODO: configure PLIC — enable UART interrupt source, set threshold to 0 */

  csr_set_mie_meie();
  csr_set_mstatus_mie();
}

void trap_handler(void *trap_frame, uint32_t mcause) {
  if ((mcause >> 31) && ((mcause & 0x7FFFFFFFu) == 11u)) {
    /* TODO: claim interrupt ID from PLIC */

    /* TODO: if source is UART: read UART_DATA, check VALID, echo with uart_putc */

    /* TODO: complete interrupt ID to PLIC */
  }
}

int main(void) {
  irq_init();
  for (;;) { }
}
```

*Code 9.3: Task 1 skeleton (`uart_irq_task1.c`).*

### Task 2: Buffer input with a ring queue

Set the UART read interrupt threshold back to 0 (interrupt only when RX FIFO is full). ISR should drain all available bytes into a queue; main loop pops and echoes.

<a id="code-uart-irq-task2"></a>

```c
#define USE_RX_QUEUE
#include "utils.h"

static void irq_init(void) {
  UART_CTRL |= UART_CTRL_RE;

  /* TODO: configure PLIC — enable UART interrupt source, set threshold to 0 */

  csr_set_mie_meie();
  csr_set_mstatus_mie();
}

void trap_handler(void *trap_frame, uint32_t mcause) {
  if ((mcause >> 31) && ((mcause & 0x7FFFFFFFu) == 11u)) {
    /* TODO: claim interrupt ID from PLIC */

    /* TODO: if UART: loop reading UART_DATA; if VALID push into rx_queue; stop when invalid */

    /* TODO: complete interrupt ID to PLIC */
  }
}

int main(void) {
  g_rx_head = 0u;
  g_rx_tail = 0u;
  irq_init();

  for (;;) {
    /* TODO: if queue not empty, pop and echo with uart_putc */
  }
}
```

*Code 9.4: Task 2 skeleton (`uart_irq_task2.c`).*

### Results

- Completed code for both tasks.
- Terminal screenshots comparing behavior under different thresholds/strategies.
