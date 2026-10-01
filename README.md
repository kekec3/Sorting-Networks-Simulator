# Sorting Networks Simulator

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: Academic](https://img.shields.io/badge/License-Academic-blue.svg?style=flat-square)](#academic-context)

An interactive web-based simulator for **sorting networks**, designed to visualize their structure, execution, and inherently parallel nature.

> **Academic Note:** This project was developed as a final-year thesis project at the **School of Electrical Engineering, University of Belgrade** (ETF Belgrade).

---

## 📌 Overview

Sorting networks are fixed sequences of compare-and-swap operations whose structure is independent of the input data. This property makes them particularly powerful for studying **parallel execution**, as independent comparators within the same stage can be executed simultaneously.

Instead of relying solely on static diagrams, this simulator provides an interactive environment to explore the complete sorting process dynamically.

### What You Can Do

- **Generate** sorting networks using multiple classic algorithms.
- **Load** known optimal configurations for small network sizes.
- **Provide** custom input values or generate random arrays.
- **Execute** networks step-by-step with full forward and backward state traversal.
- **Observe** animated values moving across network wires in real time.
- **Follow** synchronized, parallel execution pseudocode.
- **Visualize** parallel processing element allocation through a GPU-style grid.
- **Inspect** real-time network and execution statistics.
- **Compare** structural characteristics of different network-generation algorithms.

---

## ✨ Features

### 📐 Sorting Network Generation

The simulator supports three constructive network-generation algorithms:

- **Bitonic Sort**
- **Batcher's Odd-Even Merge**
- **Pairwise Sorting Network**

For small input sizes, the application can also load **known optimized network configurations**.

---

### 🎮 Interactive Simulation

Explore network execution at different levels of detail with complete execution control:

- **Playback Controls:** Play, pause, adjust simulation speed, reset, and toggle automatic playback.
- **Step Navigation:** Advance or step backward phase-by-phase or via finer-grained micro-steps within a single phase.
- **State Snapshots:** Reversibility is achieved through state snapshots of the array at each step, allowing seamless backward navigation through previous simulation states.

---

### 🎨 Network Visualization

The network is displayed using standard comparator-network notation rendered with SVG:

- **Horizontal lines** represent data channels/wires.
- **Vertical connections** represent compare-and-swap operations (comparators).
- **Stages** visually isolate groups of independent comparators.
- **Animated tokens** convey values moving through channels.
- **Dynamic highlighting** distinguishes active stages while keeping completed and pending operations visually distinct.

---

### ⚡ Parallel Execution Visualization

A key focus of the simulator is bringing the **parallelism of sorting networks** to light:

- Provides a visual representation of **processing elements (PUs)** assigned during each stage.
- Synchronizes processing-element activity with the network state and pseudocode.
- Illustrates how independent comparators can be executed concurrently.
- Displays theoretical parallel-resource utilization based on the simulated execution model.

> **Note:** The displayed utilization represents the theoretical parallelism available in the simulated execution model, rather than physical host GPU load.

---

### 📜 Synchronized Pseudocode

The simulator displays high-level pseudocode representing the parallel execution model.

As execution progresses, active instructions are highlighted in real time, establishing a visual connection between:

```text
Network Structure
        ↓
   Pseudocode
        ↓
Processing Elements
        ↓
  Data Movement
```

This allows the user to observe not only **what** the sorting network does, but also how its operations can be mapped to a parallel execution model.

---

### 📊 Statistics & Metrics

The simulator provides real-time quantitative information about the network architecture and current execution:

- Input size (`N`)
- Network depth
- Total comparator count
- Active stage index
- Completed comparisons
- Swap count
- Parallel-resource utilization rate

---

## 🧪 Supported Algorithms

| Algorithm | Description |
| :--- | :--- |
| **Bitonic Sort** | Recursive construction based on bitonic sequences and bitonic merging networks. |
| **Odd-Even Merge** | Batcher's divide-and-conquer odd-even merging network construction. |
| **Pairwise** | Pairwise comparator construction followed by greedy ASAP (As Soon As Possible) stage scheduling. |

The simulator demonstrates how different construction strategies can produce different network depths and comparator counts for identical input sizes.

---

## 💡 Example Workflow

For an 8-input Bitonic sorting network:

1. **Select & Generate:** Choose the Bitonic algorithm for `N = 8`.
2. **Set Inputs:** Enter custom numeric values or generate random values.
3. **Step Through:** Advance execution one stage or micro-step at a time.
4. **Track Operations:** Watch values swap across channels and follow the highlighted pseudocode.
5. **Inspect Parallelism:** Observe processing-element activity and stage utilization metrics.
6. **Analyze & Replay:** Inspect total comparisons and navigate backward through previous execution states.

---

## 🛠️ Technology Stack

The simulator is implemented as a fully client-side single-page web application.

| Layer / Library | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Angular | Core application framework |
| **Language** | TypeScript | Application logic, state models, and algorithms |
| **Styling** | Tailwind CSS | Utility-first responsive UI |
| **Rendering** | SVG | Scalable vector graphics for network visualization |
| **State Management** | Angular Signals | Fine-grained reactive state synchronization |
| **Tooling** | Node.js / npm | Build environment and package management |

---

## 🏗️ Architecture

The application separates domain logic, simulation state, and presentation.

```text
┌─────────────────────────────────────────────────────────┐
│                    Angular Signals                      │
│              Central Reactive State                      │
└──────────────┬───────────────┬───────────────┬──────────┘
               │               │               │
       ┌───────▼────────┐ ┌────▼────────────┐ ┌▼───────────────┐
       │   Generators   │ │ Simulation      │ │  UI & SVG      │
       │                │ │ Engine          │ │  Visualization  │
       │ Network        │ │ Snapshots       │ │                 │
       │ Construction   │ │ Steps           │ │ Components      │
       └────────────────┘ └─────────────────┘ └─────────────────┘
```

### Network Generation

Standalone algorithms construct sorting networks from wires, comparators, and stages.

### Network State

Data structures track:

- Network topology
- Wires
- Comparators
- Stages
- Current execution position
- Network metadata

### Simulation Engine

The simulation engine handles:

- Execution steps
- Stage progression
- Micro-step progression
- State snapshots
- Backward navigation
- Execution timing
- Comparison and swap tracking

### Visualization

SVG-based components translate the internal network and simulation state into an interactive visual representation.

### UI Components

The interface is divided into specialized components for:

- Network configuration
- Network visualization
- Pseudocode
- Processing-element grid
- Simulation controls
- Statistics

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/) — v18.x or higher recommended
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/kekec3/Sorting-Networks-Simulator.git
cd Sorting-Networks-Simulator
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Development Server

