# Feature Specification: Webcam Color Capture & IoT Bulb Control

**Feature ID**: 001
**Feature Name**: Webcam Color Capture & IoT Bulb Control
**Version**: 1.0.0
**Created**: 2026-02-02
**Status**: Draft

---

## Overview

### Problem Statement

Conference presenters demonstrating IoT color control need a way to capture colors from their environment and send them to an IoT bulb in real-time. Currently, there is no visual interface that extracts the dominant color from a live webcam feed, displays it prominently for audience visibility, and synchronizes it with a Shelly IoT bulb.

### Solution Summary

A web-based interface that accesses the user's webcam, continuously analyzes the video feed to determine the dominant color, displays that color prominently on screen, and sends it to a Shelly IoT bulb. The bulb color updates in real-time as the camera view changes, creating a live demonstration of color synchronization.

### Target Users

- **Primary**: Conference presenters demonstrating IoT color control
- **Secondary**: Anyone wanting to capture and visualize colors from their environment

### Business Value

- Enables live demonstrations of IoT color synchronization
- Provides visual feedback that audiences can see from the back of a conference room
- Creates an engaging, interactive demo experience

---

## User Scenarios & Testing

### US-001: View Live Webcam Feed (P1)

**As a** presenter
**I want to** see my webcam feed displayed on screen
**So that** I can position objects in frame for color capture

**Acceptance Criteria**:
- [ ] Webcam feed is visible on the interface
- [ ] Feed updates smoothly without noticeable lag
- [ ] Feed dimensions are appropriate for the display

**Test Scenarios**:
1. When I open the application, I am prompted to grant webcam access
2. After granting access, the live feed appears within 2 seconds
3. The feed reflects real-time camera input (verified by moving hand in front of camera)

---

### US-002: See Dominant Color Extracted (P1)

**As a** presenter
**I want to** see the dominant color extracted from the webcam feed
**So that** I know what color will be sent to the IoT device

**Acceptance Criteria**:
- [ ] Dominant color is calculated from the current frame
- [ ] Color updates continuously as the scene changes
- [ ] Color is displayed in a format that is clearly visible

**Test Scenarios**:
1. When I point the camera at a red object, the dominant color display shows red
2. When I point the camera at a blue object, the dominant color changes to blue
3. The color display updates within 500ms of scene change

---

### US-003: View Color Display Prominently (P1)

**As a** conference attendee
**I want to** see the captured color displayed large enough to view from the back of the room
**So that** I can follow the demonstration

**Acceptance Criteria**:
- [ ] Color display is large and prominent
- [ ] Color is clearly distinguishable from the interface background
- [ ] Display is readable from 20+ meters away on a projected screen

**Test Scenarios**:
1. The color display occupies significant screen real estate
2. The color swatch has clear boundaries
3. The color values (if shown) use large, readable text

---

### US-004: Handle Missing Webcam Gracefully (P1)

**As a** presenter
**I want to** see a clear indication when no webcam is available
**So that** I can troubleshoot hardware issues without application crashes

**Acceptance Criteria**:
- [ ] Application loads without crashing when no webcam is connected
- [ ] Clear visual message indicates webcam is unavailable
- [ ] Application remains usable in degraded mode

**Test Scenarios**:
1. When no webcam is connected, a warning message is displayed
2. The application does not throw unhandled errors
3. The interface remains responsive and styled correctly

---

### US-005: Recover from Webcam Disconnection (P2)

**As a** presenter
**I want to** have the webcam feed restore automatically when reconnected
**So that** temporary disconnections don't require restarting the application

**Acceptance Criteria**:
- [ ] Disconnection triggers a visual warning, not a crash
- [ ] Reconnection is detected automatically
- [ ] Feed resumes without user intervention

**Test Scenarios**:
1. When webcam is disconnected during use, warning appears within 2 seconds
2. When webcam is reconnected, feed resumes within 3 seconds
3. No page reload is required for recovery

---

### US-006: Configure and Connect to Bulb (P1)

**As a** presenter
**I want to** enter my Shelly bulb's IP address and connect to it
**So that** I can control the bulb from the application

