---
title: "Chapter 1 — Getting Started: Lab Environment & Tools"
---

This chapter helps you set up the lab environment and learn the basics of two tools you will use throughout the course:

- **Logisim Evolution** (digital logic design and simulation)
- **Ripes** (visual RISC-V processor and program execution simulator)

After finishing this chapter, you should be able to:

- Install and configure Logisim Evolution and Ripes correctly.
- Build and simulate a simple digital circuit in Logisim Evolution.
- Run and inspect a simple RISC-V program in Ripes.

## Installing and Using Logisim Evolution

Logisim is an educational digital logic design and simulation tool, suitable for learning and validating combinational logic, sequential logic, and simple CPU datapaths. It was originally created by Dr. Carl Burch and actively developed until 2014.

Key features include:

- Visual circuit construction with drag-and-drop editing
- Built-in components such as logic gates, flip-flops, registers, and memory
- Clock-driven simulation and cycle-by-cycle stepping

Researchers at several Swiss higher-education institutions improved Logisim to better support modern operating systems and larger circuits; the improved fork is **Logisim Evolution**. In this manual we use **Logisim Evolution 4.1.0**.

### Installation

Logisim Evolution is a cross-platform digital circuit simulator based on Java, and it runs on Windows, Linux, and macOS.

**Step 1: Install a Java runtime**

Logisim Evolution requires **Java 21 or later**. Choose an appropriate JDK distribution for your OS:

- **Windows**: install OpenJDK / Oracle JDK / Microsoft Build of OpenJDK; set `JAVA_HOME` and add `$JAVA_HOME/bin` to `PATH`.
- **Linux**: install via your package manager or via SDKMAN.
- **macOS**: install via Homebrew or download an installer package.

**Step 2: Download and run the JAR**

Go to the Logisim Evolution releases page:

- https://github.com/logisim-evolution/logisim-evolution/releases

Download `logisim-evolution-<version>-all.jar` and start it with:

```bash
java -jar logisim-evolution-<version>-all.jar
```

### Basic configuration (UI language)

On first launch, Logisim Evolution selects the UI language based on your OS locale. If you are using an English OS but want to follow the steps in a Chinese UI, you can switch languages manually:

1. In the menu bar, click **Window** → **Preferences**.
2. In the settings dialog, open the **International** tab.
3. Under **Language**, select **Chinese**.

This manual’s UI descriptions (in later chapters) assume the Chinese UI, so it’s recommended to change this before starting.

### Interface overview

After launching Logisim Evolution, the main window consists of:

- **Component library (top-left)**: components grouped by category (e.g., Wiring, Gates, Plexers, Memory, I/O).
- **Circuit editor (center canvas)**: where you build and view circuit structures.
- **Properties panel (bottom-left)**: edit properties of the selected component (bit width, direction, label, etc.).
- **Menu and toolbar**: create/save projects, control simulation, and manage the clock.

![Logisim Evolution UI](/images/chap01/logisim-evolution.png)

## Building Your First Circuit in Logisim Evolution

### Experiment: Two-Input AND Gate

#### Objectives

- Become familiar with basic Logisim Evolution operations.
- Learn how to use input pins, logic gates, and output pins.

#### Principles

A two-input AND gate is one of the most basic combinational logic devices. Its behavior is:

- The output is **1 if and only if** all inputs are 1.

Let inputs be **A** and **B**, and output be **Y**. The logic expression is:

- **Y = A · B**

#### Task: Build and verify a two-input AND gate

1. **Prepare input and output pins**
   1. In the **Wiring** category, place two **Pin** components. In the properties panel (or using the text tool), name them **A** and **B**.
   2. Place one more **Pin**, name it **Y**, and set its **Type** to **Output** in the properties panel.
2. **Place the AND gate**
   1. In the **Gates** category, place one **AND gate**.
3. **Wire the circuit**
   1. Connect inputs **A** and **B** to the two inputs of the AND gate.
   2. Connect the AND gate output to **Y**.