Start the local development server:

```bash
npm start
```

or:

```bash
ng serve
```

Then open:

```text
http://localhost:4200/
```

The application automatically reloads whenever source files are modified.

---

## 📦 Production Build

Build an optimized production version:

```bash
npm run build
```

The generated files will be placed inside the `dist/` directory.

---

## 🧪 Running Tests

Execute the project's unit tests using Karma:

```bash
npm test
```

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── generators/        # Bitonic, Odd-Even, and Pairwise generators
│   │   ├── models/            # Network, Stage, and Comparator interfaces
│   │   └── services/          # Simulation state and engine services
│   │
│   ├── data/                  # Optimized network configurations
│   │
│   └── features/
│       ├── network-canvas/     # SVG network rendering
│       ├── config-panel/      # Network and input configuration
│       ├── pseudocode-panel/  # Synchronized pseudocode display
│       ├── gpu-grid/          # Parallel execution visualization
│       ├── controls/          # Simulation controls
│       └── statistics/        # Execution statistics dashboard
│
└── ...
```

---

## 🎓 Educational Purpose

Static diagrams are useful for describing sorting-network topologies, but they do not fully illustrate dynamic value movement or concurrent operations.

This simulator combines:

- Animated network visualization
- Step-by-step execution
- Reversible simulation states
- Synchronized pseudocode
- Parallel processing-element visualization
- Network and execution statistics

Together, these features provide an interactive environment for studying the relationship between a sorting network's **structure**, its **execution**, and its potential for **parallel processing**.

The simulator can be used to explore:

- Comparator networks
- Compare-and-swap operations
- Network depth
- Comparator count
- Data-independent sorting
- Parallel execution models
- Trade-offs between network depth and total comparator count

---

## 🔮 Future Improvements

Possible future extensions include:

### 🛠️ Manual Network Construction

An interactive canvas for manually placing wires and comparators and constructing custom sorting networks.

### 🧪 0-1 Principle Verification

Automated verification of sorting networks using the **0-1 Principle**, including exhaustive testing for suitable network sizes.

### 📁 Import / Export

JSON-based import and export for saving and sharing sorting-network configurations.

### ⚔️ Side-by-Side Comparison

A dual-simulation interface for comparing two sorting networks or algorithms concurrently.

### 🔌 Hardware Mapping

More direct mappings between the simulated processing model and actual GPU or FPGA execution architectures.

---

## 🎓 Academic Context

This project was developed as a **final-year Bachelor's thesis** at the:

**School of Electrical Engineering, University of Belgrade (ETF)**

### Thesis Title

**„Визуелни симулатор мрежа за сортирање у веб технологији“**

The project focuses on the visualization and interactive simulation of sorting networks, with particular emphasis on their structure, execution flow, and inherent parallelism.

---

## 📜 License

This project is intended primarily as an **academic and educational project**.

See the repository for the complete source code and project materials.
