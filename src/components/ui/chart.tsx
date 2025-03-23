"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "~/lib/utils";

interface ChartConfigItem {
  label?: React.ReactNode;
  icon?: React.ComponentType;
  color?: string;
}

type ChartConfig = Record<string, ChartConfigItem>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: Array<{
      name?: string;
      value?: string | number;
      dataKey?: string;
      color?: string;
      fill?: string;
    }>;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    label?: string;
    formatter?: (value: string | number, name: string) => React.ReactNode;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      formatter,
      color,
    },
    ref
  ) => {
    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && label && <div className="font-medium">{label}</div>}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const indicatorColor = color ?? item.fill ?? item.color ?? "#000";

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2",
                  indicator === "dot" && "items-center"
                )}
              >
                {!hideIndicator && (
                  <>
                    {indicator === "dot" ? (
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: indicatorColor }}
                      />
                    ) : indicator === "line" ? (
                      <div
                        className="h-0.5 w-2.5 translate-y-[0.625rem]"
                        style={{ backgroundColor: indicatorColor }}
                      />
                    ) : (
                      <div
                        className="h-0.5 w-2.5 translate-y-[0.625rem]"
                        style={{
                          backgroundColor: indicatorColor,
                          backgroundImage: `linear-gradient(to right, ${indicatorColor} 50%, transparent 50%)`,
                          backgroundSize: "6px 6px",
                        }}
                      />
                    )}
                  </>
                )}
                <div className="flex flex-1 justify-between gap-2">
                  <div className="font-medium">{item.name ?? "value"}</div>
                  <div>
                    {formatter && item.value !== undefined
                      ? formatter(
                          String(item.value),
                          String(item.name ?? "value")
                        )
                      : item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export const BarChart = RechartsPrimitive.BarChart;
export const Bar = RechartsPrimitive.Bar;
export const XAxis = RechartsPrimitive.XAxis;
export const YAxis = RechartsPrimitive.YAxis;
export const CartesianGrid = RechartsPrimitive.CartesianGrid;
export const Tooltip = RechartsPrimitive.Tooltip;
export const ResponsiveContainer = RechartsPrimitive.ResponsiveContainer;

export {
  ChartContainer as Chart,
  ChartTooltipContent,
  type ChartConfig,
  type ChartConfigItem,
};
