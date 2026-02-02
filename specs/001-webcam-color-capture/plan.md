# Implementation Plan: Webcam Color Capture & IoT Bulb Control

**Branch**: `001-webcam-color-capture` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-webcam-color-capture/spec.md`

---

## Summary

Build a web-based interface that captures the dominant color from a live webcam feed, displays it prominently for conference audiences, and sends it to a Shelly IoT bulb in real-time. The application must be demo-reliable (no crashes during live presentation), gracefully degrade when hardware is unavailable, and provide clear visual feedback of all system states.

---

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 19, Vite 7, Tailwind CSS 4
**Storage**: Browser localStorage (IP address persistence only)
**Testing**: Vitest 4 with React Testing Library
**Target Platform**: Modern browsers (Chrome, Firefox, Safari) on desktop
**Project Type**: Web application (frontend-only, no backend)
**Performance Goals**: 10 FPS color extraction, <100ms UI response, smooth 60fps animations
**Constraints**: Must work without external services; all processing client-side
**Scale/Scope**: Single-user demo application; one webcam, one bulb

---

## Constitution Check

*GATE: All principles validated. No violations detected.*

| Principle | Status | Implementation Approach |
|-----------|--------|------------------------|
| **1. Demo-First Reliability** | ✅ Pass | All user paths tested; no experimental patterns; K-Means algorithm is proven |
| **2. Test-Driven Development** | ✅ Pass | Tests written before implementation per TDD workflow |
| **3. Visual Feedback** | ✅ Pass | Connection status indicators; large color swatch; state changes visible |
| **4. Graceful Degradation** | ✅ Pass | App starts without webcam/bulb; visual warnings not crashes; auto-reconnect |
| **5. Intentional Design** | ✅ Pass | Custom Tailwind theme; no template UI; readable from 20m |

**Validated against constitution v1.0.0**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-webcam-color-capture/
  spec.md              # Feature specification
  plan.md              # This file
  research.md          # Phase 0 research output
  data-model.md        # Data entities and state machines
  quickstart.md        # Test scenarios and setup
  contracts/           # API contracts
    shelly-bulb-api.md # Bulb communication interface
  tasks.md             # Task breakdown (created by /speckit-06-tasks)
```

### Source Code (repository root)

```text
src/
  components/
    WebcamFeed.tsx           # Video display component
    ColorDisplay.tsx         # Dominant color swatch
    ConnectionStatus.tsx     # Status indicators
    BulbConfig.tsx           # IP input and connection UI
    ErrorBoundary.tsx        # Graceful error handling
  hooks/
    useWebcam.ts             # Webcam access and state management
    useBulb.ts               # Bulb connection and color sending
    useColorExtraction.ts    # Frame processing and K-Means
    useColorSmoothing.ts     # EMA color smoothing
  services/
    colorExtractor.ts        # K-Means implementation
    shellyApi.ts             # Bulb HTTP communication
    colorConverter.ts        # RGB/HSL/Hex conversions
  types/
    color.ts                 # Color type definitions
    webcam.ts                # Webcam state types
    bulb.ts                  # Bulb state types
  App.tsx                    # Main application component
  main.tsx                   # Entry point
  index.css                  # Tailwind imports and custom styles

tests/
  unit/
    colorExtractor.test.ts   # K-Means algorithm tests
    colorConverter.test.ts   # Conversion function tests
    colorSmoothing.test.ts   # EMA algorithm tests
  integration/
    useWebcam.test.ts        # Webcam hook with mocked API
    useBulb.test.ts          # Bulb hook with mocked fetch
    App.test.tsx             # Full application integration
  contract/
    shellyApi.test.ts        # Bulb API contract verification
```

**Structure Decision**: Frontend-only web application. No backend needed as bulb communication happens directly from browser and all state is client-side.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           React App                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐   │
│  │  WebcamFeed  │    │  ColorDisplay   │    │  ConnectionStatus │   │
│  │  Component   │    │  Component      │    │  Component        │   │
│  └──────┬───────┘    └────────┬────────┘    └────────┬─────────┘   │
│         │                     │                      │              │
│  ┌──────┴───────────────────┬┴──────────────────────┴──────────┐   │
│  │                          App.tsx                              │   │
│  │         (orchestrates state and data flow)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                     │                      │              │
│  ┌──────┴───────┐    ┌───────┴───────┐    ┌────────┴─────────┐    │
│  │  useWebcam   │    │ useColorExt   │    │    useBulb       │    │
│  │  (hook)      │────│ (hook)        │────│    (hook)        │    │
│  └──────┬───────┘    └───────┬───────┘    └────────┬─────────┘    │
│         │                    │                      │              │
└─────────┼────────────────────┼──────────────────────┼──────────────┘
          │                    │                      │
    ┌─────┴─────┐        ┌─────┴─────┐         ┌─────┴─────┐
    │  Browser  │        │  Canvas   │         │  Shelly   │
    │  MediaAPI │        │  API      │         │  Bulb     │
    └───────────┘        └───────────┘         └───────────┘
```

---

## Data Flow

1. **Webcam → Frame**: `useWebcam` captures video stream, renders to hidden canvas
2. **Frame → Pixels**: Canvas `getImageData()` provides pixel array
3. **Pixels → Color**: `colorExtractor` runs K-Means, returns dominant RGB
4. **Color → Smooth**: `useColorSmoothing` applies EMA for stable output
5. **Smooth → Display**: `ColorDisplay` renders swatch with hex code
6. **Smooth → Bulb**: `useBulb` throttles and sends to Shelly API

---

## Key Implementation Details

### Color Extraction (K-Means)

```typescript
// Simplified K-Means for dominant color
// 1. Sample pixels (every 10th pixel for performance)
// 2. Initialize k=5 centroids randomly from samples
// 3. Iterate until convergence (max 10 iterations)
// 4. Return centroid of largest cluster
```

### Webcam State Machine

```
INITIAL → REQUESTING → STREAMING
                    → DENIED
                    → NOT_AVAILABLE
STREAMING → DISCONNECTED → STREAMING (auto-reconnect)
```

### Bulb State Machine

```
NOT_CONFIGURED → CONNECTING → CONNECTED
                           → FAILED
CONNECTED → DISCONNECTED → CONNECTING (auto-reconnect)
```

### Throttling Strategy

- Color extraction: 10 FPS (100ms interval)
- Bulb updates: 10 FPS (100ms interval, debounced)
- UI updates: 60 FPS (React default)

---

## Testing Strategy

Per constitution Principle 2 (TDD), tests are written before implementation:

1. **Unit Tests**: Pure functions (color extraction, conversion, smoothing)
2. **Hook Tests**: React hooks with mocked browser APIs
3. **Integration Tests**: Full component trees with mocked externals
4. **Contract Tests**: Verify Shelly API request/response format

All external dependencies (MediaDevices, fetch, Canvas) are mocked in tests.

---

## Complexity Tracking

> No violations requiring justification. All technical choices align with constitution principles.

---

## Phase 1 Artifacts

- [research.md](./research.md) - Technical research and decisions
- [data-model.md](./data-model.md) - Entity definitions and state machines
- [quickstart.md](./quickstart.md) - Test scenarios and setup guide
- [contracts/shelly-bulb-api.md](./contracts/shelly-bulb-api.md) - Bulb API specification

---

## Next Steps

1. Run `/speckit-04-checklist` to generate quality checklists for requirements validation
2. Run `/speckit-06-tasks` to generate the detailed task breakdown
