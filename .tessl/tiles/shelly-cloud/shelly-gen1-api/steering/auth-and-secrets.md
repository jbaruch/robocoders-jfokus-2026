# Auth and Secrets (Steering Rules)

These are **behavioral rules** for agents regarding authentication and secret handling.
They are intentionally short and do **not** duplicate technical documentation.

## Authentication behavior

* **DO NOT** assume authentication is enabled or disabled.
* **ALWAYS** check `GET /shelly` and follow the `auth` flag.
* If `auth: true`, **ALWAYS** use standard HTTP Basic Auth headers for subsequent calls.

## Secret handling

* **NEVER** hardcode credentials in source code.

* **NEVER** log credentials or include them in exceptions.

* **NEVER** echo credentials in output, tests, or sample configs.

* **ALWAYS** load credentials from secure configuration (env vars, secrets manager, vault, encrypted config).

* If auth is required but credentials are missing, **FAIL FAST** with a clear, non-sensitive error message.

## Diagnostics

* If requests return `401 Unauthorized`, treat it as an **auth configuration** problem (not connectivity).
* Log only non-sensitive request metadata (path, status code, correlation id), never headers containing secrets.
