---
title: "Summary"
---

This chapter introduced cache structure and key policies:

- Mapping strategies (direct-mapped, set-associative, fully associative) trade off hardware complexity, hit rate, and latency.
- Write policies (write-through vs write-back) change how stores propagate and how dirty/writeback works.
- Replacement policies (LRU vs random) affect eviction behavior and hit rate; no policy is universally optimal.

The key skill is to connect **access patterns → cache structure → observable hit/miss/eviction behavior → performance statistics**.
