# API Contract: Shelly Bulb Communication (Gen1)

**Feature ID**: 001
**Date**: 2026-02-02
**Protocol**: HTTP/REST (Shelly Gen1 Local API)
**Tessl Tile**: `shelly-cloud/shelly-gen1-api@1.0.0`

---

## Overview

The application communicates with Shelly Duo RGBW bulbs using the Gen1 local HTTP API. All requests use query parameters (not JSON body). Discovery is mandatory before using actuator endpoints.

**Base URL**: `http://<bulb-ip>`

---

## Discovery Flow (MANDATORY)

Per Tessl tile steering rules, always perform discovery in this order:

### Step 1: Identify Device

**Request**:
```http
GET /shelly HTTP/1.1
Host: <bulb-ip>
```

**Response** (200 OK):
```json
{
  "type": "SHRGBW2",
  "mac": "AABBCCDDEEFF",
  "fw": "20230913-114432/v1.14.0",
  "auth": false
}
```

**Purpose**: Identify model, firmware, and whether auth is required.

---

### Step 2: Discover Capabilities

**Request**:
```http
GET /status HTTP/1.1
Host: <bulb-ip>
```

**Response** (200 OK):
```json
{
  "lights": [
    {
      "ison": true,
      "mode": "color",
      "red": 255,
      "green": 128,
      "blue": 64,
      "white": 0,
      "gain": 100,
      "brightness": 100
    }
  ],
  "meters": [
    { "power": 5.2 }
  ]
}
```

**Purpose**: Confirm `lights[]` array exists (enables `/light/{index}` endpoint).

---

### Step 3: Confirm Configuration

**Request**:
```http
GET /settings HTTP/1.1
Host: <bulb-ip>
```

**Response** (200 OK):
```json
{
  "device": {
    "type": "SHRGBW2",
    "mac": "AABBCCDDEEFF",
    "hostname": "shellyrgbw2-AABBCCDDEEFF"
  },
  "name": "Living Room Bulb",
  "mode": "color"
}
```

**Purpose**: Confirm device name and mode.

---

## Actuator Endpoints

### Set Light Color

**Request**:
```http
GET /light/0?turn=on&red=255&green=128&blue=64 HTTP/1.1
Host: <bulb-ip>
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `turn` | string | No | `on` or `off` (default: current state) |
| `red` | number | Yes* | Red component (0-255) |
| `green` | number | Yes* | Green component (0-255) |
| `blue` | number | Yes* | Blue component (0-255) |
| `white` | number | No | White component (0-255) |
| `gain` | number | No | Brightness/gain (0-100) |
| `transition` | number | No | Transition time in ms |

*RGB values required when setting color.

**Response** (200 OK):
```json
{
  "ison": true,
  "mode": "color",
  "red": 255,
  "green": 128,
  "blue": 64,
  "white": 0,
  "gain": 100
}
```

---

### Turn Light On/Off

**Request**:
```http
GET /light/0?turn=on HTTP/1.1
Host: <bulb-ip>
```

**Response** (200 OK):
```json
{
  "ison": true,
  "mode": "color",
  "red": 255,
  "green": 128,
  "blue": 64
}
```

---

### Get Light Status

**Request**:
```http
GET /light/0 HTTP/1.1
Host: <bulb-ip>
```

**Response** (200 OK):
```json
{
  "ison": true,
  "mode": "color",
  "red": 255,
  "green": 128,
  "blue": 64,
  "white": 0,
  "gain": 100,
  "brightness": 100
}
```

---

## Error Handling

### Device Offline

**Condition**: Network unreachable or device powered off

**Behavior**: Connection refused / timeout (fetch throws)

**Application Handling**: Transition bulb state to 'disconnected', begin auto-retry

---

### Authentication Required

**Condition**: Device has `auth: true` in `/shelly` response

**Handling**: Include Basic Auth header:
```http
Authorization: Basic base64(username:password)
```

**Note**: Most Shelly devices have auth disabled by default.

---

## Rate Limiting

Shelly Gen1 devices handle approximately 10 requests per second. The application throttles updates to 10 FPS (100ms interval).

**Recommendation**: Use `transition` parameter for smoother visual transitions:
```
/light/0?red=255&green=0&blue=0&transition=100
```

---

## Connection Flow

```
┌──────────────┐
│ User enters  │
│   IP address │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ GET /shelly      │
│ (identify device)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ GET /status      │
│ (discover lights)│
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
 lights[]   no lights
  found       found
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│CONNECTED│ │ FAILED │
└────┬───┘ │(not a  │
     │     │ bulb)  │
     │     └────────┘
     │ (every 100ms while streaming)
     ▼
┌──────────────────┐
│ GET /light/0?... │
│ (send color)     │
└──────────────────┘
```

---

## TypeScript Types

```typescript
interface ShellyDeviceInfo {
  type: string;
  mac: string;
  fw: string;
  auth: boolean;
}

interface ShellyLightStatus {
  ison: boolean;
  mode: 'color' | 'white';
  red: number;
  green: number;
  blue: number;
  white: number;
  gain: number;
  brightness: number;
}

interface ShellyStatus {
  lights: ShellyLightStatus[];
  meters?: { power: number }[];
}

interface ShellySettings {
  device: {
    type: string;
    mac: string;
    hostname: string;
  };
  name: string;
  mode: string;
}

// Color command parameters
interface LightSetParams {
  turn?: 'on' | 'off';
  red: number;
  green: number;
  blue: number;
  white?: number;
  gain?: number;
  transition?: number;
}
```

---

## Implementation Notes (from Tessl Tile Steering)

1. **Discovery First**: ALWAYS call `/shelly` → `/status` → `/settings` before using `/light/0`

2. **Never Assume**: Do not assume `lights[]` exists. Check `/status` response.

3. **Idempotent Commands**: Use explicit `turn=on` or `turn=off`, not toggles.

4. **Verify State**: After color change, verify via response or re-read `/status`.

5. **No Aggressive Polling**: 10 FPS max. Treat timeouts as "device unavailable".

6. **CORS**: Shelly devices allow cross-origin requests from browsers.

7. **Timeout**: Set 3-second timeout. Gen1 devices typically respond within 100ms.

8. **Transition**: Use `transition=100` for smooth color changes.
