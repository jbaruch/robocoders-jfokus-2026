# Shelly Gen1 Local HTTP API (Tessl Tile)

This tile documents how to interact with Shelly **Gen 1** devices over their **local HTTP API**
and provides agent steering for safe, discovery-first integrations (Java examples included).

## Scope

- ✅ Gen 1 **local device** HTTP API
- ❌ Gen 2 / “Plus/Pro” devices
- ❌ Shelly Cloud API

## Key rule: discovery first (do not guess endpoints)

Before using any actuator endpoint (relay/light/roller/etc), always:
1. `GET /shelly` (identify model)
2. `GET /status` (discover capabilities + current state)
3. `GET /settings` (confirm configuration, auth enabled, mode)

## Documentation

- [Discovery & capability detection](./discovery.md)
- [Authentication (Basic Auth) & secrets handling](./auth.md)
- [Core endpoints cheat sheet](./core-endpoints.md)
- [Device families & endpoint patterns](./device-families.md)
- [Java client patterns & examples](./java.md)
- [Troubleshooting & common pitfalls](./troubleshooting.md)

## How to use this tile

When implementing Shelly integration:
- Read **Discovery** first.
- Use the Java helper patterns in **Java** for request building, auth, timeouts, and JSON parsing.
- Follow the steering rules in this tile (safe/idempotent commands, no secret leakage).
