# Research: Webcam Color Capture & IoT Bulb Control

**Feature ID**: 001
**Date**: 2026-02-02
**Status**: Complete

---

## Phase 0: Unknowns Resolution

### 1. Color Extraction Algorithm

**Decision**: K-Means clustering with k=5, selecting largest cluster

**Rationale**:
- K-Means is well-understood and produces stable results
- k=5 provides good balance between accuracy and performance
- Selecting the largest cluster by pixel count matches spec requirement (FR-003)
- Can be implemented with minimal dependencies

**Alternatives Considered**:
- Median cut algorithm: More complex, no significant benefit for this use case
- Histogram-based dominant color: Less accurate for complex scenes
- Machine learning approach: Over-engineered for demo requirements

### 2. Color Space for Processing

**Decision**: Process in RGB, convert to HSL for display and bulb communication

**Rationale**:
- Canvas API provides RGB pixel data natively
- HSL is required by Shelly bulb API for color control
- Displaying hex code (#RRGGBB) per spec requires RGB
- HSL allows for brightness/saturation adjustments if needed

### 3. Frame Processing Rate

**Decision**: 10 FPS (100ms intervals) for color extraction

**Rationale**:
- Meets "continuous" update requirement without overwhelming device
- Provides smooth visual updates for human perception
- Leaves CPU headroom for UI rendering
- Matches throttle rate for bulb updates (spec FR-012)

### 4. Bulb Communication Protocol

**Decision**: HTTP REST API via Shelly Gen1 local HTTP protocol

**Rationale**:
- Shelly Duo RGBW bulbs support Gen1 HTTP interface
- Simple query parameter-based API (no JSON body required)
- Works from browser via fetch (CORS allowed by device)
- Discovery-first approach ensures correct endpoint detection

**API Pattern**: `http://<bulb-ip>/light/0?turn=on&red=255&green=128&blue=64`

**Discovery Flow** (per Tessl tile steering rules):
1. `GET /shelly` - Identify device, check auth
2. `GET /status` - Discover `lights[]` capability
3. `GET /settings` - Confirm configuration
4. Use `/light/{index}` with query parameters

### 5. State Management Approach

**Decision**: React hooks with useReducer for complex state, useState for simple state

**Rationale**:
- Webcam/bulb connection states have multiple transitions → useReducer
- Simple values (current color, IP input) → useState
- No external state library needed for this scope
- Aligns with constitution principle of boring, well-understood solutions

### 6. Color Smoothing Strategy

**Decision**: Exponential moving average (EMA) with alpha=0.3

**Rationale**:
- Provides smooth transitions without delay
- Simple to implement and understand
- Prevents jarring color jumps from frame noise
- Alpha of 0.3 balances responsiveness with smoothness

---

## Tessl Tiles

### Installed Tiles

| Technology | Tile | Type | Version |
|------------|------|------|---------|
| React | tessl/npm-react | Documentation | 19.2.0 |
| Vitest | tessl/npm-vitest | Documentation | 4.0.0 |
| Vite | tessl/npm-vite | Documentation | 7.3.0 |
| Tailwind CSS | tessl/npm-tailwindcss | Documentation | 4.1.1 |
| Shelly Gen1 API | shelly-cloud/shelly-gen1-api | Documentation + Steering | 1.0.0 |

### Key Insights from Tiles

**React Best Practices**:
- Use functional updates with useState when new state depends on old
- Use useReducer for complex state with multiple transitions
- Use useRef for mutable values that don't trigger re-renders (timers, DOM refs)
- Cleanup subscriptions and event listeners in useEffect return

**Vitest Mocking Strategy**:
- Use `vi.stubGlobal()` for browser APIs (navigator.mediaDevices, fetch)
- Use `vi.fn()` for tracking function calls
- Use `vi.mock()` for module mocking
- Cleanup with `vi.restoreAllMocks()` in afterEach

**Vite Configuration**:
- Use `defineConfig` for type-safe configuration
- Configure JSX automatic mode for React 19
- Enable TypeScript via esbuild (no separate tsc step)

### Shelly Gen1 API Steering Rules (from tile)

Per `shelly-cloud/shelly-gen1-api` steering:
- **ALWAYS** perform discovery: `/shelly` → `/status` → `/settings`
- **NEVER** assume endpoint families exist without discovery evidence
- **NEVER** hardcode channel counts; derive from `lights[]` array
- Prefer **idempotent** commands (explicit on/off) over toggles
- After state-changing commands, **VERIFY** result via response or `/status`
- Do **NOT** poll aggressively

### Technologies Without Tiles

- Canvas API: No tile found (standard browser API)
- MediaDevices API: No tile found (standard browser API)

---

## Technical Decisions Summary

| Decision Area | Choice | Confidence |
|---------------|--------|------------|
| Frontend Framework | React 19 | High |
| Build Tool | Vite 7 | High |
| Styling | Tailwind CSS 4 | High |
| Testing | Vitest 4 | High |
| Language | TypeScript 5.x | High |
| Color Algorithm | K-Means (k=5) | High |
| Frame Rate | 10 FPS | High |
| State Management | React hooks | High |
| Color Smoothing | EMA (alpha=0.3) | Medium |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Browser webcam API differences | Test on Chrome, Firefox, Safari; use feature detection |
| Bulb network latency | Throttle updates, use optimistic UI updates |
| Color extraction performance | Canvas operations in requestAnimationFrame, profile early |
| CORS with bulb API | Shelly bulbs allow cross-origin requests; test on actual device |

---

## References

- [MediaDevices.getUserMedia() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Shelly Gen1 HTTP API](https://shelly-api-docs.shelly.cloud/gen1/) (see also: `shelly-cloud/shelly-gen1-api` Tessl tile)
- [K-Means Color Extraction](https://en.wikipedia.org/wiki/K-means_clustering)
