# Core Endpoints (Common to Gen 1 devices)

This page lists the **core** Gen 1 local HTTP endpoints that are broadly applicable across device types.

> **Rule:** Always run discovery first (`/shelly` → `/status` → `/settings`).

---

## Conventions

* Base URL: `http://<device-host-or-ip>`
* Most endpoints return JSON
* Many endpoints accept **query parameters** (e.g., `?turn=on`)
* Some Gen 1 endpoints may accept/ignore different HTTP methods; rely on **endpoint + query parameters** rather than assuming a POST is required.

---

## Identity & Discovery

### `GET /shelly`

* Purpose: identify model + firmware + auth requirement
* Always available
* No auth required

Use it to detect:

* `type` (model)
* `fw` (firmware)
* `auth` (true/false)

### `GET /status`

* Purpose: current state + capabilities (relays, meters, lights, rollers, sensors, etc.)
* Auth required only if `auth: true` from `/shelly`

### `GET /settings`

* Purpose: configuration and mode
* Auth required only if enabled

Use it to confirm:

* device mode (e.g., relay vs roller)
* network config
* device name/location settings

---

## Device lifecycle

### `GET /reboot`

* Purpose: reboot the device
* State-changing (use sparingly)
* Auth required if enabled

Recommended usage:

* Only after applying settings that require reboot
* Wait for the device to come back online before issuing further commands

---

## OTA (firmware)

### `GET /ota`

* Purpose: view OTA status
* Auth required if enabled

### `GET /ota/check`

* Purpose: check for available firmware update
* Auth required if enabled

Notes:

* OTA calls may take time; use longer timeouts and poll `GET /ota`
* Do not perform OTA updates automatically in production without explicit user/operator approval

---

## Wi-Fi management

### `GET /wifiscan`

* Purpose: scan nearby Wi-Fi networks
* Auth required if enabled

### `GET /settings/sta`

* Purpose: configure station (client) Wi-Fi
* Typically state-changing (can drop connectivity)
* Auth required if enabled

### `GET /settings/ap`

* Purpose: configure access point mode
* State-changing
* Auth required if enabled

Safety notes:

* Any Wi-Fi reconfiguration can make the device unreachable.
* Prefer applying Wi-Fi changes only with explicit operator intent.

---

## Authentication configuration

### `GET /settings/login`

* Purpose: enable/disable local Basic Auth (device-level)
* State-changing

Important:

* `/shelly` remains accessible without auth even when auth is enabled.

---

## How to classify endpoints

When implementing integrations, classify endpoints as:

### Safe / read-only

* `/shelly`
* `/status`
* `/settings` (read)
* `/ota` (read)

### State-changing / risky

* `/reboot`
* `/settings/*` (writes)
* `/ota/check` (usually safe but can lead to update workflows)
* actuator endpoints (e.g., `/relay/{i}`, `/roller/{i}`, `/light/{i}`)

Guidance:

* For state-changing endpoints, prefer **idempotent commands** and **read-after-write** verification.

---

## Minimal baseline for any Gen 1 integration

1. `GET /shelly`
2. If `auth: true`, load credentials and prepare Basic Auth headers
3. `GET /status`
4. `GET /settings`
5. Use discovered capabilities to choose device-family endpoints
