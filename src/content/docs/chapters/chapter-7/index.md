---
title: "Chapter 7 — Memory Expansion & Error Checking"
---

In earlier labs you used memory blocks (e.g., Logisim RAM) that already had convenient capacity and bus width. Real systems, however, are built from many memory chips that are **capacity-limited**, **bus-width-limited**, and **not perfectly reliable**.

From an engineering perspective, main memory design must address at least:

- **Capacity expansion**: combining multiple chips into one continuous logical address space using address partitioning and chip-select logic.
- **Data-width matching**: providing a full CPU word (e.g., 32/64 bits) even if each chip only provides 4/8/16 bits per access.
- **Reliability**: detecting and sometimes correcting bit errors using redundancy (parity, ECC).

This chapter follows two threads:

1. How to build the required size and access capability (chip organization + mapping)
2. How to improve reliability (error checking/correction, including Hamming codes)
