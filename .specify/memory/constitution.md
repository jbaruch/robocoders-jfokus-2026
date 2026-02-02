<!--
╭─────────────────────────────────────────────────────────────────╮
│  SPEC-KIT CONSTITUTION - SYNC IMPACT REPORT                     │
├─────────────────────────────────────────────────────────────────┤
│  Version Change: N/A → 1.0.0 (initial ratification)             │
│  Modified Principles: N/A (new document)                        │
│  Added Sections: All (initial creation)                         │
│  Templates Requiring Updates: None (first constitution)         │
│  Follow-up TODOs: None                                          │
╰─────────────────────────────────────────────────────────────────╯
-->

# Project Constitution

**Project**: shelly-iot-color-picker
**Version**: 1.0.0
**Ratified**: 2026-02-02
**Last Amended**: 2026-02-02

---

## Preamble

This constitution establishes the governing principles for the shelly-iot-color-picker project: a live demonstration application that captures dominant color from a webcam and sends it to an IoT bulb in real-time.

This document defines non-negotiable rules, quality standards, and governance procedures that all contributors and generated artifacts must follow. Technology choices and implementation details are deferred to the plan phase.

---

## Principle 1: Demo-First Reliability

**Statement**: Reliability takes absolute precedence over features.

**Rules**:
- If a feature increases the risk of live failure, it must be simplified or removed
- Every user-facing path must have been demonstrated working before deployment
- No experimental or unproven patterns in production code
- Prefer boring, well-understood solutions over clever ones

**Rationale**: This project exists for a live conference demo at JFokus 2026. A failure on stage is catastrophic. Features that work 99% of the time are unacceptable—only features that work 100% of the time are acceptable.

---

## Principle 2: Test-Driven Development

**Statement**: Tests must be written before implementation code.

**Rules**:
- No production code is written without a failing test first
- Test coverage is not optional—it is the first artifact of any feature
- Tests must be deterministic and isolated
- Mocking is required for external dependencies (hardware, network)

**Rationale**: TDD ensures that every line of code has a clear purpose and verifiable behavior. For a demo application, this catches regressions before they become stage failures.

---

## Principle 3: Visual Feedback

**Statement**: The audience must understand system state at a glance.

**Rules**:
- Every state change must have visible representation
- Error states must be clearly distinguishable from normal operation
- The current dominant color must always be displayed
- Connection status to hardware must be visible

**Rationale**: Conference demos are visual experiences. The audience needs to see what's happening to understand the demonstration. Invisible state is useless state.

---

## Principle 4: Graceful Degradation

**Statement**: Missing hardware must not crash the application.

**Rules**:
- The application must start without a connected bulb
- The application must start without a connected webcam
- Missing hardware triggers visual warnings, not exceptions
- Reconnection must be automatic when hardware becomes available

**Rationale**: Stage environments are unpredictable. Hardware may disconnect, cables may fail, and networks may drop. The application must continue operating in a degraded mode rather than crashing.

---

## Principle 5: Intentional Design

**Statement**: UI must be clean, modern, and deliberately designed.

**Rules**:
- No generic or template-based aesthetics
- Every visual element must have a clear purpose
- Animations must be smooth and meaningful
- The interface must be readable from the back of a conference room

**Rationale**: Generic AI-generated UIs undermine credibility at technical conferences. The design must feel intentional and crafted, demonstrating attention to detail.

---

## Governance

### Amendment Procedure

1. Propose amendment in writing with rationale
2. Review impact on existing specifications and plans
3. Update version number according to semantic versioning:
   - **MAJOR**: Removal or incompatible redefinition of principles
   - **MINOR**: New principles or material expansions
   - **PATCH**: Clarifications, wording, or typo fixes
4. Update `Last Amended` date
5. Commit with message referencing the change

### Versioning Policy

This constitution follows semantic versioning. The version number reflects the stability of governance rules—higher major versions indicate significant governance changes that may require re-evaluation of existing artifacts.

### Compliance Review

All specifications, plans, and implementations must reference this constitution. During review:
- Verify each principle is respected
- Flag violations with specific principle references
- Require remediation before approval

---

## Appendix: Definitions

- **Demo**: A live presentation to an audience where failures are visible
- **Reliability**: The probability of correct operation approaches 100%
- **Graceful Degradation**: Continued operation with reduced capability rather than failure
- **Visual Feedback**: Information conveyed through the user interface about system state
