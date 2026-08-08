# 🏗️ WORMHOLE — Technical Architecture & Algorithms

WORMHOLE is engineered as an ultra-fast, zero-dependency, single-page application executing client-side set intersection arithmetic on normalized schedule tensors.

---

## 1. N-Way Squad Intersection Algorithm

Given a squad $S = \{S_1, S_2, \dots, S_k\}$ where $k \in [2, 8]$ sections, for each day $D \in \text{DAYS}$ and period slot $P_i \in [0, 6]$:

$$\text{SlotScore}(D, P_i) = \min_{j=1}^k \left( \text{FrictionTier}(S_j, D, P_i) \right)$$

Where $\text{FrictionTier}(label) \in \{3, 2, 1, 0\}$:
- **Level 3 (Free)**: `MOOC | SPORTS | LIBRARY | MENTOR | OFFICE`
- **Level 2 (Flex)**: `PE-1`
- **Level 1 (Low)**: `CTS`
- **Level 0 (Locked)**: `Core Subjects | Practical Labs`

$$\text{SquadAlignmentScore} = \frac{\sum \mathbb{I}(\text{SlotScore} \ge 2) + \text{BreakSlots}}{\text{TotalAcademicSlots}} \times 100\%$$

---

## 2. Real-Time Radar Loop (`startLiveRadar()`)

An active `1000ms` clock pulse compares `now.getHours() * 60 + now.getMinutes()` against the defined academic interval bounds:
```js
PERIODS = [
  { start: "08:40", end: "09:30" }, // P1
  { start: "09:30", end: "10:20" }, // P2
  // Break: 10:20 – 10:45
  { start: "10:45", end: "11:40" }, // P3
  { start: "11:40", end: "12:35" }, // P4
  // Lunch: 12:35 – 01:50
  { start: "01:50", end: "02:40" }, // P5
  { start: "02:40", end: "03:30" }, // P6
  { start: "03:30", end: "04:20" }, // P7
]
```

At every tick:
1. Calculates time remaining in active period: $\Delta T = \text{EndMin} - \text{CurrentMin}$.
2. Scans all 12 sections: $\text{FreeSections} = \{S_k \mid \text{FrictionTier}(S_k, \text{Today}, \text{CurrentPeriod}) = 3\}$.
3. Emits live HUD metrics and updates the UI status pill.

---

## 3. URL Hash State Encoder & Deserializer

Allows zero-backend state sharing across devices:
- Format: `window.location.hash = #squad=H,L,A&view=squad`
- On load, parses `hashParams` and restores exact multi-section comparison state in $< 5\text{ms}$.
