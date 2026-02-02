# Discovery and Safety (Steering Rules)

These are **behavioral rules** for agents working with Shelly Gen 1 devices.
They are intentionally short and do **not** duplicate technical documentation.

## Mandatory discovery

* **ALWAYS** perform discovery in this order before calling any actuator endpoint:

  1. `GET /shelly`
  2. `GET /status`
  3. `GET /settings`

* **NEVER** assume an endpoint family exists (relay/light/roller/meter/etc.) without discovery evidence.

* **NEVER** hardcode channel counts; derive counts from arrays in `/status` (e.g., `relays[]`, `rollers[]`, `lights[]`).

## Safe control behavior

* Prefer **idempotent** commands (explicit on/off/open/close) over toggles.

* After any **state-changing** command, **VERIFY** the result using the response or by re-reading `/status`.

* If the device mode affects behavior (e.g., relay vs roller), **ALWAYS** read `/settings` and follow the configured mode.

## Risky operations

* Treat these operations as **high-risk** and require explicit operator intent:

  * reboot
  * Wi-Fi configuration changes
  * firmware update flows

## Performance / stability

* **DO NOT** poll aggressively.
* If timeouts occur, treat them as "device unavailable" (offline or sleeping) rather than guessing endpoints or modes.
