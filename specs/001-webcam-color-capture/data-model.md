# Data Model: Webcam Color Capture & IoT Bulb Control

**Feature ID**: 001
**Date**: 2026-02-02

---

## Entities

### Color

Represents a color value with multiple format representations.

```typescript
interface Color {
  // RGB components (0-255)
  r: number;
  g: number;
  b: number;

  // HSL components (derived)
  h: number;  // 0-360 degrees
  s: number;  // 0-100 percent
  l: number;  // 0-100 percent

  // Hex representation (derived)
  hex: string;  // "#RRGGBB" format
}
```

**Validation Rules**:
- RGB values must be integers in range [0, 255]
- HSL hue must be in range [0, 360)
- HSL saturation and lightness must be in range [0, 100]
- Hex must match pattern `/^#[0-9A-Fa-f]{6}$/`

**Factory Function**:
```typescript
function createColor(r: number, g: number, b: number): Color;
function colorFromHex(hex: string): Color;
function colorFromHSL(h: number, s: number, l: number): Color;
```

---

### WebcamStatus

Represents the current state of webcam connectivity.

```typescript
type WebcamStatus =
  | { state: 'initial' }
  | { state: 'requesting' }
  | { state: 'streaming'; stream: MediaStream }
  | { state: 'denied'; error: 'NotAllowedError' }
  | { state: 'not_available'; error: 'NotFoundError' | 'NotReadableError' }
  | { state: 'disconnected'; previousStream: MediaStream };
```

**State Transitions**:
```
initial ──[requestAccess]──> requesting
requesting ──[granted]──> streaming
requesting ──[denied]──> denied
requesting ──[noDevice]──> not_available
streaming ──[trackEnded]──> disconnected
disconnected ──[deviceReconnect]──> streaming
```

---

### BulbStatus

Represents the current state of bulb connectivity.

```typescript
type BulbStatus =
  | { state: 'not_configured' }
  | { state: 'discovering'; ip: string }  // Running /shelly → /status → /settings
  | { state: 'connected'; ip: string; deviceInfo: BulbDeviceInfo }
  | { state: 'disconnected'; ip: string; lastError?: string }
  | { state: 'failed'; ip: string; error: string };
```

**State Transitions** (Gen1 discovery-first):
```
not_configured ──[ipEntered]──> discovering
discovering ──[/shelly OK]──> discovering (continue)
discovering ──[/status OK, lights[] found]──> discovering (continue)
discovering ──[/settings OK]──> connected
discovering ──[/status OK, no lights[]]──> failed ("Not a light device")
discovering ──[timeout/error]──> failed
connected ──[networkError]──> disconnected
disconnected ──[autoRetry]──> discovering
failed ──[retry]──> discovering
connected/disconnected/failed ──[clearIP]──> not_configured
```

---

### BulbDeviceInfo

Information about a connected Shelly bulb (from Gen1 discovery).

```typescript
interface BulbDeviceInfo {
  // From GET /shelly
  type: string;      // e.g., "SHRGBW2"
  mac: string;       // e.g., "AABBCCDDEEFF"
  firmware: string;  // e.g., "20230913-114432/v1.14.0"
  authRequired: boolean;

  // From GET /settings
  name: string;      // User-configured device name
  mode: string;      // "color" or "white"

  // From GET /status (discovery)
  hasLights: boolean;      // lights[] array present
  lightChannels: number;   // length of lights[]
}
```

---

### VideoFrame

Represents a single frame from the webcam feed used for color analysis.

```typescript
interface VideoFrame {
  imageData: ImageData;  // Canvas ImageData object
  timestamp: number;     // Performance.now() timestamp
  width: number;
  height: number;
}
```

**Notes**:
- Not persisted; exists only during processing
- Created from canvas.getImageData()
- Discarded after color extraction

---

### BulbConfiguration

Persisted configuration for bulb connection.

