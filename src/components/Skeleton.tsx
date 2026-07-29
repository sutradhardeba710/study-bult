import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const baseStyle =
    'bg-gray-200 dark:bg-gray-700 animate-pulse overflow-hidden relative';
  const shapeStyle =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded'
      : 'rounded-md';
  return (
    <div
      className={clsx(baseStyle, shapeStyle, className)}
      style={{ width, height }}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
};

export default Skeleton; 