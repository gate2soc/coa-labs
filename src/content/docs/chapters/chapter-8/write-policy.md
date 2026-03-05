---
title: "Write Policy"
---

On a store (e.g., `sw`), the cache must decide how to update cache and memory. Common combinations:

- **Write-through + no-write-allocate**
  - write hit: update cache and memory
  - write miss: write memory only (do not bring block into cache)

- **Write-back + write-allocate**
  - write hit: update cache only, set dirty bit (D=1)
  - write miss: allocate (bring block in) then write
  - eviction of a dirty line triggers a write-back

Note: Ripes may still show memory updates in the memory view even under write-back (for debugging), but it will count **Writebacks** according to write-back logic.

## Experiment: Dirty bit and write-back observation

### Objectives

- Compare write-through vs write-back behavior.
- Observe dirty bit set/clear and writeback triggers.

### Environment

- Simulator: Ripes
- CPU model: Single-Cycle Processor

### Principles

Write-back delays memory updates to reduce memory traffic. Dirty bit indicates modified-but-not-written-back cache lines.

### Procedure

Program (write A to make it dirty; fill other sets; then force a conflict eviction of A to trigger a writeback):

```asm
    li   t0, 0x1000  # A (maps to Set0 in this config)
    li   t1, 100

    # Step 1: store to A
    sw   t1, 0(t0)

    # Step 2: fill other sets by stepping one cache line each time (+8 bytes)
    li   t2, 0x3008
    li   t3, 7
fill_sets:
    lw   s0, 0(t2)
    addi t2, t2, 8
    addi t3, t3, -1
    bnez t3, fill_sets

    # Step 3: access A' mapping to the same set but different tag (A' = A + 64)
    li   t4, 64
    add  t5, t0, t4
    lw   s1, 0(t5)

end:
    j    end
```

Cache settings:

- Sets = 8 ($2^N$ Sets = 3)
- Ways = 1 (direct-mapped)
- Words/Line = 2 ($2^N$ Words/Line = 1) → 8 bytes/line
- Write policy: **Write-back / Write-allocate**

Observe:

1. After `sw`, does the line load and does D become 1?
2. During `fill_sets`, how do D and Writebacks behave?
3. On the final `lw` from A', does Writebacks increase (A evicted)?

Then repeat with **Write-through / Write-no-allocate** and compare (D bit, writeback behavior).

### Results

- Screenshot after the `sw` showing D=1.
- Screenshot after the conflict access showing Writebacks increment.
- A comparison summary between the two policies.

### Questions

1. Under write-back, why might 100 consecutive `sw` to the same address still produce 0 writebacks?
2. Why is write-back often preferred for performance?
3. Why does `fill_sets` increment by 8 bytes each iteration?
