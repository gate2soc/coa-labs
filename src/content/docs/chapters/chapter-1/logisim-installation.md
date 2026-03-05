---
title: "Installing and Using Logisim Evolution"
---

Logisim is an educational digital logic design and simulation tool, suitable for learning and validating combinational logic, sequential logic, and simple CPU datapaths. It was originally created by Dr. Carl Burch and actively developed until 2014.

Key features include:

- Visual circuit construction with drag-and-drop editing
- Built-in components such as logic gates, flip-flops, registers, and memory
- Clock-driven simulation and cycle-by-cycle stepping

Researchers at several Swiss higher-education institutions improved Logisim to better support modern operating systems and larger circuits; the improved fork is **Logisim Evolution**. In this manual we use **Logisim Evolution 4.1.0**.

## Installation

Logisim Evolution is a cross-platform digital circuit simulator based on Java, and it runs on Windows, Linux, and macOS.

### Step 1: Install a Java runtime

Logisim Evolution requires **Java 21 or later**. Choose an appropriate JDK distribution for your OS:

- **Windows**: install OpenJDK / Oracle JDK / Microsoft Build of OpenJDK; set `JAVA_HOME` and add `$JAVA_HOME/bin` to `PATH`.
- **Linux**: install via your package manager or via SDKMAN.
- **macOS**: install via Homebrew or download an installer package.

### Step 2: Download and run the JAR

Go to the Logisim Evolution releases page:

- https://github.com/logisim-evolution/logisim-evolution/releases

Download `logisim-evolution-<version>-all.jar` and start it with:

```bash
java -jar logisim-evolution-<version>-all.jar
```

## Basic configuration (UI language)

On first launch, Logisim Evolution selects the UI language based on your OS locale. If you are using an English OS but want to follow the steps in a Chinese UI, you can switch languages manually:

1. In the menu bar, click **Window** → **Preferences**.
2. In the settings dialog, open the **International** tab.
3. Under **Language**, select **Chinese**.

This manual’s UI descriptions (in later chapters) assume the Chinese UI, so it’s recommended to change this before starting.

## Interface overview

After launching Logisim Evolution, the main window consists of:

- **Component library (top-left)**: components grouped by category (e.g., Wiring, Gates, Plexers, Memory, I/O).
- **Circuit editor (center canvas)**: where you build and view circuit structures.
- **Properties panel (bottom-left)**: edit properties of the selected component (bit width, direction, label, etc.).
- **Menu and toolbar**: create/save projects, control simulation, and manage the clock.

![Logisim Evolution UI](/images/chap01/logisim-evolution.png)
