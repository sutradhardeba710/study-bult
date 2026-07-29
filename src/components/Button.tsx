import React from 'react';
import clsx from 'clsx';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
};

const base =
  'inline-flex items-center justify-center border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50';

const variants = {
  primary:
    'bg-primary-600 text-white border-transparent hover:bg-primary-700 focus:ring-primary-500',
  secondary:
    'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 focus:ring-primary-500',
  danger:
    'bg-red-600 text-white border-transparent hover:bg-red-700 focus:ring-red-500',
  outline:
    'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  children,
  ...props
}) => (
  <button
    className={clsx(
      base,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    )}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? (
      <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
    ) : null}
    {children}
  </button>
);

export default Button; 