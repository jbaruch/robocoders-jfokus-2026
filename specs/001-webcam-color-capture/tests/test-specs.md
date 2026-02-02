# Test Specifications: Webcam Color Capture & IoT Bulb Control

**Generated**: 2026-02-02
**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

## TDD Assessment

**Determination**: mandatory
**Confidence**: high
**Evidence**: "Tests must be written before implementation code." / "No production code is written without a failing test first"
**Reasoning**: Constitution Principle 2 explicitly requires TDD with MUST language. All tests in this specification must pass before implementation is considered complete.

---

<!--
DO NOT MODIFY TEST ASSERTIONS

These test specifications define the expected behavior derived from requirements.
During implementation:
- Fix code to pass tests, don't modify test assertions
- Structural changes (file organization, naming) are acceptable with justification
- Logic changes to assertions require explicit justification and re-review

If requirements change, re-run /speckit-05-testify to regenerate test specs.
-->

---

## From spec.md (Acceptance Tests)

### TS-001: Webcam permission prompt on app open

**Source**: spec.md:US-001:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: The application is opened in a browser
**When**: The page loads
**Then**: The user is prompted to grant webcam access

**Traceability**: FR-001, US-001-scenario-1

---

### TS-002: Live feed appears after permission granted

**Source**: spec.md:US-001:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: The user is prompted for webcam access
**When**: The user grants permission
**Then**: The live webcam feed appears within 2 seconds

**Traceability**: FR-002, SC-001, US-001-scenario-2

---

### TS-003: Feed reflects real-time camera input

**Source**: spec.md:US-001:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: The webcam feed is streaming
**When**: The user moves their hand in front of the camera
**Then**: The feed reflects the movement in real-time

**Traceability**: FR-002, US-001-scenario-3

---

### TS-004: Red object shows red dominant color

**Source**: spec.md:US-002:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: The webcam is streaming
**When**: The camera points at a red object
**Then**: The dominant color display shows red

**Traceability**: FR-003, SC-002, US-002-scenario-1

---

### TS-005: Blue object shows blue dominant color

**Source**: spec.md:US-002:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: The webcam is streaming
**When**: The camera points at a blue object
**Then**: The dominant color display shows blue

**Traceability**: FR-003, SC-002, US-002-scenario-2

---

### TS-006: Color updates within 500ms of scene change

**Source**: spec.md:US-002:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: The webcam is streaming with a dominant color displayed
**When**: The scene changes (camera moved to different colored object)
**Then**: The color display updates within 500ms

**Traceability**: FR-003, NFR-002, US-002-scenario-3

---

### TS-007: Color display occupies significant screen space

**Source**: spec.md:US-003:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: The application is running
**When**: The color swatch is rendered
**Then**: The color display occupies at least 40% of the viewport width

**Traceability**: FR-004, NFR-001, US-003-scenario-1

---

### TS-008: Color swatch has clear boundaries

**Source**: spec.md:US-003:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: The application is running
**When**: The color swatch is rendered
**Then**: The color swatch has visible borders or shadows distinguishing it from background

**Traceability**: FR-004, US-003-scenario-2

---

### TS-009: Color hex value uses large readable text

**Source**: spec.md:US-003:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: The application is running
**When**: The hex code is displayed
**Then**: The text is at least 24px font size

**Traceability**: FR-005, NFR-001, US-003-scenario-3

---

### TS-010: Warning displayed when no webcam connected

**Source**: spec.md:US-004:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: No webcam is connected to the system
**When**: The application loads
**Then**: A warning message "Camera not found - please connect a webcam" is displayed

**Traceability**: FR-007, FR-016, SC-004, US-004-scenario-1

---

### TS-011: No unhandled errors when webcam missing

**Source**: spec.md:US-004:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: No webcam is connected to the system
**When**: The application loads
**Then**: No unhandled JavaScript errors are thrown

**Traceability**: FR-007, NFR-003, US-004-scenario-2

---

### TS-012: Interface remains responsive without webcam

**Source**: spec.md:US-004:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: No webcam is connected to the system
**When**: The application loads
**Then**: The bulb configuration UI remains functional and responsive

**Traceability**: FR-007, US-004-scenario-3

---

### TS-013: Warning appears within 2 seconds of webcam disconnect

**Source**: spec.md:US-005:scenario-1
**Type**: acceptance
**Priority**: P2

