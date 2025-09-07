import React from "react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  current: number; // 1-based index
  className?: string;
}

export default function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  return (
    <ol className={cn("flex items-center gap-2 w-full", className)} aria-label="Submission steps">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;
        return (
          <li key={label} className="flex-1 flex items-center">
            <div className="flex items-center w-full">
              <div
                className={cn(
                  "flex items-center gap-2",
                  "min-w-0",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border w-8 h-8 text-sm font-semibold",
                    isCompleted && "bg-gov-navy text-white border-gov-navy",
                    isActive && !isCompleted && "bg-gov-gold text-gov-navy border-gov-gold",
                    !isActive && !isCompleted && "bg-white text-gray-500 border-gray-300"
                  )}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${stepNum}: ${label}`}
                >
                  {stepNum}
                </div>
                <span
                  className={cn(
                    "ml-2 text-xs sm:text-sm truncate",
                    isCompleted && "text-gov-navy",
                    isActive && "text-gov-navy font-medium",
                    !isActive && !isCompleted && "text-gray-500"
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("flex-1 h-px mx-2", (isCompleted || isActive) ? "bg-gov-navy" : "bg-gray-300")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
