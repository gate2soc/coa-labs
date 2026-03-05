---
title: "Chapter 8 — Cache"
---

A cache reduces the CPU–main-memory speed gap by exploiting **temporal locality** and **spatial locality**. It can significantly reduce average memory access latency without changing program semantics.

Cache performance depends not only on capacity but also on microarchitectural choices such as:

- mapping strategy (direct-mapped / set-associative / fully associative)
- write policy (write-through vs write-back)
- replacement policy (LRU vs random)

This chapter uses Ripes’ visual cache simulator to observe fills, hits, evictions, dirty bits, and write-backs under representative access patterns.
