---
title: "Mapping Strategies (Basics)"
---

To describe a cache, common parameters include:

- Capacity $C$ (bytes)
- Block size $b$ (bytes per block)
- Number of blocks $B=C/b$
- Number of sets $S$
- Associativity (ways) $N=B/S$

A cache is organized as: sets → ways → lines (each line holds one block plus metadata such as valid/dirty/tag).

Different structures are essentially different choices of $S$ and $N$:

- **Direct-mapped**: $N=1$
- **$N$-way set-associative**: $N>1$
- **Fully associative**: $S=1$

## Direct-mapped

In direct-mapped caches, each set has exactly one line.

<a id="fig-mem-addr-direct"></a>

![Direct-mapped address partition example](/images/chap08/mem-addr-direct.png)

*Figure 8.1: Example address partitioning for a direct-mapped cache.*

<a id="fig-direct-mapped-cache"></a>

![Direct-mapped cache structure example](/images/chap08/direct-mapped-cache.png)

*Figure 8.2: Example direct-mapped cache structure (V = valid).*

## Set-associative

In an $N$-way set-associative cache, a memory block maps to **one set**, but may occupy **any way** within that set. Tags for all ways in the set are compared in parallel.

<a id="fig-set-assoc-cache"></a>

![2-way set-associative cache structure example](/images/chap08/set-assoc-cache.png)

*Figure 8.3: Example 2-way set-associative cache structure.*

## Fully associative

Fully associative is the extreme: $S=1$ and $N=B$. Any block may be placed in any line; there is no set index field.

<a id="fig-full-assoc-cache"></a>

![Fully associative cache structure example](/images/chap08/full-assoc-cache.png)

*Figure 8.4: Example fully associative cache structure.*
