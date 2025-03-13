import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Box.displayName = "Box";

export { Box }; 