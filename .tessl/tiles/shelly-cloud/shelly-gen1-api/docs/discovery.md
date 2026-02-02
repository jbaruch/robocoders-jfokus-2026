# Discovery & Capability Detection (Mandatory)

Shelly Gen 1 devices share a **common core API** but expose **different actuator endpoints** depending on model, configuration, and mode.

**Never assume** that a given endpoint exists. Always discover capabilities at runtime.

---

## Discovery workflow (always follow this order)

### 1) Identify the device: `GET /shelly`

This endpoint:

* Is always available
* Does **not** require authentication
* Identifies the device model and firmware

Example response (simplified):

```json
{
  "type": "SHSW-1",
  "mac": "ECFABCD12345",
  "fw": "20230913-114432/v1.14.0",
  "auth": false
}
```

Use this response to:

* Confirm **Gen 1** device
* Record device type/model
* Check whether authentication is enabled (`auth: true|false`)

---

### 2) Discover capabilities & current state: `GET /status`

This is the **most important discovery endpoint**.

`/status` reveals:

* Which functional blocks exist (relays, meters, lights, rollers, sensors, etc.)
* How many channels of each type exist
* Current state and readings

Example patterns to look for:

#### Relay-capable device

```json
{
  "relays": [
    { "ison": false, "has_timer": true }
  ]
}
```

#### Roller / shutter device

```json
{
  "rollers": [
    { "state": "stop", "pos": 65 }
  ]
}
```

#### Metering

```json
{
  "meters": [
    { "power": 123.4, "energy": 4567 }
  ]
}
```

#### Sensors / battery devices

```json
{
  "temperature": 21.6,
  "humidity": 44,
  "bat": { "value": 92 }
}
```

**Rule:** If a key is present in `/status`, the corresponding endpoint family exists. If it is absent, do not call those endpoints.

---

### 3) Confirm configuration & modes: `GET /settings`

Use `/settings` to:

* Confirm whether authentication is enabled
* Determine device **mode** (important for multi-mode devices)
* Inspect channel configuration

Example: Shelly 2 / 2.5 mode detection

```json
{
  "mode": "roller"
}
```

* `mode: "relay"` → use `/relay/{i}`
* `mode: "roller"` → use `/roller/{i}`

Calling the wrong endpoint for the current mode will fail.

---

## Capability-to-endpoint mapping (generic)

Use the following mapping logic after discovery:

| Detected in `/status` | Use endpoint family     |
| --------------------- | ----------------------- |
| `relays[]`            | `/relay/{index}`        |
| `rollers[]`           | `/roller/{index}`       |
| `lights[]`            | `/light/{index}`        |
| `meters[]`            | `/meter/{index}`        |
| `emeters[]`           | `/emeter/{index}`       |
| `thermostats[]`       | `/thermostat/{index}`   |
| sensor fields         | read-only via `/status` |

Indexes always start at `0`.

---

## Idempotent control rule

After discovery:

* Prefer **explicit state commands** (`turn=on`, `turn=off`, `go=open`, `go=close`)
* Avoid toggle-style logic unless explicitly required

Always verify the result:

* Use the endpoint response body **or**
* Re-read `/status`

---

## Sleeping / battery-powered devices

Some Gen 1 devices (H&T, Door/Window, Motion, etc.):

* Sleep most of the time
* Only respond briefly when awake

Implications:

* Discovery may fail while the device sleeps
* Commands may need retry or deferred execution
* Treat timeouts as “device unavailable”, not “misconfigured”

---

## Summary (non-negotiable rules)

* Always call `/shelly` → `/status` → `/settings`
* Never guess which endpoint families exist
* Never assume device mode
* Never hardcode channel counts
* Base all control logic on discovered capabilities