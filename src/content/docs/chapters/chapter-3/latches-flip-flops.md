---
title: "Latches and Flip-Flops"
---

“State” is the internal information a circuit holds at a particular time. In sequential logic, outputs depend on both inputs and stored state. The fundamental storage structure is a **bistable** circuit with two stable states.

In practice, bistable storage is abstracted into two basic memory elements:

- **Latch**: level-sensitive
- **Flip-flop**: edge-triggered

They form the basis of registers, counters, and state machines.

<a id="fig-dlatch-symbol"></a>

![D latch symbol](/images/chap03/dlatch.png)

*Figure 3.1: D latch symbol.*

<a id="fig-dff-symbol"></a>

![D flip-flop symbol](/images/chap03/dff.png)

*Figure 3.2: D flip-flop symbol.*

## Latch

A latch is level-sensitive. Its typical behavior is:

- When enable is active ($EN = 1$), output follows input: $Q = D$.
- When enable is inactive ($EN = 0$), output is latched and holds its previous value.

Some references use $CLK$ to mean enable. This manual uses $EN$ to emphasize level sensitivity.

Latches are simple and have small delay, but if enable remains active too long, input glitches may propagate to output and cause hazards.

## Flip-flop

To avoid the uncertainty of level sensitivity, synchronous digital systems commonly use **edge-triggered flip-flops**. A flip-flop samples input only at a clock edge (rising or falling), and holds output stable between edges.

For a D flip-flop:

- At the clock edge, $Q$ updates to the current $D$.
- Between edges, $Q$ is unaffected by changes on $D$.

This discrete, synchronized state update makes flip-flops the preferred elements for program counters, general-purpose registers, and pipeline registers.

## Experiment: Level-triggered vs edge-triggered behavior

### Objectives

- Understand the essential difference between level-triggering and edge-triggering.
- Observe how a latch and a flip-flop respond to changing inputs.
- Build intuition for clock–state–synchronization.

### Principles

A latch is sensitive to the enable level; a flip-flop samples only at clock edges.

Logisim Evolution does not directly provide a D latch, so in this experiment you will build a D latch using basic gates. See [Figure 3.3](#fig-d-latch-circuit).

<a id="fig-d-latch-circuit"></a>

![D latch gate-level circuit](/images/chap03/d-latch.png)

*Figure 3.3: Gate-level D latch circuit.*

### Environment

- Simulator: Logisim Evolution

### Task 1: Build a D latch and observe behavior

1. **Inputs/outputs**
   - Place two input pins: $D$ and $EN$.
   - Place two output pins: $Q$ and $\overline{Q}$ (label it nQ), set them as outputs.
2. **Generate $\overline{D}$**
   - Place a NOT gate and connect $D$ to get $\overline{D}$.
3. **Build the gated signals and cross-coupled NAND latch**
   - Place four NAND gates and wire them according to [Figure 3.3](#fig-d-latch-circuit).
4. **Verify and observe**
   - Set $EN=1$, toggle $D$ (0→1→0) and check whether $Q$ follows **immediately**.
   - Set $EN=0$, toggle $D$ again and check whether $Q$ holds the value latched when $EN$ switched 1→0.
   - Tip: if the state becomes abnormal due to wiring order, use **Simulate → Reset Simulation**.

### Task 2: Observe D flip-flop behavior

1. **Inputs/outputs and clock**
   - Place input pin $D$ and output pin $Q$.
   - Place a **Clock** component as the clock source.
2. **Place a D flip-flop and connect clock**
   - In Memory, place a D flip-flop.
   - Connect the clock output to the flip-flop’s CLK pin (triangle-marked).
3. **Connect data path**
   - Wire $D$ to the flip-flop’s D pin.
   - Wire flip-flop Q to output pin $Q$.
4. **Verify and observe**
   - Toggle $D$ multiple times **between two clock edges** and check whether $Q$ stays unchanged.
   - Trigger one clock edge and check whether $Q$ updates to the value of $D$ **at that edge**.
   - Tip: use a low clock frequency to make edge sampling easier to observe.

### Results

- Circuit screenshots.
- A table/notes comparing:
  - how $Q$ responds to $D$ for a D latch with $EN=1$ vs $EN=0$;
  - how $Q$ updates for a D flip-flop before/after clock edges.
- Write the truth tables for the D latch and D flip-flop and summarize (in your own words) the key difference between level-triggering and edge-triggering. Explain which is more suitable for synchronous register design.

### Question

- Why do CPUs almost never use level-triggered latches directly as general-purpose register storage elements?

### Extension

Read the Logisim Evolution documentation and draw timing diagrams for the D latch and D flip-flop.

## Experiment: 4-bit synchronous parallel register

### Objectives

- Understand the structure of a parallel register.
- Understand the role of a synchronous clock.
- Build a multi-bit register using D flip-flops.
- Implement a load-enable (write-enable) control.
- Understand the purpose of asynchronous reset for initialization.

### Principles

1) **Parallel register structure**

An $n$-bit register is built from $n$ D flip-flops in parallel. All bits share the same clock so the state updates synchronously.

2) **Load enable**

To hold the current value when desired, place a 2-to-1 MUX in front of each flip-flop to select between “keep old value” (feedback) and “load new value”.

3) **Asynchronous reset**

Asynchronous reset clears the register to zero without relying on the clock.

### Environment

- Simulator: Logisim Evolution

### Task 1: Basic parallel register

1. Place four D flip-flops (name them bit0…bit3).
2. Add one clock and connect it to all four flip-flops.
3. Place four input pins: $D_0, D_1, D_2, D_3$ and connect them to the corresponding D inputs.
4. Place four output pins: $Q_0, Q_1, Q_2, Q_3$ and connect them to the corresponding Q outputs.

<a id="fig-reg-basic"></a>

![Basic parallel register circuit](/images/chap03/reg-1.png)

*Figure 3.4: Basic 4-bit parallel register circuit.*

5. Verify by setting inputs (e.g. 1010), triggering clock edges, and observing outputs update.

### Task 2: Register with load enable

Add a global control signal $Load$ and place a 2-to-1 MUX before each flip-flop:

- MUX input 0: feedback from current $Q_i$ (hold)
- MUX input 1: external $D_i$ (load)
- MUX select: $Load$

<a id="fig-reg-load"></a>

![Register with load enable](/images/chap03/reg-2.png)

*Figure 3.5: 4-bit register with load-enable using MUX feedback.*

Verify:

- $Load=1$: outputs update on clock edge.
- $Load=0$: outputs hold their values across clock edges.

### Task 3: Asynchronous reset

Add a global reset signal $Reset$ and connect it to the clear/reset pins of all flip-flops.

<a id="fig-reg-reset"></a>

![Register with async reset](/images/chap03/reg-3.png)

*Figure 3.6: 4-bit register with asynchronous reset.*

Verify that toggling $Reset$ clears outputs to 0000 **immediately**, even without a clock edge.

### Results

- Circuit screenshots.
- Verification screenshots + brief analysis for:
  1. Write: $Load=1$ writes on clock edge.
  2. Hold: $Load=0$ holds across edges.
  3. Reset: $Reset$ clears immediately.

### Questions

1. To extend this to an 8-bit register, what changes are required (flip-flop count, MUX count, I/O widths, etc.)?
2. When $Load=0$, why is the value “locked” in the register? Explain using the MUX feedback path.
3. Where does the “asynchronous” nature of async reset show up? How would you implement a *synchronous* reset?