**Given**: The webcam is streaming
**When**: The webcam is disconnected
**Then**: A warning message appears within 2 seconds

**Traceability**: FR-008, US-005-scenario-1

---

### TS-014: Feed resumes within 3 seconds of webcam reconnect

**Source**: spec.md:US-005:scenario-2
**Type**: acceptance
**Priority**: P2

**Given**: The webcam was disconnected and warning is displayed
**When**: The webcam is reconnected
**Then**: The feed resumes within 3 seconds

**Traceability**: FR-008, SC-005, US-005-scenario-2

---

### TS-015: No page reload required for webcam recovery

**Source**: spec.md:US-005:scenario-3
**Type**: acceptance
**Priority**: P2

**Given**: The webcam was disconnected and reconnected
**When**: The feed resumes
**Then**: The recovery happened without a page reload

**Traceability**: FR-008, US-005-scenario-3

---

### TS-016: Connection attempted after valid IP entry

**Source**: spec.md:US-006:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: The bulb configuration UI is displayed
**When**: The user enters a valid IP address format
**Then**: Connection to the bulb is attempted (Gen1 discovery flow starts)

**Traceability**: FR-010, FR-011, US-006-scenario-1

---

### TS-017: Status shows connected after successful connection

**Source**: spec.md:US-006:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: A valid bulb IP was entered
**When**: The Gen1 discovery flow completes successfully
**Then**: The status indicator shows "connected"

**Traceability**: FR-011, FR-013, SC-007, US-006-scenario-2

---

### TS-018: Clear error message on connection failure

**Source**: spec.md:US-006:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: A bulb IP was entered
**When**: The connection fails (timeout or error)
**Then**: A clear error message is displayed ("Bulb not found - check IP address and network connection")

**Traceability**: FR-011, FR-016, US-006-scenario-3

---

### TS-019: Last IP address pre-filled on return visit

**Source**: spec.md:US-006:scenario-4
**Type**: acceptance
**Priority**: P1

**Given**: The user previously entered a bulb IP address
**When**: The user returns to the application
**Then**: The last IP address is pre-filled in the input field

**Traceability**: FR-010, US-006-scenario-4

---

### TS-020: Red object turns bulb red

**Source**: spec.md:US-007:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: The webcam is streaming and bulb is connected
**When**: The camera points at a red object
**Then**: The bulb color changes to red

**Traceability**: FR-012, SC-008, US-007-scenario-1

---

### TS-021: Blue object turns bulb blue

**Source**: spec.md:US-007:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: The webcam is streaming and bulb is connected
**When**: The camera points at a blue object
**Then**: The bulb color changes to blue

**Traceability**: FR-012, SC-008, US-007-scenario-2

---

### TS-022: Bulb color transitions appear smooth

**Source**: spec.md:US-007:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: The webcam is streaming and bulb is connected
**When**: Colors change rapidly in the camera view
**Then**: The bulb transitions smoothly without flickering (color smoothing applied)

**Traceability**: FR-012, US-007-scenario-3

---

### TS-023: Warning displayed when bulb not on network

**Source**: spec.md:US-008:scenario-1
**Type**: acceptance
**Priority**: P1

**Given**: No bulb is available on the network at the configured IP
**When**: Connection is attempted
**Then**: A warning message is displayed ("Bulb not found - check IP address and network connection")

**Traceability**: FR-014, FR-016, SC-009, US-008-scenario-1

---

### TS-024: Webcam features continue without bulb

**Source**: spec.md:US-008:scenario-2
**Type**: acceptance
**Priority**: P1

**Given**: No bulb is connected
**When**: The application is running
**Then**: Webcam feed and color extraction continue working

**Traceability**: FR-014, SC-009, US-008-scenario-2

---

### TS-025: Interface remains responsive without bulb

**Source**: spec.md:US-008:scenario-3
**Type**: acceptance
**Priority**: P1

**Given**: No bulb is connected
**When**: The application is running
**Then**: The interface remains responsive and styled correctly

**Traceability**: FR-014, US-008-scenario-3

---

### TS-026: Warning appears within 2 seconds of bulb disconnect

**Source**: spec.md:US-009:scenario-1
**Type**: acceptance
**Priority**: P2

**Given**: The bulb is connected
**When**: The bulb disconnects (network error)
**Then**: A warning message appears within 2 seconds