4. **Verify functionality**
   1. Click pins **A** and **B** to cycle through input combinations: (A,B) = 00, 01, 10, 11.
   2. Observe how output **Y** changes.

#### Results

- A full screenshot of your completed AND-gate circuit.
- Complete the experiment record table below.

| A | B | Y |
|---|---|---|
| 0 | 0 |   |
| 0 | 1 |   |
| 1 | 0 |   |
| 1 | 1 |   |

#### Questions

1. If you replace the AND gate with an OR gate, how does the output logic change?
2. Does this circuit have “memory” (i.e., can it keep a previous output state after the inputs change)? Why?

## Installing and Using Ripes

Ripes is a visual simulation tool for the **RISC-V architecture**. Unlike Logisim Evolution (which focuses on circuit-level simulation), Ripes operates at the **microarchitecture and instruction level**, making it ideal for understanding:

- How instructions execute inside a CPU
- Differences between single-cycle, multi-cycle, and pipelined CPUs
- Coordination between registers, the ALU, control signals, and the datapath

Ripes includes multiple RISC-V CPU models and supports cycle-by-cycle / stage-by-stage visualization.

### Installation

Ripes provides prebuilt releases for Windows, Linux, and macOS. Download them from:

- https://github.com/mortbopet/Ripes/releases

This manual uses **Ripes 2.2.6**.

On Linux, Ripes is distributed as an **AppImage**. After downloading, mark it executable and run it directly:

```bash
chmod a+x Ripes-<version>.AppImage
./Ripes-<version>.AppImage
```

On Windows, Ripes requires the **Microsoft Visual C++ runtime**. If you see errors like `msvcp140.dll` missing, install the Microsoft Visual C++ Redistributable from Microsoft’s official website and restart Ripes.

### Interface overview

![Ripes UI](/images/chap01/ripes.png)

Ripes consists of multiple views (switchable in the left sidebar), including:

- **Code editor**: write and view RISC-V assembly programs
- **Processor view**: visualize the CPU datapath or pipeline
- **Cache view**: visualize cache structure
- **Memory view**: inspect how code/data are laid out in memory
- **I/O view**: configure and interact with devices such as an LED matrix

These views allow you to observe instruction execution inside the CPU.

## Running Your First Program in Ripes

### Experiment: Observing instruction execution in Ripes

#### Objectives

- Learn basic Ripes usage.
- Observe how registers change during instruction execution.
- Build an intuitive link between instructions and hardware behavior.

#### Principles

This experiment is based on the RISC-V ISA and uses a visual processor model to observe instruction execution.

#### Environment

- Simulator: **Ripes**
- CPU model: **Single-Cycle Processor**

#### Task: Step through an example program and observe registers

The following simple RISC-V assembly program adds two numbers:

```asm
addi x1, x0, 5   # x1 = 5
addi x2, x0, 7   # x2 = 7
add  x3, x1, x2  # x3 = x1 + x2
```

Steps:

1. Open Ripes and select **Single-Cycle Processor** as the CPU model.
2. Create a new program (or clear the editor) and paste the code above into the code editor.
3. Use single-step execution and observe how registers `x1`, `x2`, and `x3` change.

#### Results

- A screenshot of the running program (including the registers window).
- Briefly explain how each instruction affects the register state.
- Verify whether the final result matches the program logic.

#### Question

- If you switch the CPU model to a multi-cycle or pipelined model, how does the timing of register updates change?

## Summary

This chapter introduced two core lab tools—**Logisim Evolution** and **Ripes**—and guided you through initial hands-on exercises for a digital logic circuit and a simple instruction execution walkthrough.

In the following chapters, you will:

- Use Logisim Evolution to build more complex combinational and sequential circuits.
- Use Ripes to understand CPU datapaths and control logic in greater depth.
- Use simulation environments to learn more advanced computer organization topics.