```typescript
interface BulbConfiguration {
  ip: string;           // Last entered IP address
  lastConnected?: number;  // Timestamp of last successful connection
}
```

**Storage**: Browser localStorage under key `shelly-bulb-config`

---

## State Machines

### Webcam State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────┐                                                   │
│   │ INITIAL │                                                   │
│   └────┬────┘                                                   │
│        │ requestAccess()                                        │
│        ▼                                                        │
│   ┌────────────┐                                                │
│   │ REQUESTING │                                                │
│   └─────┬──────┘                                                │
│         │                                                       │
│    ┌────┴────┬──────────────┐                                   │
│    │         │              │                                   │
│    ▼         ▼              ▼                                   │
│ ┌──────┐ ┌───────────┐ ┌──────────────┐                        │
│ │DENIED│ │STREAMING  │ │NOT_AVAILABLE │                        │
│ └──────┘ └─────┬─────┘ └──────────────┘                        │
│                │                                                │
│                │ track.onended                                  │
│                ▼                                                │
│         ┌──────────────┐                                        │
│         │ DISCONNECTED │◄───────────────┐                      │
│         └──────┬───────┘                │                      │
│                │ deviceReconnect()      │                      │
│                │                        │                      │
│                └────────────────────────┘                      │
│                        (auto-retry)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Bulb State Machine (Gen1 Discovery-First)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌────────────────┐                                            │
│   │ NOT_CONFIGURED │◄───────────────────────────────┐          │
│   └───────┬────────┘                                │          │
│           │ ipEntered(ip)                           │          │
│           ▼                                         │ clear()  │
│   ┌─────────────┐                                   │          │
│   │ DISCOVERING │◄────────────────┐                │          │
│   │ /shelly     │                 │                │          │
│   │ /status     │                 │                │          │
│   │ /settings   │                 │                │          │
│   └─────┬───────┘                 │                │          │
│         │                         │                │          │
│    ┌────┴────┐                    │ retry()       │          │
│    │         │                    │                │          │
│    ▼         ▼                    │                │          │
│ ┌─────────┐ ┌────────┐           │                │          │
│ │CONNECTED│ │ FAILED │───────────┘                │          │
│ └────┬────┘ └────────┘                            │          │
│      │       (no lights[] or timeout)             │          │
│      │                                             │          │
│      │ networkError                                │          │
│      ▼                                             │          │
│ ┌──────────────┐                                   │          │
│ │ DISCONNECTED │───────────────────────────────────┘          │
│ └──────┬───────┘                                              │
│        │ autoRetry (3 attempts)                               │
│        └─────────► DISCOVERING                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Application State

Combined application state structure:

```typescript
interface AppState {
  webcam: WebcamStatus;
  bulb: BulbStatus;
  currentColor: Color | null;
  smoothedColor: Color | null;
  bulbConfig: BulbConfiguration | null;

  // UI state
  isColorSending: boolean;
  lastBulbUpdateTime: number | null;
}
```

---

## Relationships

```
┌─────────────┐      extracts       ┌───────────┐
│ VideoFrame  │─────────────────────│   Color   │
└─────────────┘                     └─────┬─────┘
      │                                   │
      │ from                              │ sent to
      ▼                                   ▼
┌─────────────┐                     ┌───────────┐
│WebcamStatus │                     │BulbStatus │
│ (streaming) │                     │(connected)│
└─────────────┘                     └───────────┘
```

---

## Invariants

1. **Color Consistency**: RGB, HSL, and Hex representations of a Color must always be equivalent
2. **Streaming Requires Stream**: WebcamStatus can only be 'streaming' if stream property is set
3. **Connected Requires DeviceInfo**: BulbStatus can only be 'connected' if deviceInfo is present
4. **IP Required for Bulb States**: All BulbStatus states except 'not_configured' require ip property
5. **Smoothed Requires Current**: smoothedColor can only be non-null if currentColor has been set at least once
