# Implementation Tasks: Webcam Color Capture & IoT Bulb Control

**Feature ID**: 001
**Created**: 2026-02-02
**Source**: [spec.md](spec.md), [plan.md](plan.md)
**Test Specs**: [test-specs.md](tests/test-specs.md)

---

## Task Legend

- **[USX]** - User Story reference (US-001 through US-009)
- **[P]** - Can be executed in parallel with other [P] tasks in same phase
- **TS-XXX** - Test Specification reference (TDD: write test first, then implement)
- **Priority**: P1 = Must have for MVP, P2 = Important but can follow

---

## Phase 1: Project Setup

### T001 - Initialize Vite + React + TypeScript project
**Priority**: P1
**Dependencies**: None
**Estimated Complexity**: Low

Initialize the project with Vite 7, React 19, and TypeScript 5.x configuration.

**Acceptance Criteria**:
- [ ] `npm create vite@latest` with React + TypeScript template
- [ ] TypeScript strict mode enabled
- [ ] Project builds without errors
- [ ] Dev server starts successfully

**Test Specs**: N/A (setup task)

---

### T002 - Configure Tailwind CSS 4
**Priority**: P1
**Dependencies**: T001
**Estimated Complexity**: Low

Install and configure Tailwind CSS 4 with custom design tokens per NFR-004.

**Acceptance Criteria**:
- [ ] Tailwind CSS 4 installed and configured
- [ ] Custom color palette defined (not default framework colors)
- [ ] Consistent spacing system configured
- [ ] Styles apply correctly to test component

**Test Specs**: N/A (setup task)

---

### T003 - Configure Vitest + React Testing Library
**Priority**: P1
**Dependencies**: T001
**Estimated Complexity**: Low

Set up Vitest 4 with React Testing Library for component and unit testing.

**Acceptance Criteria**:
- [ ] Vitest 4 installed and configured
- [ ] React Testing Library installed
- [ ] jsdom environment configured
- [ ] Sample test runs successfully
- [ ] Coverage reporting enabled

**Test Specs**: N/A (setup task)

---

### T004 - Create project structure
**Priority**: P1
**Dependencies**: T001, T002, T003
**Estimated Complexity**: Low

Create the directory structure per plan.md.

**Acceptance Criteria**:
- [ ] `src/components/` directory created
- [ ] `src/hooks/` directory created
- [ ] `src/services/` directory created
- [ ] `src/types/` directory created
- [ ] `src/utils/` directory created

**Test Specs**: N/A (setup task)

---

## Phase 2: Core Types & Entities

### T005 [P] - Define Color entity and utilities
**Priority**: P1
**Dependencies**: T004
**Estimated Complexity**: Medium

Implement the Color entity with RGB/HSL conversion utilities.

**TDD Process**:
1. Write tests for TS-036, TS-037, TS-038, TS-039, TS-040
2. Implement Color type and conversion functions
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Color type with RGB components (0-255)
- [ ] Color type with HSL components
- [ ] `rgbToHsl()` conversion function
- [ ] `hslToRgb()` conversion function
- [ ] `colorToHex()` function returning #RRGGBB format
- [ ] All conversions are reversible within rounding tolerance

**Test Specs**: TS-036, TS-037, TS-038, TS-039, TS-040

---

### T006 [P] - Define WebcamStatus state machine
**Priority**: P1
**Dependencies**: T004
**Estimated Complexity**: Low

Implement WebcamStatus enum and state transition logic.

**TDD Process**:
1. Write tests for state transitions (TS-041)
2. Implement WebcamStatus type
3. Verify tests pass

**Acceptance Criteria**:
- [ ] WebcamStatus enum: 'requesting' | 'connected' | 'disconnected' | 'denied' | 'unavailable'
- [ ] State transition validation function
- [ ] Type exports from `src/types/`

**Test Specs**: TS-041

---

