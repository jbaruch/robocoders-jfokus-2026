# Quickstart: Webcam Color Capture & IoT Bulb Control

**Feature ID**: 001
**Date**: 2026-02-02

---

## Development Setup

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Modern browser (Chrome 120+, Firefox 120+, Safari 17+)
- Webcam (for manual testing)
- Shelly Duo RGBW bulb on same network (for bulb integration testing)

### Installation

```bash
# Clone and install
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

### Environment Variables

None required. All configuration is done in-app (bulb IP address).

---

## Test Scenarios

### Unit Tests

#### Color Extraction (colorExtractor.test.ts)

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Single color image | All red pixels | `{ r: 255, g: 0, b: 0 }` |
| Two equal colors | 50% red, 50% blue | Largest cluster wins |
| Dominant color | 80% green, 20% red | `{ r: 0, g: 255, b: 0 }` (approx) |
| Black image | All `(0, 0, 0)` | `{ r: 0, g: 0, b: 0 }` |
| White image | All `(255, 255, 255)` | `{ r: 255, g: 255, b: 255 }` |

#### Color Conversion (colorConverter.test.ts)

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| RGB to Hex | `(255, 128, 0)` | `"#FF8000"` |
| RGB to HSL | `(255, 0, 0)` | `{ h: 0, s: 100, l: 50 }` |
| Hex to RGB | `"#00FF00"` | `{ r: 0, g: 255, b: 0 }` |
| HSL to RGB | `{ h: 240, s: 100, l: 50 }` | `{ r: 0, g: 0, b: 255 }` |
| Edge: Black | `(0, 0, 0)` | HSL `{ h: 0, s: 0, l: 0 }` |
| Edge: White | `(255, 255, 255)` | HSL `{ h: 0, s: 0, l: 100 }` |

#### Color Smoothing (colorSmoothing.test.ts)

| Scenario | Input Sequence | Expected Behavior |
|----------|----------------|-------------------|
| First color | `[red]` | Returns red unchanged |
| Same color | `[red, red, red]` | Returns red (stable) |
| Color transition | `[red, blue]` | Returns blend (purple-ish) |
| Rapid changes | `[red, green, blue, red]` | Smoothly trends, no jumps |

### Hook Tests

#### useWebcam (useWebcam.test.ts)

| Scenario | Setup | Action | Expected State |
|----------|-------|--------|----------------|
| Initial state | None | Hook mounts | `{ state: 'initial' }` |
| Request access | Mock getUserMedia | Call `requestAccess()` | `{ state: 'streaming', stream }` |
| Permission denied | Mock reject NotAllowedError | Call `requestAccess()` | `{ state: 'denied' }` |
| No camera | Mock reject NotFoundError | Call `requestAccess()` | `{ state: 'not_available' }` |
| Disconnect | Mock track.onended | Trigger ended event | `{ state: 'disconnected' }` |
| Reconnect | After disconnect, mock success | Auto-retry triggers | `{ state: 'streaming' }` |

#### useBulb (useBulb.test.ts)

| Scenario | Setup | Action | Expected State |
|----------|-------|--------|----------------|
| Initial state | None | Hook mounts | `{ state: 'not_configured' }` |
| Enter IP | None | Call `connect('192.168.1.100')` | `{ state: 'connecting' }` |
| Connect success | Mock fetch success | After connect | `{ state: 'connected', deviceInfo }` |
| Connect failure | Mock fetch reject | After connect | `{ state: 'failed', error }` |
| Send color | Connected state | Call `sendColor(red)` | Fetch called with color payload |
| Disconnect | Mock fetch error | After successful connection | `{ state: 'disconnected' }` |
| Auto-reconnect | Disconnected state | Wait 5 seconds | `{ state: 'connecting' }` |

### Integration Tests

#### App.test.tsx

| Scenario | Description | Verification |
|----------|-------------|--------------|
| Initial render | App loads without crash | Status shows "initial" for webcam |
| Webcam permission flow | Grant permission | Video feed appears, color extraction starts |
| Webcam denied | Deny permission | Error message displayed, no crash |
| No webcam | No device available | Warning displayed, app remains functional |
| Bulb configuration | Enter valid IP | Connection attempted |
| Bulb connected | Valid IP, mock success | Status shows "connected" |
| Color sync | Webcam streaming, bulb connected | Colors sent to bulb |
| Full graceful degradation | No webcam, no bulb | App loads, shows warnings, no crashes |

### Contract Tests

#### shellyApi.test.ts (Gen1 API)

| Scenario | Request | Expected Response |
|----------|---------|-------------------|
| Identify device | `GET /shelly` | JSON with type, mac, fw, auth |
| Discover capabilities | `GET /status` | JSON with `lights[]` array |
| Get settings | `GET /settings` | JSON with device, name, mode |
| Set light color | `GET /light/0?red=255&green=128&blue=64` | JSON with ison, mode, red, green, blue |
| Turn on/off | `GET /light/0?turn=on` | JSON with updated state |
| Invalid color values | RGB out of range | Handle gracefully (clamp values) |
| Network timeout | Slow response | Timeout after 3 seconds |
| Device offline | No response | Connection error |
| No lights capability | `/status` without `lights[]` | Mark as incompatible device |

---

## Manual Testing Checklist

### Webcam Tests

- [ ] App requests webcam permission on first load
- [ ] Permission dialog appears in browser
- [ ] Granting permission shows video feed
- [ ] Video feed updates in real-time
- [ ] Denying permission shows clear error message
- [ ] Disconnecting webcam shows warning (not crash)
- [ ] Reconnecting webcam resumes feed automatically
- [ ] Color swatch updates when camera view changes
- [ ] Hex code displays correctly (e.g., #FF5500)

### Bulb Tests

- [ ] IP input field is visible
- [ ] Can enter bulb IP address
- [ ] Connect button triggers connection attempt
- [ ] Successful connection shows "Connected" status
- [ ] Failed connection shows clear error
- [ ] Connected bulb changes color to match screen
- [ ] Color transitions are smooth (no flickering)
- [ ] Disconnecting bulb shows warning (not crash)
- [ ] Bulb reconnects automatically when available
- [ ] IP address persists after page reload

### Visual Tests

- [ ] Color swatch is large and prominent
- [ ] Interface is readable from 6+ meters
- [ ] Status indicators are clearly distinguishable
- [ ] Error states look different from success states
- [ ] Interface does not look generic/template-based
- [ ] Animations are smooth

### Stress Tests

- [ ] Rapid color changes don't crash app
- [ ] Waving hand in front of camera doesn't cause flicker
- [ ] Multiple connect/disconnect cycles don't cause memory leaks
- [ ] App remains responsive after 30+ minutes of operation

---

## Demo Rehearsal Scenarios

### Happy Path

1. Open app in browser
2. Grant webcam permission
3. Enter bulb IP address
4. Hold colored object in front of camera
5. Observe bulb changes to match

### Hardware Failure Recovery

1. Start with everything working
2. Unplug webcam
3. Verify warning appears, app doesn't crash
4. Plug webcam back in
5. Verify feed resumes automatically

### Network Failure Recovery

1. Start with everything working
2. Disconnect bulb from network
3. Verify warning appears, color display continues
4. Reconnect bulb to network
5. Verify bulb resumes receiving colors