**Acceptance Criteria**:
- [ ] Application provides an input field for bulb IP address
- [ ] Connection to bulb is established after IP entry
- [ ] Connection status is clearly displayed
- [ ] Previously entered IP is pre-filled on subsequent visits

**Test Scenarios**:
1. When I enter a valid bulb IP address, connection is attempted
2. When connection succeeds, status shows "connected"
3. When connection fails, a clear error message is displayed
4. When I return to the application, the last IP address is pre-filled

---

### US-007: Send Color to Bulb (P1)

**As a** presenter
**I want to** have the captured color automatically sent to the connected bulb
**So that** the bulb color matches what the camera sees

**Acceptance Criteria**:
- [ ] Captured dominant color is sent to the bulb continuously
- [ ] Bulb color changes reflect the on-screen color display
- [ ] Color updates are smooth without flickering

**Test Scenarios**:
1. When camera points at a red object, bulb turns red
2. When camera points at a blue object, bulb changes to blue
3. Color transitions on bulb appear smooth

---

### US-008: Handle Missing Bulb Gracefully (P1)

**As a** presenter
**I want to** see a clear indication when no bulb is available
**So that** I can troubleshoot without the application crashing

**Acceptance Criteria**:
- [ ] Application loads without crashing when no bulb is connected
- [ ] Clear visual message indicates bulb is unavailable
- [ ] Color capture and display continues to work without bulb

**Test Scenarios**:
1. When no bulb is on the network, a warning message is displayed
2. Webcam feed and color extraction continue working
3. The interface remains responsive and styled correctly

---

### US-009: Recover from Bulb Disconnection (P2)

**As a** presenter
**I want to** have the bulb connection restore automatically when it becomes available
**So that** temporary network issues don't require restarting the application

**Acceptance Criteria**:
- [ ] Disconnection triggers a visual warning, not a crash
- [ ] Reconnection is detected and established automatically
- [ ] Color sending resumes without user intervention

**Test Scenarios**:
1. When bulb disconnects during use, warning appears within 2 seconds
2. When bulb becomes available again, connection resumes within 5 seconds
3. No page reload is required for recovery

---

## Functional Requirements

### FR-001: Webcam Access

The system shall request permission to access the user's webcam and handle permission denial gracefully with a clear message.

### FR-002: Live Video Display

The system shall display the live webcam feed on the interface with smooth, continuous updates.

### FR-003: Dominant Color Extraction

The system shall analyze video frames and extract the dominant color from the current scene. The dominant color is defined as the single largest color cluster by pixel count. No explicit processing indicator is required; the smooth color transitions serve as implicit feedback that extraction is occurring.

### FR-004: Color Display

The system shall display the extracted dominant color as a large, prominent color swatch visible from distance. The color swatch and webcam feed shall share equal visual emphasis in the layout. Color swatch updates shall use a 150ms ease-out transition for smooth visual changes.

### FR-005: Color Value Display