### T007 [P] - Define BulbStatus state machine
**Priority**: P1
**Dependencies**: T004
**Estimated Complexity**: Low

Implement BulbStatus enum and state transition logic.

**TDD Process**:
1. Write tests for state transitions including 'discovering' (TS-042, TS-043)
2. Implement BulbStatus type
3. Verify tests pass

**Acceptance Criteria**:
- [ ] BulbStatus enum: 'not_configured' | 'connecting' | 'discovering' | 'connected' | 'disconnected' | 'failed'
- [ ] State transition validation function
- [ ] Type exports from `src/types/`

**Test Specs**: TS-042, TS-043

---

### T008 [P] - Define BulbDeviceInfo type
**Priority**: P1
**Dependencies**: T004
**Estimated Complexity**: Low

Implement BulbDeviceInfo type for Gen1 API discovery response.

**Acceptance Criteria**:
- [ ] BulbDeviceInfo type with: type, mac, auth, fw, lights array
- [ ] Type guards for validation
- [ ] Type exports from `src/types/`

**Test Specs**: TS-042 (deviceInfo validation)

---

## Phase 3: Webcam Core (US-001, US-002)

### T009 - Implement useWebcam hook - permission request
**Priority**: P1
**Dependencies**: T006
**Estimated Complexity**: Medium
**Story**: [US1]

Implement the webcam hook with permission handling.

**TDD Process**:
1. Write tests for TS-001, TS-002, TS-003
2. Implement useWebcam hook permission logic
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Hook requests webcam permission on mount
- [ ] Returns status: WebcamStatus
- [ ] Returns videoRef: RefObject<HTMLVideoElement>
- [ ] Handles permission denial gracefully
- [ ] Updates status to 'denied' when permission refused

**Test Specs**: TS-001, TS-002, TS-003

---

### T010 - Implement useWebcam hook - stream management
**Priority**: P1
**Dependencies**: T009
**Estimated Complexity**: Medium
**Story**: [US1]

Add stream connection and management to useWebcam hook.

**TDD Process**:
1. Write tests for TS-002, TS-003
2. Implement stream connection logic
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Connects to webcam stream after permission granted
- [ ] Feed visible within 2 seconds of permission grant (SC-001)
- [ ] Updates status to 'connected' when streaming
- [ ] Properly cleans up stream on unmount

**Test Specs**: TS-002, TS-003

---

### T011 - Implement WebcamFeed component
**Priority**: P1
**Dependencies**: T010
**Estimated Complexity**: Medium
**Story**: [US1]

Create the WebcamFeed component displaying live video.

**TDD Process**:
1. Write tests for TS-003
2. Implement WebcamFeed component
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Displays live video feed from useWebcam hook
- [ ] Feed updates smoothly without noticeable lag
- [ ] Appropriate dimensions for display (FR-004)
- [ ] Styled per NFR-004 (intentional design)

**Test Specs**: TS-003

---

### T012 - Implement dominant color extraction
**Priority**: P1
**Dependencies**: T005, T010
**Estimated Complexity**: High
**Story**: [US2]

Implement K-Means clustering algorithm for dominant color extraction.

**TDD Process**:
1. Write tests for TS-004, TS-005, TS-006, TS-045, TS-047
2. Implement extractDominantColor utility
3. Verify tests pass

