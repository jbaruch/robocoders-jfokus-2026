# Error Handling (Steering Rules)

These are **behavioral rules** for agents when handling Shelly Gen 1 failures.
They are intentionally short and do **not** duplicate technical documentation.

## Classify failures correctly

* **ALWAYS** distinguish between:

  * **Timeout / connection failure** → device unreachable or sleeping
  * **401 Unauthorized** → auth misconfigured or missing
  * **404 Not Found** → wrong endpoint family or wrong mode (discovery bug)

* **DO NOT** treat `401` as "device offline".

* **DO NOT** treat timeouts as proof that an endpoint doesn’t exist.

## Retry behavior

* For **timeouts**, use limited retries with backoff.
* **DO NOT** retry aggressively or in tight loops.
* For battery/sleeping devices, prefer deferred retry rather than rapid polling.

## Response handling

* For non-2xx responses, **ALWAYS** surface:

  * HTTP status code
  * non-sensitive error body (if present)

* **DO NOT** assume every response is JSON.

* **DO NOT** throw away the error body; it often contains the reason.

## Safety

* If a state-changing command fails, **DO NOT** guess an alternative endpoint.
* Re-run discovery and validate mode/capabilities before attempting again.
