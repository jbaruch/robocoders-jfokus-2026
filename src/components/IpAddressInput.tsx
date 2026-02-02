/**
 * IpAddressInput Component - IP address input with validation
 * Implements: US-006
 * Test Specs: TS-016
 *
 * Constitution Compliance:
 * - P1: Standard form patterns
 * - P5: Accessible with visible focus indicators
 */

import { useId, useMemo } from 'react';

export interface IpAddressInputProps {
  /** Current IP value */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Called when connect button clicked */
  onConnect?: () => void;
  /** Input label (for accessibility) */
  label?: string;
  /** Whether connection is in progress */
  isLoading?: boolean;
  /** Disable input */
  disabled?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Validates host address format (IPv4, hostname, or host:port)
 */
function isValidHost(address: string): boolean {
  if (!address) return false;

  // Split host and optional port
  const [host, port] = address.split(':');

  if (!host) return false;

  // Validate port if present
  if (port !== undefined) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) return false;
  }

  // Check if it looks like an IPv4 (4 dot-separated parts)
  const ipParts = host.split('.');
  if (ipParts.length === 4) {
    // If all parts are numeric, it must be a valid IPv4
    const allNumeric = ipParts.every((part) => /^\d+$/.test(part));
    if (allNumeric) {
      return ipParts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
  }

  // Check if it's a valid hostname (localhost, my-device.local, etc.)
  // Must start with a letter (not a number, to distinguish from IPs)
  const hostnameRegex = /^[a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(host);
}

/**
 * IP address input field with inline validation.
 *
 * Per TS-016: Text input with inline validation feedback
 * Per NFR-004: Keyboard accessible with visible focus indicator
 */
export function IpAddressInput({
  value,
  onChange,
  onConnect,
  label = 'Bulb IP Address',
  isLoading = false,
  disabled = false,
  className = '',
}: IpAddressInputProps) {
  const inputId = useId();

  const isValid = useMemo(() => isValidHost(value), [value]);
  const showValidation = value.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && onConnect) {
      onConnect();
    }
  };

  const borderColor = showValidation
    ? isValid
      ? 'border-green-500'
      : 'border-red-500'
    : 'border-surface-border';

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
      }}
    >
      {/* Label */}
      <label
        htmlFor={inputId}
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgb(245, 245, 245)',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </label>

      {/* Input container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="192.168.1.100 or localhost:8080"
          disabled={disabled || isLoading}
          style={{
            display: 'block',
            width: '100%',
            minWidth: '280px',
            height: '48px',
            padding: '12px 40px 12px 16px',
            backgroundColor: 'rgb(34, 34, 51)',
            border: `2px solid ${showValidation ? (isValid ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)') : 'rgb(74, 74, 90)'}`,
            borderRadius: '8px',
            color: 'rgb(245, 245, 245)',
            fontFamily: 'monospace',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
          aria-invalid={showValidation && !isValid}
          aria-describedby={showValidation ? `${inputId}-status` : undefined}
        />

        {/* Validation indicator */}
        {showValidation && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            {isValid ? (
              <svg
                data-testid="ip-valid-indicator"
                style={{ width: '20px', height: '20px', color: 'rgb(34, 197, 94)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                data-testid="ip-error-indicator"
                style={{ width: '20px', height: '20px', color: 'rgb(239, 68, 68)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Connect button */}
      {onConnect && (
        <button
          type="submit"
          disabled={!isValid || isLoading || disabled}
          style={{
            display: 'block',
            width: '100%',
            minWidth: '280px',
            height: '48px',
            padding: '12px 24px',
            backgroundColor: isValid && !isLoading && !disabled ? 'rgb(99, 102, 241)' : 'rgb(55, 55, 75)',
            color: isValid && !isLoading && !disabled ? 'white' : 'rgb(156, 163, 175)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '16px',
            cursor: !isValid || isLoading || disabled ? 'not-allowed' : 'pointer',
            opacity: !isValid || isLoading || disabled ? 0.6 : 1,
            boxSizing: 'border-box',
          }}
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      )}

      {/* Status message */}
      {showValidation && !isValid && (
        <p
          id={`${inputId}-status`}
          style={{ fontSize: '14px', color: 'rgb(239, 68, 68)', margin: 0 }}
        >
          Enter a valid address (e.g., 192.168.1.100 or localhost:8080)
        </p>
      )}
    </form>
  );
}
