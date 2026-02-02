/**
 * IpAddressInput Component Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-016
 *
 * Tests for the IP address input field with validation.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IpAddressInput } from '@/components/IpAddressInput';

describe('IpAddressInput Component', () => {
  // TS-016: IP address input with validation
  describe('Input field (TS-016)', () => {
    it('should render input field', () => {
      render(<IpAddressInput value="" onChange={() => {}} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(<IpAddressInput value="" onChange={() => {}} />);

      expect(screen.getByPlaceholderText(/192\.168/)).toBeInTheDocument();
    });

    it('should call onChange when value changes', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<IpAddressInput value="" onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '192');

      expect(onChange).toHaveBeenCalled();
    });

    it('should display provided value', () => {
      render(<IpAddressInput value="192.168.1.100" onChange={() => {}} />);

      expect(screen.getByRole('textbox')).toHaveValue('192.168.1.100');
    });
  });

  // Validation
  describe('Validation', () => {
    it('should show valid indicator for valid IP', () => {
      render(<IpAddressInput value="192.168.1.100" onChange={() => {}} />);

      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();
    });

    it('should show error indicator for invalid IP', () => {
      render(<IpAddressInput value="-invalid-" onChange={() => {}} />);

      expect(screen.getByTestId('ip-error-indicator')).toBeInTheDocument();
    });

    it('should validate IPv4 format correctly', () => {
      const { rerender } = render(
        <IpAddressInput value="192.168.1.100" onChange={() => {}} />
      );
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="10.0.0.1" onChange={() => {}} />);
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="255.255.255.255" onChange={() => {}} />);
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();
    });

    it('should validate hostname format correctly', () => {
      const { rerender } = render(
        <IpAddressInput value="localhost" onChange={() => {}} />
      );
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="localhost:8080" onChange={() => {}} />);
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="192.168.1.100:80" onChange={() => {}} />);
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="my-shelly.local" onChange={() => {}} />);
      expect(screen.getByTestId('ip-valid-indicator')).toBeInTheDocument();
    });

    it('should reject invalid addresses', () => {
      const { rerender } = render(
        <IpAddressInput value="256.1.1.1" onChange={() => {}} />
      );
      expect(screen.getByTestId('ip-error-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="192.168.1" onChange={() => {}} />);
      expect(screen.getByTestId('ip-error-indicator')).toBeInTheDocument();

      rerender(<IpAddressInput value="localhost:99999" onChange={() => {}} />);
      expect(screen.getByTestId('ip-error-indicator')).toBeInTheDocument();
    });

    it('should not show indicator for empty value', () => {
      render(<IpAddressInput value="" onChange={() => {}} />);

      expect(screen.queryByTestId('ip-valid-indicator')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ip-error-indicator')).not.toBeInTheDocument();
    });
  });

  // Connect button
  describe('Connect button', () => {
    it('should call onConnect when connect button clicked', async () => {
      const onConnect = vi.fn();
      const user = userEvent.setup();

      render(
        <IpAddressInput
          value="192.168.1.100"
          onChange={() => {}}
          onConnect={onConnect}
        />
      );

      const button = screen.getByRole('button', { name: /connect/i });
      await user.click(button);

      expect(onConnect).toHaveBeenCalled();
    });

    it('should disable connect button for invalid IP', () => {
      render(
        <IpAddressInput
          value="-invalid-"
          onChange={() => {}}
          onConnect={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /connect/i });
      expect(button).toBeDisabled();
    });

    it('should disable connect button when loading', () => {
      render(
        <IpAddressInput
          value="192.168.1.100"
          onChange={() => {}}
          onConnect={() => {}}
          isLoading
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  // Accessibility
  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<IpAddressInput value="" onChange={() => {}} label="Bulb IP" />);

      expect(screen.getByLabelText('Bulb IP')).toBeInTheDocument();
    });

    it('should have visible focus indicator', async () => {
      const user = userEvent.setup();

      render(<IpAddressInput value="" onChange={() => {}} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      // Check that focus ring class is applied
      expect(input.className).toContain('focus');
    });
  });
});
