import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
};
