"use client";

import { type HTMLAttributes, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner in pixels
   * @default 40
   */
  size?: number;
  /**
   * The thickness of the spinner ring
   * @default 3
   */
  thickness?: number;
  /**
   * The text to be announced to screen readers
   * @default "Loading"
   */
  label?: string;
  /**
   * Whether to show the loading text visually
   * @default false
   */
  showLabel?: boolean;
}

export function LoadingSpinner({
  size = 40,
  thickness = 3,
  label = "Loading",
  showLabel = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const id = useId();
  const spinnerSize = size;
  const spinnerRadius = spinnerSize / 2;
  const spinnerCircumference = 2 * Math.PI * (spinnerRadius - thickness / 2);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-labelledby={showLabel ? `${id}-label` : undefined}
      aria-label={!showLabel ? label : undefined}
      {...props}
    >
      <motion.svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox={`0 0 ${spinnerSize} ${spinnerSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <circle
          cx={spinnerRadius}
          cy={spinnerRadius}
          r={spinnerRadius - thickness / 2}
          stroke="#10b981"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${spinnerCircumference * 0.75} ${spinnerCircumference * 0.25}`}
          strokeDashoffset={0}
        />
      </motion.svg>

      {showLabel && (
        <span id={`${id}-label`} className="text-sm font-medium">
          {label}
        </span>
      )}

      {!showLabel && <span className="sr-only">{label}</span>}
    </div>
  );
}

export default LoadingSpinner;
