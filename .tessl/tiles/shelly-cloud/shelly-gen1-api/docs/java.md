# Java Client Patterns & Examples

This page provides **recommended Java patterns** for interacting with Shelly Gen 1 devices via the local HTTP API.

The goal is not a full SDK, but a **small, correct, reusable client layer** that:

* follows discovery-first rules
* handles authentication safely
* uses timeouts and clear error handling

---

## Design principles

* Discovery is mandatory (`/shelly` → `/status` → `/settings`)
* Prefer explicit, idempotent commands
* Treat network failures and auth failures differently
* Keep HTTP logic centralized

---

## Minimal HTTP helper

Use a single helper to execute requests.

```java
public class ShellyHttpClient {

    private final String baseUrl;
    private final boolean authEnabled;
    private final String username;
    private final String password;

    public ShellyHttpClient(String baseUrl,
                            boolean authEnabled,
                            String username,
                            String password) {
        this.baseUrl = baseUrl;
        this.authEnabled = authEnabled;
        this.username = username;
        this.password = password;
    }

    public String get(String path) throws IOException {
        URL url = new URL(baseUrl + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(3000);
        conn.setReadTimeout(5000);

        if (authEnabled) {
            String creds = username + ":" + password;
            String encoded = Base64.getEncoder()
                .encodeToString(creds.getBytes(StandardCharsets.UTF_8));
            conn.setRequestProperty("Authorization", "Basic " + encoded);
        }

        int status = conn.getResponseCode();
        InputStream stream = (status >= 200 && status < 300)
            ? conn.getInputStream()
            : conn.getErrorStream();

        return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
    }
}
```

Notes:

* Always set connect + read timeouts
* Centralize auth handling
* Do not log credentials

---

## Discovery flow in Java

```java
ShellyHttpClient unauthClient = new ShellyHttpClient(
    "http://192.168.1.50", false, null, null
);

String shellyJson = unauthClient.get("/shelly");
boolean authEnabled = parseAuthFlag(shellyJson);

ShellyHttpClient client = new ShellyHttpClient(
    "http://192.168.1.50",
    authEnabled,
    System.getenv("SHELLY_USER"),
    System.getenv("SHELLY_PASSWORD")
);

String statusJson = client.get("/status");
String settingsJson = client.get("/settings");
```

Rules:

* Never send auth headers until `/shelly` confirms auth is enabled
* Fail fast if auth is required but credentials are missing

---

## Example: turning a relay on/off safely

```java
public void setRelayState(ShellyHttpClient client, int channel, boolean on)
        throws IOException {
    String cmd = on ? "on" : "off";
    client.get("/relay/" + channel + "?turn=" + cmd);
}
```

Recommended follow-up:

* Re-read `/status` to confirm state

---

## Example: roller control

```java
public void openRoller(ShellyHttpClient client, int channel)
        throws IOException {
    client.get("/roller/" + channel + "?go=open");
}
```

Notes:

* Only valid if discovery detected `rollers[]`
* Do not use relay endpoints in roller mode

---

## Error handling patterns

### Network errors

* `SocketTimeoutException` → device unreachable or sleeping
* Retry cautiously (battery devices may sleep)

### HTTP errors

* `401` → authentication misconfigured
* `404` → endpoint family does not exist (discovery bug)

Handle these cases explicitly.

---

## JSON parsing

Use a standard JSON library (Jackson, Gson, etc.).

Recommended pattern:

* Parse `/status` into a dynamic map or DTO
* Drive behavior from discovered keys, not hardcoded models

---

## What *not* to do

* Do not hardcode endpoints based on device name
* Do not assume channel counts
* Do not toggle state blindly
* Do not poll aggressively

---

## Summary

* Centralize HTTP + auth logic
* Follow discovery-first flow
* Prefer explicit, idempotent commands
* Verify results via `/status`
