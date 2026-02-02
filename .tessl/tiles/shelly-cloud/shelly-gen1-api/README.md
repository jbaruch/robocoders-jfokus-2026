# Shelly Gen1 Local HTTP API — Tessl Tile

This Tessl tile provides **comprehensive documentation and agent steering** for integrating with **Shelly Gen 1 smart home devices** via their **local HTTP API**.

It is designed for teams building reliable, discovery-first, and safe integrations (services, automations, internal tools) that communicate directly with Shelly devices on the local network.

---

## What this tile is

This tile bundles two complementary things:

1. **Technical documentation**

   * How the Shelly Gen 1 local HTTP API works
   * How to safely discover device capabilities
   * How to choose the correct endpoints for each device family
   * Java-first implementation patterns
   * Common pitfalls and troubleshooting guidance

2. **Agent steering rules**

   * Behavioral constraints for AI coding agents
   * Safety rules (discovery-first, idempotent commands, no secret leakage)
   * Error-handling expectations
   * Naming conventions for generated code

Together, these ensure both humans *and* agents interact with Shelly devices correctly.

---

## Scope

**Included**

* Shelly **Gen 1** devices
* Local device HTTP API
* Discovery-based, model-agnostic integrations
* Java examples and patterns

**Explicitly excluded**

* Shelly Gen 2 / Plus / Pro devices
* Shelly Cloud API
* Mobile app / UI usage

---

## How this tile is structured

### Documentation

The main documentation entrypoint is:

* `docs/index.md`

From there, the docs are organized by topic:

* Discovery & capability detection
* Authentication & secrets handling
* Core/common endpoints
* Device families and endpoint patterns
* Java client patterns
* Troubleshooting and common pitfalls

Agents retrieve documentation by following links from `docs/index.md`.

### Steering

Steering rules live under:

* `steering/`

These files contain **short, declarative rules** (MUST / NEVER / ALWAYS) that guide agent behavior.
They intentionally do **not** duplicate documentation or examples.

Steering rules are aggregated by Tessl into agent-specific rule files
(e.g. `.tessl/RULES.md`, `CLAUDE.md`, Cursor rules).

---

## Intended usage

This tile is intended to be:

* Installed as a **private tile** in a Tessl workspace
* Used by engineers writing integrations with Shelly devices
* Used by AI coding agents to generate correct, safe code

Typical workflows include:

* Building local control services
* Writing automation backends
* Managing fleets of Shelly devices programmatically

---

## Design principles

This tile follows a few core principles:

* **Discovery first**: never guess device capabilities
* **Safety over convenience**: avoid toggles and implicit behavior
* **Idempotent control**: explicit state changes with verification
* **Separation of concerns**:

  * docs explain *how and why*
  * steering enforces *must and must-not*

---

## Tile metadata

* Tile name: `jbaruch/shelly-gen1-api`
* Version: `1.0.0`
* Visibility: private

---

## Where to start

If you are new to this tile:

1. Read `docs/index.md`
2. Follow the discovery workflow before writing any control logic
3. Use the Java examples as a reference implementation

---

## Notes

This README is intended for **registry and repository consumers**.
It is not part of the agent documentation tree; agents use `docs/index.md` instead.
