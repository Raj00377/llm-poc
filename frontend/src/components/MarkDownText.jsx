// import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown"
// import remarkGfm from "remark-gfm"

// export function MarkdownText() {
//   return (
//     <MarkdownTextPrimitive
//       remarkPlugins={[remarkGfm]}
//       className="aui-md"
//     />
//   )
// }

import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "../lib/utils"

export function MarkdownText({ className }) {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className={cn(
        "aui-markdown prose prose-sm dark:prose-invert max-w-none",
        "prose-p:leading-relaxed prose-p:my-1",
        "prose-pre:bg-zinc-950 prose-pre:rounded-lg prose-pre:p-4",
        "prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
        "prose-pre:code:bg-transparent prose-pre:code:p-0",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-a:text-primary prose-a:underline",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        "prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
        className
      )}
    />
  )
}