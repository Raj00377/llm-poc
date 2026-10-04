import { forwardRef } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

export const TooltipIconButton = forwardRef(function TooltipIconButton(
  { tooltip, children, className, side = "bottom", ...props },
  ref
) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn("size-7 rounded-full text-muted-foreground hover:text-foreground", className)}
            {...props}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})