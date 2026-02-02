# Authentication & Secrets Handling

Shelly Gen 1 devices use **HTTP Basic Authentication** for local access *only when explicitly enabled*.

Authentication behavior is simple but easy to misuse. Follow the rules below.

---

## When authentication applies

* By default, **no authentication is enabled** on Gen 1 devices
* Authentication is enabled via the device UI or `/settings/login`
* When enabled, **all endpoints except `/shelly` require authentication**

`GET /shelly`:

* Always accessible
* Never requires authentication

`GET /status`, `/settings`, and actuator endpoints:

* Require Basic Auth **only if auth is enabled**

---

## Detecting whether auth is enabled

Use `GET /shelly` during discovery.

Example:

```json
{
  "type": "SHSW-1",
  "fw": "20230913-114432/v1.14.0",
  "auth": true
}
```

Rules:

* `auth: false` → do **not** send Authorization header
* `auth: true`  → send Authorization header on all subsequent requests

Do not guess. Always rely on discovery.

---

## HTTP Basic Auth format

Shelly Gen 1 uses standard HTTP Basic Authentication:

```
Authorization: Basic base64(username:password)
```

Example (conceptual):

```
Authorization: Basic YWRtaW46c2VjcmV0
```

---

## Java example: authenticated request

```java
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setConnectTimeout(3000);
conn.setReadTimeout(5000);

if (authEnabled) {
    String creds = username + ":" + password;
    String encoded = Base64.getEncoder()
        .encodeToString(creds.getBytes(StandardCharsets.UTF_8));
    conn.setRequestProperty("Authorization", "Basic " + encoded);
}
```

Notes:

* Use timeouts (devices may be offline or sleeping)
* Only attach auth header **after** discovery confirms it is required

---

## Secret handling rules (non-negotiable)

**MUST NOT:**

* Hardcode credentials in source code
* Log usernames or passwords
* Include credentials in exception messages

**MUST:**

* Load credentials from environment variables, secret managers, or secure config
* Treat missing credentials as a configuration error

**SHOULD:**

* Validate credentials once during startup
* Fail fast with a clear error if auth is enabled but credentials are missing

---

## Error handling

### HTTP 401 Unauthorized

If you receive `401 Unauthorized`:

* Re-check discovery result (`/shelly` → `auth: true`)
* Verify credentials are present and correct
* Do **not** assume the device is offline

### Timeouts vs auth errors

* Timeout → device unreachable or sleeping
* 401 → authentication misconfigured

Handle these cases separately.

---

## Summary

* Authentication is **optional** and explicitly enabled
* `/shelly` never requires auth
* Detect auth requirement via discovery
* Use HTTP Basic Auth correctly
* Never leak or log secrets