The system shall display the color value as a hex code (#RRGGBB format) alongside the color swatch.

### FR-006: Connection Status Indicator

The system shall display the current webcam connection status (connected, disconnected, permission denied, not available).

### FR-007: Graceful Degradation

The system shall continue operating with a degraded UI when webcam is unavailable, displaying appropriate status messages without crashing. In degraded mode: the webcam area shall display a placeholder with status message, the color swatch shall show a neutral gray with "No color" text, and the bulb configuration/connection UI shall remain fully functional. The application startup sequence shall: (1) render UI immediately, (2) check for saved bulb IP and auto-connect if present, (3) prompt for webcam permission.

### FR-008: Automatic Reconnection

The system shall automatically detect and resume webcam feed when a disconnected camera becomes available again. If webcam permission is revoked mid-session, the system shall treat this as a disconnection, display a warning, and allow the user to re-request permission.

### FR-009: Error State Visualization

The system shall display error states in a visually distinct manner that is clearly different from normal operation.

### FR-010: Bulb Configuration

The system shall allow the user to enter the IP address of a Shelly bulb for connection. The entered IP address shall be saved in browser storage and pre-filled on subsequent visits. If browser storage is unavailable or full, the system shall gracefully degrade by not persisting the IP address, without showing an error. On application restart, if a saved IP address exists, the system shall automatically attempt to connect to the bulb while prompting for webcam permission. The IP input field shall display inline validation feedback (valid format indicator or error message).

### FR-011: Bulb Connection

The system shall establish and maintain a connection to a discovered Shelly bulb using the Gen1 discovery flow (/shelly → /status → /settings). If the device responds but has no "lights" capability in /status, display error "Not a compatible device - please enter a Shelly light bulb IP". If the device requires authentication (auth: true in /shelly response), display error "Bulb requires authentication - please disable auth in bulb settings". If webcam provides video but frames are unusable (all black/corrupt), continue displaying the feed and show color as black (#000000). If color extraction repeatedly produces invalid results, use the last valid color.

### FR-012: Color Transmission

The system shall continuously send the captured dominant color to the connected bulb at a rate of 10 updates per second (100ms interval). Updates shall be throttled to prevent overwhelming the device, and color transitions shall be smoothed/blended for gradual visual transitions. If the bulb returns unexpected or malformed responses, the system shall log a warning and continue operating with the last known state. Network requests to the bulb shall timeout after 3 seconds; timed-out updates shall be skipped (not queued) to maintain display responsiveness. No explicit "sending" indicator is required; the bulb color change serves as confirmation.

### FR-013: Bulb Status Indicator

The system shall display the current bulb connection status (not configured, connecting, connected, disconnected, connection failed). The "connecting" state shall display a pulsing/animated indicator to show discovery is in progress.

### FR-014: Bulb Graceful Degradation

The system shall continue operating (webcam capture and color display) when no bulb is available, displaying appropriate status messages without crashing.

### FR-015: Bulb Automatic Reconnection

The system shall automatically detect and reconnect to a bulb when it becomes available again after disconnection. Reconnection shall use exponential backoff: 2s, 4s, 8s intervals, maximum 3 attempts. After 3 failed attempts, auto-reconnect shall stop and display a "Retry" button for manual reconnection. Connection state oscillation (flapping) shall be handled by requiring 2 consecutive successful responses before transitioning to "connected" state.

### FR-016: Error Messages

All error messages shall be user-friendly (no technical jargon) and actionable (tell user what to do). Webcam errors: "Camera not found - please connect a webcam", "Camera access denied - please allow camera access in your browser", "Camera disconnected - reconnecting...". Bulb errors: "Bulb not found - check IP address and network connection", "Bulb not responding - reconnecting...", "Not a compatible device - please enter a Shelly light bulb IP".

---

## Non-Functional Requirements

### NFR-001: Visual Clarity

The interface must be readable from the back of a conference room (approximately 20 meters) when projected.

### NFR-002: Real-time Updates

Color extraction and display must update fast enough that changes appear continuous to human perception. Maximum acceptable latency from camera frame capture to color display update is 100ms.

### NFR-003: Reliability

The application must not crash or become unresponsive during normal operation, including hardware disconnection scenarios. When the browser tab loses focus or goes to background, the application shall continue operation and resume immediately when focus returns.

### NFR-005: Startup Time

The application must be interactive (UI rendered, ready for user input) within 3 seconds of page load.

### NFR-004: Intentional Design

The interface must appear professionally designed, not generic or template-based, per project constitution Principle 5. The design shall use a custom color palette (not default framework colors), consistent spacing system, and purposeful visual hierarchy. Shadows, borders, and spacing shall be deliberately chosen to create depth and organization.

### NFR-006: Accessibility

All text elements shall meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text). The hex code display provides text-based color information for users who cannot perceive color differences. All interactive elements (IP input, any buttons) shall be keyboard accessible with visible focus indicators. Status changes shall be announced to screen readers via ARIA live regions.

---

## Success Criteria

| ID | Criteria | Measurement |
|----|----------|-------------|
| SC-001 | Users can see live webcam feed | Feed visible within 2 seconds of permission grant |
| SC-002 | Dominant color is extracted accurately | Color display changes when camera points at different colored objects |
| SC-003 | Color display is visible from distance | Text/swatch readable at 20m on standard projector |
| SC-004 | Application handles missing webcam | No crashes when webcam unavailable |
| SC-005 | Webcam automatic recovery works | Feed resumes within 3 seconds of reconnection |
| SC-006 | Interface feels intentional | Visual design review confirms non-generic aesthetics |
| SC-007 | Bulb connects after IP entry | Connection established within 3 seconds of valid IP entry |
| SC-008 | Bulb color matches captured color | Bulb visually matches on-screen color swatch |
| SC-009 | Application handles missing bulb | No crashes when bulb unavailable; webcam features continue |
| SC-010 | Bulb automatic recovery works | Connection resumes within 5 seconds of bulb availability |

---

## Key Entities

### Color

Represents the dominant color extracted from the video feed.

**Attributes**:
- Hue component
- Saturation component
- Lightness/Brightness component
- Red component
- Green component
- Blue component

### WebcamStatus

Represents the current state of webcam connectivity.

**States**:
- Connected and streaming
- Disconnected
- Permission denied
- Not available
- Requesting permission

### VideoFrame

Represents a single frame from the webcam feed used for color analysis.

**Attributes**:
- Image data
- Timestamp
- Resolution

### BulbStatus

Represents the current state of bulb connectivity.

**States**:
- Not configured (no IP entered)
- Connecting (attempting connection)
- Discovering (Gen1 discovery flow in progress: /shelly → /status → /settings)
- Connected and receiving colors
- Disconnected (was connected, lost connection)
- Connection failed (IP entered but unreachable)

### Bulb

Represents a discovered Shelly IoT bulb.

**Attributes**:
- Device identifier
- Network address
- Current color
- Connection state

---

## Assumptions

1. The user has a webcam capable of providing video input
2. The user's browser supports webcam access
3. The demonstration environment has adequate lighting for color detection
4. The application will be displayed via projector for audience visibility

---

## Dependencies

- Web browser with webcam access capability (latest stable versions of Chrome, Firefox, or Safari)
- User permission to access webcam
- Adequate lighting for accurate color detection
- Shelly IoT bulb on the same local network
- Network connectivity between browser and bulb

---

## Out of Scope

- Persisting captured colors
- Multiple webcam support
- Multiple bulb support
- Color history or logging
- Audio capture or processing
- Automatic bulb discovery (mDNS, cloud API)
- Bulb firmware updates

---

## Constitution Compliance

This specification adheres to the project constitution:

- **Principle 1 (Demo-First Reliability)**: Focus on stable, tested scenarios; graceful degradation over features
- **Principle 3 (Visual Feedback)**: Prominent color display; connection status always visible
- **Principle 4 (Graceful Degradation)**: Application starts without webcam; automatic reconnection
- **Principle 5 (Intentional Design)**: Requirements for non-generic UI; distance readability

---

## Clarifications

### Session 2026-02-02

- Q: How should the system determine "dominant" when multiple colors are prominent in the frame? -> A: Single largest color cluster - pick the color that occupies the most pixels
- Q: Which color format should be displayed to the user alongside the swatch? -> A: Hex code (#RRGGBB format)
- Q: What should be the primary visual focus of the interface? -> A: Equal emphasis - webcam and color swatch share equal screen space
- Q: How should the application discover the Shelly bulb? -> A: Manual IP entry - user enters the bulb's IP address
- Q: Should the entered IP address be remembered between sessions? -> A: Yes, save in browser storage and pre-fill on next visit
- Q: How should rapid color changes be handled when sending to the bulb? -> A: Throttle with smoothing - limit update rate AND smooth/blend between colors for gradual transitions

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-02 | AI Assistant | Initial specification |
| 1.0.1 | 2026-02-02 | AI Assistant | Added clarification: dominant color algorithm |
| 1.0.2 | 2026-02-02 | AI Assistant | Added clarification: hex code display format |
| 1.0.3 | 2026-02-02 | AI Assistant | Added clarification: equal emphasis layout |
| 1.1.0 | 2026-02-02 | AI Assistant | Expanded scope to include IoT bulb discovery and control |
| 1.1.1 | 2026-02-02 | AI Assistant | Changed bulb discovery to manual IP entry |
| 1.1.2 | 2026-02-02 | AI Assistant | Added IP persistence in browser storage |
| 1.1.3 | 2026-02-02 | AI Assistant | Added throttling with color smoothing for bulb updates |
