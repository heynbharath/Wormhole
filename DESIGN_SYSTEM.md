# 🎨 WORMHOLE — Cosmic Design System (CDS v1.0)

A futuristic, high-contrast, cyberpunk-meets-deep-space design language crafted for fast visual parsing, tactile interactions, and immersive spatial depth.

---

## 1. Color Tokens

### 1.1 Space & Atmosphere (Surfaces)
```css
--space-black:     #05070D; /* Deep singularity void */
--space-card:      #0C101D; /* Elevated glass panel */
--space-card-hover:#141B2D; /* Interactive hover elevation */
--space-border:    rgba(255, 255, 255, 0.08); /* Subtle glass contour */
--space-border-lit:rgba(0, 240, 255, 0.35);   /* Active neon contour */
```

### 1.2 Quantum Accents (Signals & Highlights)
```css
--neon-cyan:       #00F0FF; /* Primary interactive glow & branding */
--neon-purple:     #9D00FF; /* Secondary warp & rift energy */
--quantum-green:   #00FF9D; /* 100% Free / MOOC / Sports / Office */
--amber-flare:     #FFB800; /* Flexible / Elective shift (PE-1) */
--amber-dim:       #FF8800; /* Low priority skip (CTS) */
--event-horizon:   #FF3366; /* Non-negotiable core class */
```

### 1.3 Cosmic Typography
```css
--text-primary:    #FFFFFF; /* Stark celestial white */
--text-secondary:  #8E9BB5; /* Subdued starlight blue-grey */
--text-muted:      #4D5875; /* Background nebula tone */
```

---

## 2. Typography Scale

- **Display & Brand**: `'Syne'`, `'Space Grotesk'`, sans-serif (800, 700 weight, tight tracking).
- **Body & Matrix Labels**: `'Inter'`, `'IBM Plex Sans'`, system-ui (400, 500, 600 weight).
- **Time, Codes & Diagnostics**: `'JetBrains Mono'`, `'IBM Plex Mono'`, monospace (400, 600 weight).

---

## 3. Glassmorphism & Elevation

```css
.wormhole-glass {
  background: rgba(12, 16, 29, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--space-border);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
}

.wormhole-glass:hover {
  border-color: var(--space-border-lit);
  box-shadow: 0 12px 40px 0 rgba(0, 240, 255, 0.15);
}
```

---

## 4. Signal Matrix Badging

| Category | Background | Border | Glow Effect | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **QUANTUM FREE** | `rgba(0, 255, 157, 0.12)` | `rgba(0, 255, 157, 0.4)` | `0 0 12px rgba(0, 255, 157, 0.3)` | MOOC, Sports, Library, Mentor, Office |
| **FLEX SHIFT** | `rgba(255, 184, 0, 0.12)` | `rgba(255, 184, 0, 0.4)` | `0 0 12px rgba(255, 184, 0, 0.2)` | Professional Elective I (PE-1) |
| **LOW FRICTION** | `rgba(255, 136, 0, 0.10)` | `rgba(255, 136, 0, 0.3)` | None | Cognitive & Tech Skills (CTS) |
| **LOCKED** | `rgba(255, 255, 255, 0.03)` | `rgba(255, 255, 255, 0.08)` | None | Core Subjects, Labs, Soft Skills |
| **NOW ACTIVE** | `rgba(0, 240, 255, 0.25)` | `#00F0FF` | Pulsing `0 0 24px #00F0FF` | Active period based on live clock |
