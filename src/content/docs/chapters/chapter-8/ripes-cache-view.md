---
title: "Ripes Cache View & Config"
---

Ripes provides a configurable and visual cache simulator. By changing cache parameters and running small programs, you can observe hits/misses, fills, evictions, and statistics.

## Cache configuration parameters

<a id="fig-ripes-cache-config"></a>

![Ripes cache configuration](/images/chap08/ripes-cache-config.png)

*Figure 8.5: Cache configuration parameters in Ripes.*

Key parameters:

- $2^N$ **Sets**: number of sets
- **Ways**: associativity
- $2^N$ **Words per Line**: words per cache line (block size)

Typical mappings (let $B$ be number of blocks and $N$ be associativity):

<a id="tab-ripes-cache-mapping"></a>

| Mapping | $2^N$ Sets | Ways | $2^N$ Words/Line |
|---|---:|---:|---:|
| Direct-mapped | $\log_2 B$ | 1 | $2^M$ |
| $N$-way set-assoc | $\log_2 (B/N)$ | $N$ | $2^M$ |
| Fully assoc | 0 | $B$ | $2^M$ |

*Table 8.1: Typical Ripes cache parameter settings for common mappings (block size chosen as needed).*

## Cache View

<a id="fig-ripes-cache-view"></a>

![Ripes cache view](/images/chap08/ripes-cache-view.png)

*Figure 8.6: Ripes Cache View.*

Cache View shows sets/ways/lines and state bits:

- **V** (valid)
- **D** (dirty, for write-back)
- **Tag**
- **Words** in the line

When using LRU with associativity > 1, an **LRU field** appears to indicate relative recency.

Ripes highlights accesses:

- yellow: candidate lines in the indexed set
- green: hit
- red: miss
- blue: dirty line (write-back)

Hovering shows the corresponding memory address; clicking can locate it in the memory view.

## Statistics and plots

<a id="fig-ripes-cache-figure"></a>

![Ripes cache statistics and plot view](/images/chap08/ripes-cache-figure.png)

*Figure 8.7: Cache statistics and plotting in Ripes.*

Common counters:

- Reads, Writes
- Hits, Misses
- Writebacks (write-back mode)
- Access count

You can plot ratios such as Hit rate = Hits / Access count (optionally with moving average).

## Experiment: Cache mapping behavior

### Objectives

- Observe behavior under different mappings.
- Compare hit rates under direct-mapped / set-assoc / fully-assoc.
- Understand the impact of words/line and associativity.

### Environment

- Simulator: Ripes
- CPU model: Single-Cycle Processor

### Task 1: Sequentially read 128 integers

Program:

```asm
    li   t0, 0
    li   t1, 128

loop:
    lw   t2, 0(t0)
    addi t0, t0, 4
    addi t1, t1, -1
    bnez t1, loop

end:
    j    end
```

Run with:

- Words/Line = 1 and 2
- For each block size:
  - direct-mapped (total 64 words)
  - 2-way set-assoc (total 64 words)
  - fully-assoc (total 8 words)

Record hit rate and observe fills/evictions.

### Task 2: Two-phase access patterns

Use the two-phase program from the manual (phase 1: repeated range; phase 2: alternating two ranges). Vary Words/Line = 2 and 4 and compare mappings.

### Results

- Hit-rate statistics for both tasks and all configurations.
- Hit-rate curve for Task 2.
- At least one Cache View screenshot explaining a representative hit/miss behavior.

### Questions

1. In Task 1 with Words/Line = 1, why might the hit rate be 0 for sequentially reading 128 integers?
2. Must Ways be a power of two? Why?
3. Why does increasing Words/Line change hit rate in Task 1?
4. How do phase 1 and phase 2 differ, and how is that reflected in hit-rate curves?