**Traceability**: FR-015, US-009-scenario-1

---

### TS-027: Bulb reconnects within 5 seconds of availability

**Source**: spec.md:US-009:scenario-2
**Type**: acceptance
**Priority**: P2

**Given**: The bulb was disconnected
**When**: The bulb becomes available again
**Then**: Connection resumes within 5 seconds

**Traceability**: FR-015, SC-010, US-009-scenario-2

---

### TS-028: No page reload required for bulb recovery

**Source**: spec.md:US-009:scenario-3
**Type**: acceptance
**Priority**: P2

**Given**: The bulb was disconnected and reconnected
**When**: The connection resumes
**Then**: The recovery happened without a page reload

**Traceability**: FR-015, US-009-scenario-3

---

## From plan.md (Contract Tests)

### TS-029: Shelly /shelly endpoint returns device info

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A Shelly bulb is available at the configured IP
**When**: GET /shelly is called
**Then**: Response contains type, mac, fw, auth fields as JSON

**Traceability**: FR-011, contracts/shelly-bulb-api.md

---

### TS-030: Shelly /status endpoint returns lights array

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A Shelly light bulb is available at the configured IP
**When**: GET /status is called
**Then**: Response contains lights[] array with ison, mode, red, green, blue fields

**Traceability**: FR-011, contracts/shelly-bulb-api.md

---

### TS-031: Shelly /settings endpoint returns device settings

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A Shelly bulb is available at the configured IP
**When**: GET /settings is called
**Then**: Response contains device.type, name, mode fields as JSON

**Traceability**: FR-011, contracts/shelly-bulb-api.md

---

### TS-032: Shelly /light/0 endpoint accepts color params

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A Shelly light bulb is connected
**When**: GET /light/0?red=255&green=128&blue=64 is called
**Then**: Response contains ison, mode, red, green, blue fields reflecting the set values

**Traceability**: FR-012, contracts/shelly-bulb-api.md

---

### TS-033: Shelly API timeout after 3 seconds

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A network request to the bulb is made
**When**: The bulb does not respond within 3 seconds
**Then**: The request times out and error is handled gracefully

**Traceability**: FR-012, contracts/shelly-bulb-api.md

---

### TS-034: Non-light device returns error

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A Shelly device without lights capability is at the IP
**When**: Discovery flow completes /status without lights[]
**Then**: Error message "Not a compatible device - please enter a Shelly light bulb IP" is shown

**Traceability**: FR-011, FR-016

---

### TS-035: Auth-enabled device returns error

**Source**: plan.md:contracts:shelly-api
**Type**: contract
**Priority**: P1

**Given**: A Shelly device with auth enabled is at the IP
**When**: /shelly returns auth: true
**Then**: Error message "Bulb requires authentication - please disable auth in bulb settings" is shown

**Traceability**: FR-011, FR-016

---

## From data-model.md (Validation Tests)

### TS-036: RGB values must be 0-255

**Source**: data-model.md:Color:validation
**Type**: validation
**Priority**: P1

**Given**: A Color object is being created
**When**: RGB values outside [0, 255] are provided
**Then**: The values are clamped or an error is returned

**Traceability**: data-model.md:Color

---

### TS-037: HSL hue must be 0-360

**Source**: data-model.md:Color:validation
**Type**: validation
**Priority**: P1

**Given**: A Color object is being created from HSL
**When**: Hue value outside [0, 360) is provided
**Then**: The value is normalized (modulo 360) or an error is returned

**Traceability**: data-model.md:Color

---

### TS-038: HSL saturation and lightness must be 0-100

**Source**: data-model.md:Color:validation
**Type**: validation
**Priority**: P1

**Given**: A Color object is being created from HSL
**When**: Saturation or lightness outside [0, 100] is provided
**Then**: The values are clamped or an error is returned

**Traceability**: data-model.md:Color

---

### TS-039: Hex must match #RRGGBB pattern

**Source**: data-model.md:Color:validation
**Type**: validation
**Priority**: P1

**Given**: A Color object is being created from hex
**When**: A hex string not matching /^#[0-9A-Fa-f]{6}$/ is provided
**Then**: An error is returned

**Traceability**: data-model.md:Color

---

### TS-040: RGB-HSL-Hex consistency invariant

**Source**: data-model.md:Invariants:1
**Type**: validation
**Priority**: P1

