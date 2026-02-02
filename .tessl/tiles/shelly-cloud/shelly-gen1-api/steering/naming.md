# Naming (Steering Rules)

These are **naming conventions** for agents generating code that integrates with Shelly Gen 1 devices.

## General

* Prefer **intent-revealing** names over short or generic names.
* Prefer **explicit** method names over toggles or ambiguous actions.

## Recommended types

* Client: `ShellyGen1Client` or `ShellyHttpClient`
* Models: `ShellyDeviceInfo`, `ShellyStatus`, `ShellySettings`

## Recommended methods

* Discovery:

  * `getDeviceInfo()` (calls `/shelly`)
  * `getStatus()` (calls `/status`)
  * `getSettings()` (calls `/settings`)

* Control (examples):

  * `setRelayState(int channel, boolean on)`
  * `openRoller(int channel)` / `closeRoller(int channel)` / `stopRoller(int channel)`
  * `setBrightness(int channel, int brightnessPct)`

## Avoid

* Avoid names like `toggleRelay()`, `doThing()`, `callApi()`
* Avoid embedding credentials in names or strings (e.g., `urlWithPassword`)
