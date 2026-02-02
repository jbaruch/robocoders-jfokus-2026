/**
 * Main Application Component
 * Implements: FR-004, FR-007, NFR-004, NFR-005
 *
 * Constitution Compliance:
 * - P1: Demo-First Reliability - Error boundary, graceful degradation
 * - P3: Visual Feedback - Status indicators, color swatch
 * - P4: Graceful Degradation - Works without webcam/bulb
 * - P5: Intentional Design - Custom palette, readable from 20m
 */
import { useRef, useEffect, useCallback } from 'react';
import {
  useWebcam,
  useColorExtraction,
  useBulbConnection,
  useColorTransmission,
} from './hooks';
import {
  WebcamFeed,
  ColorSwatch,
  IpAddressInput,
  BulbStatusIndicator,
} from './components';
import { NO_COLOR } from './types';

function App() {
  // Webcam management
  const {
    status: webcamStatus,
    stream,
    error: webcamError,
  } = useWebcam({ autoStart: true });

  // Video element ref for color extraction
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Color extraction from webcam
  const { color } = useColorExtraction(videoRef.current, {
    enabled: webcamStatus === 'streaming',
  });

  // Bulb connection
  const {
    status: bulbStatus,
    deviceInfo,
    ip,
    error: bulbError,
    setIp,
    connect,
    disconnect,
    setColor,
  } = useBulbConnection({ autoConnect: true });

  // Throttled color transmission
  const { transmit } = useColorTransmission({
    setColor: useCallback(
      (r: number, g: number, b: number) => setColor(r, g, b),
      [setColor]
    ),
    enabled: bulbStatus === 'connected',
  });

  // Transmit color when it changes and bulb is connected
  useEffect(() => {
    if (bulbStatus === 'connected') {
      transmit(color);
    }
  }, [bulbStatus, color, transmit]);

  // Attach stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Display color (use NO_COLOR when not streaming)
  const displayColor = webcamStatus === 'streaming' ? color : NO_COLOR;

  return (
    <div className="min-h-screen bg-surface-base text-surface-text p-4 md:p-8">
      {/* Main content - equal emphasis layout (FR-004) */}
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-primary tracking-tight">
            Color Picker
          </h1>
          <p className="text-surface-muted mt-2 text-lg">
            Webcam to Shelly IoT Bulb Color Sync
          </p>
        </header>

        {/* Main grid - webcam and color swatch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Webcam Feed Section */}
          <section className="bg-surface-elevated rounded-xl p-4 md:p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-surface-text">
              Camera Feed
            </h2>
            <WebcamFeed
              status={webcamStatus}
              stream={stream}
              error={webcamError}
            />
            {/* Hidden video element for color extraction */}
            {stream && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="hidden"
              />
            )}
          </section>

          {/* Color Swatch Section */}
          <section className="bg-surface-elevated rounded-xl p-4 md:p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-surface-text">
              Dominant Color
            </h2>
            <ColorSwatch
              color={displayColor}
              showRgb
              showNoColor={webcamStatus !== 'streaming'}
            />
          </section>
        </div>

        {/* Bulb Configuration Section */}
        <section className="mt-8 bg-surface-elevated rounded-xl p-4 md:p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-surface-text">
            Shelly Bulb Connection
          </h2>

          <div className="flex flex-col gap-6">
            {/* IP Input */}
            <div className="w-full md:max-w-md">
              <IpAddressInput
                value={ip}
                onChange={setIp}
                onConnect={() => connect(ip)}
                isLoading={bulbStatus === 'discovering'}
                disabled={bulbStatus === 'connected'}
              />
            </div>

            {/* Status and actions */}
            <div className="flex flex-wrap items-center gap-4">
              <BulbStatusIndicator
                status={bulbStatus}
                deviceName={deviceInfo?.name}
                error={bulbError || undefined}
              />

              {bulbStatus === 'connected' && (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 text-sm text-status-error border border-status-error rounded-lg hover:bg-status-error/10 transition-colors"
                >
                  Disconnect
                </button>
              )}

              {bulbStatus === 'failed' && (
                <button
                  onClick={() => connect(ip)}
                  className="px-4 py-2 text-sm text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary/10 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Status Footer */}
        <footer className="mt-8 flex flex-wrap gap-4 justify-center items-center text-sm">
          {/* Webcam status pill */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-full">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                webcamStatus === 'streaming'
                  ? 'bg-status-success'
                  : webcamStatus === 'requesting'
                  ? 'bg-status-warning animate-pulse'
                  : 'bg-status-error'
              }`}
            />
            <span className="text-surface-muted">
              Camera:{' '}
              {webcamStatus === 'streaming'
                ? 'Connected'
                : webcamStatus === 'requesting'
                ? 'Requesting...'
                : webcamStatus === 'denied'
                ? 'Denied'
                : webcamStatus === 'not_available'
                ? 'Unavailable'
                : 'Disconnected'}
            </span>
          </div>

          {/* Bulb status pill */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-full">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bulbStatus === 'connected'
                  ? 'bg-status-success'
                  : bulbStatus === 'discovering'
                  ? 'bg-brand-primary animate-pulse'
                  : bulbStatus === 'failed'
                  ? 'bg-status-error'
                  : 'bg-surface-muted'
              }`}
            />
            <span className="text-surface-muted">
              Bulb:{' '}
              {bulbStatus === 'connected'
                ? deviceInfo?.name || 'Connected'
                : bulbStatus === 'discovering'
                ? 'Discovering...'
                : bulbStatus === 'failed'
                ? 'Failed'
                : bulbStatus === 'disconnected'
                ? 'Disconnected'
                : 'Not configured'}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