**Given**: A Color object with RGB values (r, g, b)
**When**: The HSL and hex properties are accessed
**Then**: All three representations are mathematically equivalent

**Traceability**: data-model.md:Invariants

---

### TS-041: Streaming requires stream property

**Source**: data-model.md:Invariants:2
**Type**: validation
**Priority**: P1

**Given**: WebcamStatus is being set to 'streaming'
**When**: The stream property is not provided
**Then**: TypeScript compilation fails (type guard)

**Traceability**: data-model.md:WebcamStatus, data-model.md:Invariants

---

### TS-042: Connected requires deviceInfo property

**Source**: data-model.md:Invariants:3
**Type**: validation
**Priority**: P1

**Given**: BulbStatus is being set to 'connected'
**When**: The deviceInfo property is not provided
**Then**: TypeScript compilation fails (type guard)

**Traceability**: data-model.md:BulbStatus, data-model.md:Invariants

---

### TS-043: Bulb states require IP (except not_configured)

**Source**: data-model.md:Invariants:4
**Type**: validation
**Priority**: P1

**Given**: BulbStatus is being set to discovering, connected, disconnected, or failed
**When**: The ip property is not provided
**Then**: TypeScript compilation fails (type guard)

**Traceability**: data-model.md:BulbStatus, data-model.md:Invariants

---

### TS-044: Color smoothing EMA produces valid colors

**Source**: data-model.md:Color
**Type**: validation
**Priority**: P1

**Given**: Two valid Color objects (previous and current)
**When**: EMA smoothing is applied (alpha=0.3)
**Then**: The result is a valid Color with RGB values in [0, 255]

**Traceability**: research.md:Color Smoothing

---

### TS-045: K-Means returns largest cluster centroid

**Source**: plan.md:Color Extraction
**Type**: unit
**Priority**: P1

**Given**: An array of pixel RGB values with a dominant color
**When**: K-Means clustering (k=5) is run
**Then**: The returned color is the centroid of the largest cluster

**Traceability**: FR-003, plan.md:Key Implementation Details

---

## Performance Tests

### TS-046: App interactive within 3 seconds

**Source**: spec.md:NFR-005
**Type**: performance
**Priority**: P1

**Given**: A fresh page load
**When**: The page is loaded
**Then**: The UI is interactive (rendered, accepting input) within 3 seconds

**Traceability**: NFR-005

---

### TS-047: Color extraction completes within 100ms

**Source**: spec.md:NFR-002
**Type**: performance
**Priority**: P1

**Given**: A video frame is captured
**When**: Color extraction is performed
**Then**: The dominant color is returned within 100ms

**Traceability**: NFR-002

---

### TS-048: Bulb updates throttled to 10 FPS

**Source**: spec.md:FR-012
**Type**: performance
**Priority**: P1

**Given**: The bulb is connected and colors are changing rapidly
**When**: Color updates are sent to the bulb
**Then**: No more than 10 updates per second are sent (100ms minimum interval)

**Traceability**: FR-012

---

## Accessibility Tests

### TS-049: Text meets WCAG AA contrast

**Source**: spec.md:NFR-006
**Type**: accessibility
**Priority**: P1

**Given**: The application is rendered
**When**: Text elements are analyzed
**Then**: All text meets WCAG AA contrast requirements (4.5:1 normal, 3:1 large)

**Traceability**: NFR-006

---

### TS-050: Interactive elements are keyboard accessible

**Source**: spec.md:NFR-006
**Type**: accessibility
**Priority**: P1

**Given**: The application is rendered
**When**: Tab key is pressed
**Then**: Focus moves to all interactive elements with visible focus indicators

**Traceability**: NFR-006

---

### TS-051: Status changes announced to screen readers

**Source**: spec.md:NFR-006
**Type**: accessibility
**Priority**: P1

**Given**: A screen reader is active
**When**: Connection status changes
**Then**: The status change is announced via ARIA live region

**Traceability**: NFR-006

---

## Summary

| Source | Count | Types |
|--------|-------|-------|
| spec.md | 28 | acceptance |
| plan.md/contracts | 7 | contract |
| data-model.md | 10 | validation, unit |
| NFR (performance) | 3 | performance |
| NFR (accessibility) | 3 | accessibility |
| **Total** | **51** | |

### Priority Distribution

| Priority | Count |
|----------|-------|
| P1 | 45 |
| P2 | 6 |
