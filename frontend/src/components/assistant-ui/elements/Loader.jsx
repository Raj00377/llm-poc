import { cn } from "cn"
import { LoaderIcon } from "lucide-react"
export function LoadingSpinner({ className, ...props }) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}
