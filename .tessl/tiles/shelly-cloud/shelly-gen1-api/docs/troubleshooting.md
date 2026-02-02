# Troubleshooting & Common Pitfalls

This page focuses on the issues that most often break Shelly Gen 1 integrations.

---

## 1) "It works in the browser but not in code"

Common causes:

* Missing timeouts in code → request hangs
* Missing auth header when auth is enabled → 401
* DNS/hostname differences (mDNS not resolved in your runtime)

Recommendations:

* Always use connect + read timeouts
* Prefer IP address over hostname until you confirm name resolution
* Log only non-sensitive request metadata (URL path, status code)

---

## 2) 401 Unauthorized

Symptoms:

* HTTP status code `401`

Root cause:

* Authentication enabled but request lacks correct Basic Auth

Fix:

* During discovery, call `GET /shelly` and check `auth: true`
* Ensure username/password are provided securely
* Ensure your request sets the standard `Authorization: Basic ...` header

Do **not** treat 401 as “device offline”.

---

## 3) Timeouts / device unreachable

Symptoms:

* Socket timeouts
* Connection refused
* Intermittent failures

Possible causes:

* Device is offline
* Wi-Fi is weak/unreliable
* Battery device is sleeping

Fix:

* Add retries with backoff for transient failures
* Do not hammer the device
* If battery-powered: treat unreachability as normal and retry later

---

## 4) Wrong endpoint family (404 / unexpected responses)

Symptoms:

* `404 Not Found`
* response doesn’t contain expected JSON keys

Root cause:

* Integration guessed endpoint family (relay/light/roller/etc.) without discovery

Fix:

* Always run discovery:

  * `/shelly` → device identity
  * `/status` → capabilities and channel counts
  * `/settings` → mode
* Only call endpoint families present in `/status`

---

## 5) Relay vs roller mode confusion (Shelly 2 / 2.5)

Symptoms:

* `/relay/{i}` calls fail on a shutter setup
* `/roller/{i}` calls fail on a relay setup

Root cause:

* Device is configured in the opposite mode

Fix:

* Use `/settings` to identify mode
* Use `/status` to confirm whether `relays[]` or `rollers[]` exists

Rule:

* `mode: roller` → `/roller/{i}`
* `mode: relay`  → `/relay/{i}`

---

## 6) Battery devices sleep

Affected examples:

* H&T
* Door/Window
* Motion
* Flood/Smoke

Symptoms:

* Requests time out most of the time
* State seems stale

What to do:

* Avoid frequent polling
* Treat `/status` reads as opportunistic (when the device is awake)
* Consider event-driven approaches (e.g., MQTT) if you need near-real-time updates

---

## 7) Wi-Fi configuration can lock you out

Endpoints like `/settings/sta` and `/settings/ap` can change connectivity.

Symptoms:

* Device becomes unreachable after applying Wi-Fi settings

Safe approach:

* Require explicit user/operator action before changing Wi-Fi
* Apply changes carefully and be prepared to fall back to AP mode

---

## 8) Error responses and parsing

Symptoms:

* JSON parsing fails
* error body is not JSON

Guidance:

* Treat non-2xx responses as errors
* Read error stream and surface it as a plain message
* Do not attempt to parse every response as JSON

---

## 9) Rate limiting / over-polling

Symptoms:

* Device becomes slow or unresponsive
* Increased timeouts

Fix:

* Do not poll `/status` aggressively (especially on low-power devices)
* Cache results and use sensible polling intervals

---

## Quick diagnosis checklist

1. Can you fetch `/shelly`?
2. Does `/shelly` say `auth: true`?
3. Can you fetch `/status` with the correct auth behavior?
4. Are you using the correct endpoint family for capabilities discovered in `/status`?
5. Is the device in the correct mode per `/settings`?
6. Is the device battery-powered and sleeping?
