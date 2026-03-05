---
title: "Replacement Policy"
---

In set-associative or fully associative caches, a miss may occur when the target set is full. The cache must choose a victim line to evict.

Ripes supports common policies:

- **LRU (least recently used)**: evict the line not used for the longest time.
- **Random**: evict a randomly chosen line.

LRU exploits temporal locality but can exhibit deterministic pathological behavior for certain cyclic access patterns.

## Experiment: LRU vs Random

### Objectives

- Understand LRU and Random replacement.
- Observe LRU state updates.
- Construct an access pattern that defeats LRU.

### Environment

- Simulator: Ripes
- CPU model: Single-Cycle Processor

### Principles

Access 5 distinct addresses in a loop using a cache with only 4 lines (fully associative: 1 set, 4 ways). With LRU, each miss may evict the line that will be used next, leading to steady-state 0% hit rate.

### Procedure

Program:

```asm
    li   t0, 0x1000    # A
    li   t1, 0x2000    # B
    li   t2, 0x3000    # C
    li   t3, 0x4000    # D
    li   t4, 0x5000    # E

    li   t6, 10
loop:
    lw   s0, 0(t0)
    lw   s1, 0(t1)
    lw   s2, 0(t2)
    lw   s3, 0(t3)
    lw   s4, 0(t4)
    addi t6, t6, -1
    bnez t6, loop

end:
    j    end
```

Cache settings:

- Sets = 1 (i.e., $2^N$ Sets = 0)
- Ways = 4
- Words/Line = 1
- Replacement policy: run twice with **LRU** and **Random**

### Results

- Under LRU: record tag + LRU field changes during the first 6 accesses (table form).
- Total Hits/Misses for LRU vs Random.
- A screenshot of the hit-rate curve under LRU steady state.

### Questions

1. Why can steady-state hit rate be 0 under LRU for 5-address cycling with a 4-line cache?
2. With Ways=4, what does an LRU field value of 3 mean? When will it be evicted?
3. Give an access pattern where Random might outperform LRU on average, and explain why.
