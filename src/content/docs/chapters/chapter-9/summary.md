---
title: "Summary"
---

This chapter covered how CPUs interact with peripherals:

- **MMIO** maps device registers into the address space so loads/stores can access devices.
- **Polling** is simple but wastes CPU time.
- **Interrupts** improve CPU utilization by servicing events on demand, typically via a PLIC.
- **DMA** offloads bulk data movement to hardware for high-throughput I/O.

The core trade-off is between hardware complexity and CPU efficiency/throughput.
