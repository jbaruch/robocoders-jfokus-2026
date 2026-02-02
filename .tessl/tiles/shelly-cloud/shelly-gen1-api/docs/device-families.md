# Device Families & Endpoint Patterns

Shelly Gen 1 devices expose **different actuator endpoint families** depending on hardware model and configuration.

This document explains how to map **discovered capabilities** (from `/status` and `/settings`) to the correct endpoint families.

> **Rule:** Never choose an endpoint family without discovery.

---

## Relay devices

### How to detect

From `GET /status`:

```json
{
  "relays": [
    { "ison": false }
  ]
}
```

### Endpoint family

```
/relay/{index}
```

Indexes start at `0`.

### Common commands

* Turn on:

  ```
  /relay/0?turn=on
  ```

* Turn off:

  ```
  /relay/0?turn=off
  ```

### Notes

* Prefer explicit `turn=on|off` over toggling
* Some relays support timers (`timer=<seconds>`)

---

## Roller / shutter devices

Common on Shelly 2 / 2.5 when configured in roller mode.

### How to detect

From `GET /status`:

```json
{
  "rollers": [
    { "state": "stop", "pos": 40 }
  ]
}
```

From `GET /settings`:

```json
{ "mode": "roller" }
```

### Endpoint family

```
/roller/{index}
```

### Common commands

* Open:

  ```
  /roller/0?go=open
  ```

* Close:

  ```
  /roller/0?go=close
  ```

* Stop:

  ```
  /roller/0?go=stop
  ```

* Set position (if calibrated):

  ```
  /roller/0?go=to_pos&roller_pos=50
  ```

### Notes

* Calibration is required for position-based control
* Do not use `/relay/*` when in roller mode

---

## Light devices (dimmers, bulbs, RGBW)

Includes:

* Shelly Dimmer
* Shelly Bulb / Duo / Vintage
* Shelly RGBW2 (mode-dependent)

### How to detect

From `GET /status`:

```json
{
  "lights": [
    { "ison": true, "brightness": 80 }
  ]
}
```

### Endpoint family

```
/light/{index}
```

(Some color devices may expose `/color/{index}` instead.)

### Common commands

* Turn on:

  ```
  /light/0?turn=on
  ```

* Set brightness:

  ```
  /light/0?brightness=50
  ```

### Notes

* RGB / color-capable devices may have different parameter sets
* Always inspect `/status` fields before issuing color commands

---

## Metering & energy monitoring

Includes:

* Shelly Plug / Plug S
* Shelly EM / 3EM
* Relay devices with power measurement

### How to detect

From `GET /status`:

```json
{
  "meters": [
    { "power": 123.4, "energy": 4567 }
  ]
}
```

Or:

```json
{
  "emeters": [
    { "power": 456.7 }
  ]
}
```

### Endpoint families

* `/meter/{index}`
* `/emeter/{index}`

### Notes

* Metering endpoints are typically **read-only**
* Power values are instantaneous; energy is cumulative

---

## Thermostats (TRV)

### How to detect

From `GET /status`:

```json
{
  "thermostats": [
    { "target_t": { "value": 21.0 } }
  ]
}
```

### Endpoint family

```
/thermostat/{index}
```

### Notes

* Temperature units are Celsius
* Commands typically set target temperature

---

## Sensors & battery devices

Includes:

* H&T
* Door/Window
* Motion
* Flood
* Smoke

### How to detect

Sensor values appear directly in `/status`:

```json
{
  "temperature": 22.3,
  "humidity": 40,
  "lux": 123,
  "bat": { "value": 91 }
}
```

### Endpoint behavior

* Typically **read-only**
* No actuator endpoints
* Devices may sleep frequently

### Notes

* Treat timeouts as expected behavior
* Do not poll aggressively

---

## Multi-channel devices

Some devices expose multiple channels:

```json
{
  "relays": [ {}, {} ]
}
```

Rules:

* Channel count is determined dynamically
* Indexes always start at `0`
* Never assume channel count based on model name

---

## Summary mapping

| Detected capability | Endpoint family    |
| ------------------- | ------------------ |
| `relays[]`          | `/relay/{i}`       |
| `rollers[]`         | `/roller/{i}`      |
| `lights[]`          | `/light/{i}`       |
| `meters[]`          | `/meter/{i}`       |
| `emeters[]`         | `/emeter/{i}`      |
| `thermostats[]`     | `/thermostat/{i}`  |
| sensors only        | read via `/status` |

Always derive behavior from discovery, not from device names.
