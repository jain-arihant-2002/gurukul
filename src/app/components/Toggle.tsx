import React, { ReactNode } from 'react';

// Define the props for the component
interface ToggleProps {
  /** Whether the toggle is currently pressed. */
  pressed: boolean;
  /** Callback fired when the toggle is pressed. */
  onPressedChange: (pressed: boolean) => void;
  /** The content of the toggle, typically an icon. */
  children: ReactNode;
  /** Optional class name to apply to the button. */
  className?: string;
  /** The size of the toggle. Defaults to 'default'. */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * A standalone, two-state button that can be either on or off.
 */
export const Toggle: React.FC<ToggleProps> = ({
  pressed,
  onPressedChange,
  children,
  className = '',
  size = 'default',
}) => {
  // Base classes for the toggle button
  const baseClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Classes for different sizes
  const sizeClasses = {
    default: 'h-10 px-3',
    sm: 'h-9 px-2.5 mr-1',
    lg: 'h-11 px-5',
  };

  // Classes for different states (pressed or not)
  const stateClasses = pressed
    ? 'bg-primary-600 ' // "on" state
    : 'bg-transparent hover:bg-primary-600'; // "off" state

  // Combine all classes
  const finalClassName = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${className}`.trim();

  return (
    <button
      type="button"
      className={finalClassName}
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
    >
      {children}
    </button>
  );
};