**Acceptance Criteria**:
- [ ] K-Means clustering with k=5 clusters
- [ ] Returns single largest color cluster by pixel count
- [ ] Processes frame within 100ms (NFR-002)
- [ ] Handles edge cases (black frames return #000000)

**Test Specs**: TS-004, TS-005, TS-006, TS-045, TS-047

---

### T013 - Implement useColorExtraction hook
**Priority**: P1
**Dependencies**: T012
**Estimated Complexity**: Medium
**Story**: [US2]

Create hook that continuously extracts color from video feed.

**TDD Process**:
1. Write tests for TS-006
2. Implement useColorExtraction hook
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Extracts color from video frames continuously
- [ ] Updates within 500ms of scene change (US-002)
- [ ] Returns current Color value
- [ ] Applies EMA smoothing (alpha=0.3)

**Test Specs**: TS-006

---

### T014 - Implement ColorSwatch component
**Priority**: P1
**Dependencies**: T005
**Estimated Complexity**: Medium
**Story**: [US3]

Create the large color swatch display component.

**TDD Process**:
1. Write tests for TS-007, TS-008, TS-009
2. Implement ColorSwatch component
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Large, prominent display (FR-004)
- [ ] Equal visual emphasis with webcam feed
- [ ] 150ms ease-out transition on color change
- [ ] Displays hex code (#RRGGBB) alongside swatch
- [ ] Readable from 20+ meters (NFR-001)

**Test Specs**: TS-007, TS-008, TS-009

---

## Phase 4: Webcam Resilience (US-004, US-005)

### T015 - Implement webcam unavailable state
**Priority**: P1
**Dependencies**: T011
**Estimated Complexity**: Medium
**Story**: [US4]

Handle missing webcam gracefully with degraded UI.

**TDD Process**:
1. Write tests for TS-010, TS-011, TS-012
2. Implement degraded state handling
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Application loads without crashing when no webcam
- [ ] Placeholder displayed in webcam area with status message
- [ ] Color swatch shows neutral gray with "No color" text
- [ ] Interface remains responsive and styled

**Test Specs**: TS-010, TS-011, TS-012

---

### T016 - Implement webcam disconnection detection
**Priority**: P2
**Dependencies**: T010
**Estimated Complexity**: Medium
**Story**: [US5]

Detect and handle webcam disconnection during use.

**TDD Process**:
1. Write tests for TS-013
2. Implement disconnection detection
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Detects stream end/track ended events
- [ ] Updates status to 'disconnected' within 2 seconds
- [ ] Displays warning message (FR-016)
- [ ] No crashes or unhandled errors

**Test Specs**: TS-013

---

### T017 - Implement webcam automatic reconnection
**Priority**: P2
**Dependencies**: T016
**Estimated Complexity**: Medium
**Story**: [US5]

Automatically reconnect to webcam when available again.

**TDD Process**:
1. Write tests for TS-014, TS-015
2. Implement auto-reconnection logic
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Detects when disconnected camera becomes available
- [ ] Resumes feed within 3 seconds of reconnection (SC-005)
- [ ] No page reload required
- [ ] Handles permission revocation mid-session (FR-008)

**Test Specs**: TS-014, TS-015

---

## Phase 5: Bulb Configuration (US-006)

### T018 - Implement Shelly Gen1 API service
**Priority**: P1
**Dependencies**: T007, T008
**Estimated Complexity**: High
**Story**: [US6]

Create service for Shelly Gen1 HTTP API communication.

**TDD Process**:
1. Write contract tests for TS-029, TS-030, TS-031, TS-032, TS-033
2. Implement ShellyBulbService
3. Verify tests pass

**Acceptance Criteria**:
- [ ] `GET /shelly` - device info endpoint
- [ ] `GET /status` - device status endpoint
- [ ] `GET /settings` - device settings endpoint
- [ ] `GET /light/0?red=X&green=Y&blue=Z` - color control
- [ ] Discovery flow: /shelly → /status → /settings
- [ ] 3 second timeout on all requests (FR-012)
- [ ] Handles malformed responses gracefully

**Test Specs**: TS-029, TS-030, TS-031, TS-032, TS-033

---

### T019 - Implement IP address input component
**Priority**: P1
**Dependencies**: T004
**Estimated Complexity**: Low
**Story**: [US6]

Create IP address input field with validation.

**TDD Process**:
1. Write tests for TS-016
2. Implement IpAddressInput component
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Text input for IP address
- [ ] Inline validation feedback (valid/error indicator)
- [ ] Validates IPv4 format
- [ ] Keyboard accessible with visible focus indicator

**Test Specs**: TS-016

---

### T020 - Implement IP address persistence
**Priority**: P1
**Dependencies**: T019
**Estimated Complexity**: Low
**Story**: [US6]

Save and restore IP address from localStorage.

**TDD Process**:
1. Write tests for TS-019
2. Implement persistence logic
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Saves IP to localStorage on successful connection
- [ ] Pre-fills input on subsequent visits
- [ ] Gracefully handles unavailable/full localStorage (FR-010)
- [ ] No error shown if storage fails

**Test Specs**: TS-019

---

### T021 - Implement useBulbConnection hook
**Priority**: P1
**Dependencies**: T018, T020
**Estimated Complexity**: High
**Story**: [US6]

Create hook managing bulb connection lifecycle.

**TDD Process**:
1. Write tests for TS-016, TS-017, TS-027
2. Implement useBulbConnection hook
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Manages BulbStatus state machine
- [ ] Auto-connects on startup if saved IP exists
- [ ] Connection established within 3 seconds (SC-007)
- [ ] Returns: status, connect(), disconnect(), deviceInfo

**Test Specs**: TS-016, TS-017, TS-027

---

### T022 - Implement BulbStatus indicator component
**Priority**: P1
**Dependencies**: T007
**Estimated Complexity**: Medium
**Story**: [US6]

Create visual status indicator for bulb connection.

**TDD Process**:
1. Write tests for TS-017, TS-051
2. Implement BulbStatusIndicator component
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Displays all 6 BulbStatus states visually
- [ ] 'connecting'/'discovering' shows pulsing animation (FR-013)
- [ ] Consistent styling with WebcamStatusIndicator
- [ ] ARIA live region for screen readers

**Test Specs**: TS-017, TS-051

---

## Phase 6: Color Transmission (US-007)

### T023 - Implement color transmission service
**Priority**: P1
**Dependencies**: T018
**Estimated Complexity**: Medium
**Story**: [US7]

Create service that sends colors to connected bulb.

**TDD Process**:
1. Write tests for TS-032, TS-048
2. Implement ColorTransmissionService
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Sends color via GET /light/0?red=X&green=Y&blue=Z
- [ ] Throttled to 10 updates/second (100ms interval)
- [ ] Skips timed-out updates (no queuing)
- [ ] Handles malformed responses gracefully

**Test Specs**: TS-032, TS-048

---

### T024 - Implement color smoothing/blending
**Priority**: P1
**Dependencies**: T023
**Estimated Complexity**: Medium
**Story**: [US7]

Add EMA smoothing for gradual color transitions on bulb.

**TDD Process**:
1. Write tests for TS-022, TS-044
2. Implement color blending logic
3. Verify tests pass

**Acceptance Criteria**:
- [ ] EMA smoothing with alpha=0.3
- [ ] Smooth transitions between colors
- [ ] No flickering on bulb
- [ ] Bulb visually matches on-screen swatch (SC-008)

**Test Specs**: TS-022, TS-044

---

### T025 - Integrate color extraction with bulb transmission
**Priority**: P1
**Dependencies**: T013, T024
**Estimated Complexity**: Medium
**Story**: [US7]

Connect the color extraction pipeline to bulb transmission.

**TDD Process**:
1. Write integration tests for TS-020, TS-021, TS-022
2. Wire up the complete pipeline
3. Verify end-to-end flow

**Acceptance Criteria**:
- [ ] Extracted color flows to bulb automatically
- [ ] Respects throttling and smoothing
- [ ] Only transmits when bulb is connected
- [ ] Pauses transmission when bulb disconnects

**Test Specs**: TS-020, TS-021, TS-022

---

## Phase 7: Bulb Resilience (US-008, US-009)

### T026 - Implement bulb unavailable state
**Priority**: P1
**Dependencies**: T022
**Estimated Complexity**: Medium
**Story**: [US8]

Handle missing bulb gracefully.

**TDD Process**:
1. Write tests for TS-023, TS-024, TS-025
2. Implement degraded state handling
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Application loads without crashing when no bulb
- [ ] Webcam capture and color display continue working
- [ ] Clear status message displayed (FR-016)
- [ ] Bulb configuration UI remains functional

**Test Specs**: TS-023, TS-024, TS-025

---

### T027 - Implement bulb device validation
**Priority**: P1
**Dependencies**: T018
**Estimated Complexity**: Medium
**Story**: [US8]

Validate that connected device is a compatible Shelly bulb.

**TDD Process**:
1. Write tests for TS-034, TS-035
2. Implement device validation
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Checks for "lights" capability in /status response
- [ ] Shows "Not a compatible device" error if missing (FR-011)
- [ ] Checks for auth:true in /shelly response
- [ ] Shows "Bulb requires authentication" error if auth enabled

**Test Specs**: TS-034, TS-035

---

### T028 - Implement bulb automatic reconnection
**Priority**: P2
**Dependencies**: T021
**Estimated Complexity**: High
**Story**: [US9]

Automatically reconnect to bulb after disconnection.

**TDD Process**:
1. Write tests for TS-026, TS-027, TS-028
2. Implement auto-reconnection with exponential backoff
3. Verify tests pass

**Acceptance Criteria**:
- [ ] Detects bulb disconnection
- [ ] Exponential backoff: 2s, 4s, 8s intervals (FR-015)
- [ ] Maximum 3 attempts before stopping
- [ ] Shows "Retry" button after max attempts
- [ ] Flapping protection: 2 consecutive successes required
- [ ] Connection resumes within 5 seconds (SC-010)

**Test Specs**: TS-026, TS-027, TS-028

---

## Phase 8: Main Application Assembly

### T029 - Implement main App layout
**Priority**: P1
**Dependencies**: T011, T014, T019, T022
**Estimated Complexity**: Medium

Assemble all components into main application layout.

**Acceptance Criteria**:
- [ ] Webcam feed and color swatch with equal emphasis
- [ ] Bulb configuration section
- [ ] Status indicators for both webcam and bulb
- [ ] Responsive layout
- [ ] Custom color palette applied (NFR-004)

**Test Specs**: TS-007, TS-012, TS-025

---

### T030 - Implement startup sequence
**Priority**: P1
**Dependencies**: T029
**Estimated Complexity**: Medium

Implement the defined startup sequence per FR-007.

**Acceptance Criteria**:
- [ ] UI renders immediately
- [ ] Checks for saved bulb IP and auto-connects if present
- [ ] Prompts for webcam permission
- [ ] Interactive within 3 seconds (NFR-005)

**Test Specs**: TS-046

---

### T031 - Implement WebcamStatus indicator component
**Priority**: P1
**Dependencies**: T006
**Estimated Complexity**: Medium

Create visual status indicator for webcam connection.

**Acceptance Criteria**:
- [ ] Displays all 5 WebcamStatus states visually
- [ ] 'requesting' shows pulsing animation
- [ ] Consistent styling with BulbStatusIndicator
- [ ] ARIA live region for screen readers

**Test Specs**: TS-010, TS-051

---

## Phase 9: Polish & Accessibility

### T032 - Implement error messages
**Priority**: P1
**Dependencies**: T029
**Estimated Complexity**: Low

Add user-friendly error messages per FR-016.

**Acceptance Criteria**:
- [ ] Webcam errors: "Camera not found", "Camera access denied", "Camera disconnected"
- [ ] Bulb errors: "Bulb not found", "Bulb not responding", "Not a compatible device"
- [ ] No technical jargon
- [ ] Actionable guidance for users

**Test Specs**: TS-010, TS-018, TS-023

---

### T033 - Implement accessibility features
**Priority**: P1
**Dependencies**: T029
**Estimated Complexity**: Medium

Add WCAG AA compliance features.

**Acceptance Criteria**:
- [ ] All text meets 4.5:1 contrast ratio (normal) or 3:1 (large)
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators
- [ ] ARIA live regions for status changes
- [ ] Hex code provides text-based color info

**Test Specs**: TS-049, TS-050, TS-051

---

### T034 - Implement background tab handling
**Priority**: P2
**Dependencies**: T029
**Estimated Complexity**: Low

Handle browser tab losing focus per NFR-003.

**Acceptance Criteria**:
- [ ] Application continues operation in background
- [ ] Resumes immediately when focus returns
- [ ] No state corruption from background period

**Test Specs**: N/A (manual verification)

---

### T035 - Final visual polish
**Priority**: P1
**Dependencies**: T029
**Estimated Complexity**: Medium

Apply final visual design polish per NFR-004.

**Acceptance Criteria**:
- [ ] Custom color palette (not default framework colors)
- [ ] Consistent spacing system throughout
- [ ] Purposeful visual hierarchy
- [ ] Deliberate shadows, borders, spacing
- [ ] Professional, non-generic appearance

**Test Specs**: TS-007, TS-008, TS-009

---

## Phase 10: Integration Testing

### T036 - End-to-end integration testing
**Priority**: P1
**Dependencies**: All previous tasks
**Estimated Complexity**: High

Comprehensive integration testing of complete application.

**Acceptance Criteria**:
- [ ] All user scenarios (US-001 through US-009) verified
- [ ] All success criteria (SC-001 through SC-010) met
- [ ] Graceful degradation verified for all failure modes
- [ ] Performance requirements verified (100ms latency, 3s startup)

**Test Specs**: All TS-* specifications

---

## Dependency Graph

```
Phase 1: Setup
T001 → T002, T003 → T004

Phase 2: Core Types (parallel)
T004 → T005 [P], T006 [P], T007 [P], T008 [P]

Phase 3: Webcam Core
T006 → T009 → T010 → T011
T005, T010 → T012 → T013
T005 → T014

Phase 4: Webcam Resilience
T011 → T015
T010 → T016 → T017

Phase 5: Bulb Configuration
T007, T008 → T018
T004 → T019 → T020
T018, T020 → T021 → T022

Phase 6: Color Transmission
T018 → T023 → T024
T013, T024 → T025

Phase 7: Bulb Resilience
T022 → T026
T018 → T027
T021 → T028

Phase 8: Assembly
T011, T014, T019, T022 → T029 → T030, T031

Phase 9: Polish
T029 → T032, T033, T034, T035

Phase 10: Integration
All → T036
```

---

## Task Summary

| Phase | Tasks | Priority Mix |
|-------|-------|--------------|
| 1. Setup | T001-T004 | All P1 |
| 2. Core Types | T005-T008 | All P1 |
| 3. Webcam Core | T009-T014 | All P1 |
| 4. Webcam Resilience | T015-T017 | P1 + P2 |
| 5. Bulb Configuration | T018-T022 | All P1 |
| 6. Color Transmission | T023-T025 | All P1 |
| 7. Bulb Resilience | T026-T028 | P1 + P2 |
| 8. Assembly | T029-T031 | All P1 |
| 9. Polish | T032-T035 | P1 + P2 |
| 10. Integration | T036 | P1 |

**Total Tasks**: 36
**P1 Tasks**: 31
**P2 Tasks**: 5
**Test Spec Coverage**: 51 test specifications referenced

---

## TDD Reminder

Per Constitution Principle 2 (Test-Driven Development):

> "Tests must be written before implementation code. Test specifications must be defined during planning. No feature code may be written without a failing test first."

For each task with Test Specs listed:
1. Write the test(s) first
2. Verify test fails
3. Implement minimum code to pass
4. Refactor if needed
5. Verify test still passes
