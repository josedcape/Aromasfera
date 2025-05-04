import React from "react";
import { cn } from "@/lib/utils";

interface RemixIconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export function RemixIcon({ name, className, size = "md", ...props }: RemixIconProps) {
  const iconClass = `ri-${name}`;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <i 
      className={cn(iconClass, sizeClass, className)} 
      {...props}
    />
  );
}
