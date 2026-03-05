---
title: "Finite State Machines (FSM)"
---

With latches/flip-flops and registers/register files, we have the building blocks to store state. The next question is: **how does state evolve over time**, and how does a circuit make decisions based on input and current state?

A **finite state machine (FSM)** is a standard abstraction for such sequential systems. Compared with a register file (data storage), an FSM focuses on control and flow: it uses a finite set of states to represent the system’s phase, and transitions between states under a clock.

Hardware decomposition:

- **State register** (flip-flops) storing current state $S(t)$
- **Combinational logic** computing next state and outputs based on $S(t)$ and inputs $X(t)$

Core behavior:

$$S(t+1) = f(S(t), X(t))$$

Outputs:

$$
Y(t)=\begin{cases}
g(S(t)), & \text{Moore FSM}\\
g(S(t), X(t)), & \text{Mealy FSM}
\end{cases}
$$

A Moore FSM output depends only on state; a Mealy FSM output depends on both state and input.

## Experiment: Sequence detector (pattern 101)

### Objectives

- Understand how to model an FSM.
- Write a Mealy FSM state diagram and state transition/output table.
- Implement and verify a sequence detector in Logisim Evolution.

### Environment

- Simulator: Logisim Evolution

### Principles

Input is a 1-bit serial signal $A$. Output $B=1$ when the **most recent three inputs** form exactly **101**; otherwise $B=0$.

We use a **Mealy** structure so $B$ can assert immediately when the last bit is received.

### Task 1: State abstraction and state diagram

Define three states based on matched prefix:

- $S_0$: no match (no valid prefix)
- $S_1$: matched “1”
- $S_2$: matched “10”

Draw the state transition diagram.

### Task 2: State encoding and state transition/output table

Encode the 3 states using 2 bits $(Q_1Q_0)$, for example:

- $S_0=00$
- $S_1=01$
- $S_2=10$

State 11 is unused; for robustness, force it to transition unconditionally back to $S_0$.

Complete the state transition/output table below.

<a id="tab-fsm-101"></a>

| $Q_1$ | $Q_0$ | $A$ | $Q_1^+$ | $Q_0^+$ | $B$ |
|---:|---:|---:|---:|---:|---:|
| 0 | 0 | 0 |   |   |   |
| 0 | 0 | 1 |   |   |   |
| 0 | 1 | 0 |   |   |   |
| 0 | 1 | 1 |   |   |   |
| 1 | 0 | 0 |   |   |   |
| 1 | 0 | 1 |   |   |   |
| 1 | 1 | 0 |   |   |   |
| 1 | 1 | 1 |   |   |   |

*Table 3.1: State transition and output table for a 101 sequence detector.*

### Task 3: Derive logic equations and build the circuit

Use D flip-flops for the state register:

- $D_1 = Q_1^+$
- $D_0 = Q_0^+$

Derive boolean expressions for $D_1$, $D_0$, and $B$ based on [Table 3.1](#tab-fsm-101), then implement the circuit in Logisim Evolution.

### Task 4: Verification

Manually set $A$ and toggle the clock to generate rising edges. Verify with sequences such as:

- $A=1,0,1$: $B$ should be 1 on the third tick.
- $A=1,0,1,0,1$: $B$ should assert twice.
- $A=0,0,1,0,1,1$: $B$ is 1 only on the tick that completes “101”.

### Results

- State diagram, completed [Table 3.1](#tab-fsm-101), and expressions for $D_1$, $D_0$, and $B$.
- Circuit screenshot (2 D flip-flops + combinational logic).
- Test record for at least 3 input sequences with per-tick state $(Q_1Q_0)$ and output $B$.

### Question

Why is it recommended to force unused state 11 back to the initial state instead of transitioning arbitrarily? How does this relate to reliability?

## Experiment: 3-digit decimal counter (000 → 999)

A counter is a classic sequential module: state registers that evolve under a clock. This experiment asks you to design a **3-digit decimal counter** and display it using **three 7-segment displays**, counting from 000 up to 999 in a loop. The counter should also stop automatically when a specified stop condition is met.

### Objectives

- Understand 7-segment encoding and implement digit-to-segment decoding.
- Learn to decompose a complex circuit into reusable modules (counting cell, carry logic, display decoding, etc.).

### Environment

- Simulator: Logisim Evolution

### Principles

#### 1) Structure

Treat the counter as three cascaded decimal digits: ones, tens, hundreds.

- ones increments every clock
- ones rolling 9→0 produces a carry to tens
- tens rolling 9→0 produces a carry to hundreds
- 999 rolls back to 000

This can be designed using an FSM mindset where each digit is a $0\ldots 9$ FSM.

#### 2) 7-segment display

A 7-segment display uses 7 LEDs to form digits. Logisim Evolution’s display is shown in [Figure 3.8](#fig-seg-4).

<a id="fig-seg-4"></a>

![7-segment display showing 4](/images/chap03/seg-4.png)

*Figure 3.8: Example 7-segment display showing the digit 4.*

### Inputs and outputs

Inputs:

- $CLK$: clock
- $RST$: reset (after reset, the value should be 000)
- $EN$: count enable ($EN=1$ counts; $EN=0$ holds)

Outputs:

- Three 7-segment displays showing hundreds/tens/ones digits.

### Tasks

1. **Base functionality (000 → 999 loop)**
   - When $EN=1$, increment by 1 on each clock edge.
   - Sequence: 000, 001, 002, …, 998, 999, 000, …
   - Display all three digits on three 7-seg displays.

2. **Stop functionality (stop at $500 + N$)**
   - Choose a two-digit decimal number $N$ (00–99), e.g., last two digits of your student ID or day-of-month.
   - Stop threshold is $500 + N$ (i.e., a number between 500 and 599).
   - When the counter reaches that value, it should stop (hold display) until reset or re-enabled.
   - Explain your chosen resume behavior in your report.

### Design hints

- Encapsulate a single decimal-digit counting unit as a subcircuit and reuse it for tens/hundreds.
- Carry signals are the key to cascading digits.

### Results

- Top-level circuit screenshot showing:
  - three digit counters, three 7-seg displays
  - $CLK/RST/EN$
  - the stop-control path
- Subcircuit interface documentation (inputs/outputs and meanings).
