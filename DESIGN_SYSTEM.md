# 🎨 WORMHOLE — Minimalist Design System (MDS v2.0)

A refined, high-craft design language inspired by Linear, Raycast, and Cron — tailored for instant visual clarity, subtle tactile interactions, and elegant geometric spatial depth.

---

## 1. Color Tokens

### 1.1 Surfaces & Obsidian Void
```css
--bg-app:              #08080A; /* Deep obsidian void */
--bg-surface:          #101014; /* Card surface */
--bg-surface-elevated: #16161C; /* Elevated header / active element */
--bg-surface-hover:    #1C1C24; /* Interactive hover layer */
--bg-glass:            rgba(16, 16, 20, 0.75); /* Frosted navigation */
```

### 1.2 Hairline Borders
```css
--border-subtle:       rgba(255, 255, 255, 0.06); /* 1px ultra-fine card edge */
--border-medium:       rgba(255, 255, 255, 0.12); /* Interactive hover border */
--border-focus:        rgba(255, 255, 255, 0.30); /* Input focus */
```

### 1.3 Subdued Signals (Non-Garish)
```css
--free-text:           #34D399; /* Soft Emerald · 100% Free / MOOC / Office */
--free-bg:             rgba(52, 211, 153, 0.08);
--free-border:         rgba(52, 211, 153, 0.22);
--free-dot:            #10B981;

--flex-text:           #FBBF24; /* Soft Amber · PE-1 Elective shift */
--flex-bg:             rgba(251, 191, 36, 0.08);
--flex-border:         rgba(251, 191, 36, 0.22);

--skip-text:           #FB923C; /* Soft Orange · CTS Low Friction */
--skip-bg:             rgba(251, 146, 60, 0.06);
```

---

## 2. Typography Hierarchy

- **Primary Sans**: `'Plus Jakarta Sans'`, `-apple-system`, `'Inter'`, sans-serif (Weights: 400, 500, 600, 700, 800).
- **Metadata & Codes**: `'JetBrains Mono'`, monospace (Weights: 400, 500, 600).
- **Tracking**: Tight letter-spacing (`letter-spacing: -0.02em` on headings, `letter-spacing: 0.04em` on mono badges).

---

## 3. Interactive Motion & Haptics

- **Geometric Spacetime Mesh**: 60 FPS HTML5 canvas with inertial spring physics, concentric orbital rings, and radial warp vectors that bend gently to cursor coordinates.
- **Audio Feedback**: Subtle, non-intrusive 20ms sine-burst haptic clicks and pleasant resonance triads on 100% match.
- **Keyboard Navigation**:
  - `1` – `4`: View switching.
  - `A` – `L`: Section jump.
  - `Space`: Audio mute toggle.
