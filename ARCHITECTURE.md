# 🛸 WORMHOLE — Technical Architecture & Engineering Specs

## 1. System Overview

WORMHOLE is architected as an ultra-lightweight, zero-dependency, ultra-high-performance client-side Single-Page Application (SPA). It renders at steady 60 FPS while performing real-time schedule set-intersection algorithms.

```
┌─────────────────────────────────────────────────────────────┐
│                       WORMHOLE ENGINE                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Canvas Canvas  │ Web Audio Synth │ Chronos State & Matrix  │
│  (particles.js) │   (sound.js)    │   (engine.js + data.js) │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
   [WebGL / 2D]       [AudioContext]       [DOM / Micro-UI]
```

---

## 2. Component Hierarchy & Module Separation

```
/DSU UNI SYNC
├── index.html               # Main application shell and UI views
├── styles/
│   ├── theme.css            # Cosmic design tokens, animations, glow utilities
│   └── components.css       # Timetable grid, glass cards, Pigeonholes, badges
├── scripts/
│   ├── data.js              # Normalized dataset for all 12 sections (A–L) & electives
│   ├── sound.js             # Native Web Audio API sound synthesizers
│   ├── particles.js         # Interactive Canvas gravitational wormhole particle vortex
│   └── engine.js            # Core overlap algorithms, live time tracker & calendar exporter
├── PHILOSOPHY.md            # Product manifesto and YC thesis
├── DESIGN_SYSTEM.md         # Design tokens, color system, and typography
├── ARCHITECTURE.md          # This technical document
└── ROADMAP.md               # Product versioning and future scaling
```

---

## 3. Core Algorithms

### 3.1 The Spacetime Intersection Engine (The Rift Algorithm)

The comparison engine calculates the contiguous overlapping windows between any two sections $S_A$ and $S_B$:

$$\text{Score}(d, p) = \min\Big(\text{Tier}(S_A[d][p]),\, \text{Tier}(S_B[d][p])\Big)$$

Where:
- $\text{Tier}(\text{MOOC} \mid \text{SPORTS} \mid \text{LIBRARY} \mid \text{MENTOR} \mid \text{OFFICE}) = 3$ (Quantum Free)
- $\text{Tier}(\text{PE-1}) = 2$ (Flexible Shift)
- $\text{Tier}(\text{CTS}) = 1$ (Low Friction)
- $\text{Tier}(\text{Core Class} \mid \text{Lab} \mid \text{Soft Skill}) = 0$ (Locked)

Windows are formed by grouping adjacent periods with $\text{Score} > 0$ and ranked by:
$$\text{Rank}(W) = (\text{Score}(W) \times 100) + \text{Duration}(W)$$

### 3.2 Live "Now" Clock Synchronization

The system continuously tracks local time via `requestAnimationFrame` throttled clock loop:
1. Calculates active day index $D \in [0..5]$ (Monday–Saturday).
2. Maps current hour and minute to active period $P \in [0..6]$.
3. Adds glowing `.now-active` pulse effect to the current class cell and displays remaining time until transition.

---

## 4. Hardware-Accelerated Canvas Vortex (`particles.js`)

- **Rendering Engine**: HTML5 2D Canvas context with coordinate transformation for perspective depth.
- **Physics**: 250-400 orbital particles attracted to a central gravitational singularity $(c_x, c_y)$ with logarithmic decay.
- **Interactive Cursor Warping**: Pointer velocity induces rotational torque on the accretion disk.
- **Performance Budget**: Target $< 2.5\text{ms}$ frame render time on modern mobile/desktop GPUs.

---

## 5. Native Audio Synthesis (`sound.js`)

Zero external audio MP3/WAV assets. 100% synthesized through native `AudioContext`:
- **Warp Chime**: Dual sine oscillator frequency ramp (220 Hz $\to$ 880 Hz with exponential gain decay).
- **Matrix Click**: High-pass filtered impulse burst (1200 Hz with $15\text{ms}$ release).
- **Quantum Lock**: Polyphonic chord progression when 100% free overlap is surfaced.
- **State Persistence**: Mute toggle auto-persisted to `localStorage['wormhole_sound_muted']`.

---

## 6. Security & Privacy Model

- **Zero Trackers**: No external analytics, trackers, or cookie banners.
- **Local State**: Section preferences and audio configurations stored exclusively in client `localStorage`.
- **Content Security Policy (CSP) Ready**: No unsafe `eval()` executions.
