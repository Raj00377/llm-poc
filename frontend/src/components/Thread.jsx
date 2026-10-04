import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  AuiIf,
} from "@assistant-ui/react"
import {
  ArrowDownIcon, ArrowUpIcon, CheckIcon,
  ChevronLeftIcon, ChevronRightIcon,
  CopyIcon, PencilIcon, RefreshCwIcon,
  SquareIcon, ThumbsDownIcon, ThumbsUpIcon,
} from "lucide-react"
import { MarkdownText }       from "./MarkDownText"
import { TooltipIconButton }  from "./TooltipIconButton"
import { Button }             from "./ui/button"
import { cn }                 from "../lib/utils"

/* ── Thread root ─────────────────────────────────────────────────── */
export function Thread({ autoFocus = true }) {
  return (
    <ThreadPrimitive.Root
      className="aui-root bg-background flex h-full flex-col @container"
      style={{
        "--thread-max-width": "44rem",
        "--composer-bg":      "color-mix(in oklab, var(--color-muted) 30%, transparent)",
        "--composer-radius":  "1rem",
        "--composer-padding": "8px",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth"
      >
        <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4">

          {/* Welcome / empty state */}
          <ThreadPrimitive.Empty>
            <div className="mb-6 flex flex-col px-2">
              <p className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-medium tracking-tight duration-200 text-foreground">
                How can I help you today?
              </p>
            </div>
          </ThreadPrimitive.Empty>

          {/* Messages */}
          <div className="mb-14 flex flex-col gap-y-6 empty:hidden">
            <ThreadPrimitive.Messages
              components={{
                UserMessage:      UserMessage,
                AssistantMessage: AssistantMessage,
              }}
            />
          </div>

          {/* Sticky footer */}
          <ThreadPrimitive.ViewportFooter className="bg-background sticky bottom-0 mt-auto flex flex-col gap-4 overflow-visible rounded-t-(--composer-radius) pb-4 md:pb-6">
            <ThreadScrollToBottom />
            <Composer autoFocus={autoFocus} />
          </ThreadPrimitive.ViewportFooter>

        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  )
}

/* ── Scroll to bottom ────────────────────────────────────────────── */
function ThreadScrollToBottom() {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="dark:border-border dark:bg-background dark:hover:bg-accent absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  )
}

/* ── User message ────────────────────────────────────────────────── */
function UserMessage() {
  return (
    <MessagePrimitive.Root
      data-role="user"
      className="fade-in slide-in-from-bottom-1 animate-in grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [&:where(>*)]:col-start-2"
    >
      <div className="relative col-start-2 min-w-0">
        <div className="bg-muted text-foreground rounded-(--composer-radius) peer px-4 py-2 wrap-break-word empty:hidden">
          <MessagePrimitive.Content />
        </div>
        {/* Edit button on hover */}
        <div className="absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden">
          <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="flex flex-col items-end">
            <ActionBarPrimitive.Edit asChild>
              <TooltipIconButton tooltip="Edit"><PencilIcon /></TooltipIconButton>
            </ActionBarPrimitive.Edit>
          </ActionBarPrimitive.Root>
        </div>
      </div>
      <BranchPicker className="col-span-full col-start-1 -me-1 justify-end" />
    </MessagePrimitive.Root>
  )
}

/* ── Assistant message ───────────────────────────────────────────── */
function AssistantMessage() {
  return (
    <MessagePrimitive.Root
      data-role="assistant"
      className="fade-in slide-in-from-bottom-1 animate-in relative -mb-7.5 pb-7.5 duration-150"
    >
      {/* Content */}
      <div className="text-foreground px-2 leading-relaxed wrap-break-word">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
        {/* Error */}
        <MessagePrimitive.Error>
          <div className="border-destructive bg-destructive/10 text-destructive mt-2 rounded-md border p-3 text-sm" />
        </MessagePrimitive.Error>
      </div>

      {/* Footer: branch picker + action bar */}
      <div className="ms-2 flex items-center min-h-7.5 pt-1.5">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  )
}

/* ── Assistant action bar ────────────────────────────────────────── */
function AssistantActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="text-muted-foreground animate-in fade-in -ms-1 flex gap-1 duration-200"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon className="animate-in zoom-in-50 fade-in duration-200 ease-out" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon className="animate-in zoom-in-75 fade-in duration-150" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.FeedbackPositive asChild>
        <TooltipIconButton tooltip="Helpful" className="data-[submitted=true]:bg-accent data-[submitted=true]:text-accent-foreground">
          <ThumbsUpIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.FeedbackPositive>

      <ActionBarPrimitive.FeedbackNegative asChild>
        <TooltipIconButton tooltip="Not helpful" className="data-[submitted=true]:bg-accent data-[submitted=true]:text-accent-foreground">
          <ThumbsDownIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.FeedbackNegative>

      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh"><RefreshCwIcon /></TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

/* ── Branch picker ───────────────────────────────────────────────── */
function BranchPicker({ className }) {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn("text-muted-foreground -ms-2 me-2 inline-flex items-center text-xs", className)}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous"><ChevronLeftIcon /></TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next"><ChevronRightIcon /></TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}

/* ── Edit composer (inline message editing) ──────────────────────── */
function EditComposer() {
  return (
    <MessagePrimitive.Root className="flex flex-col px-2">
      <ComposerPrimitive.Root className="border-foreground/10 focus-within:border-foreground/25 ms-auto flex w-full max-w-[85%] cursor-text flex-col rounded-(--composer-radius) border bg-(--composer-bg) transition-[border-color]">
        <ComposerPrimitive.Input
          className="text-foreground min-h-14 w-full resize-none bg-transparent px-4 pt-3 pb-1 text-base outline-none"
          autoFocus
        />
        <div className="mx-2.5 mb-2.5 flex items-center gap-1.5 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">Cancel</Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" className="h-8 px-3">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  )
}

/* ── Composer ────────────────────────────────────────────────────── */
function Composer({ autoFocus }) {
  return (
    <ComposerPrimitive.Root className="relative flex w-full flex-col">
      <div className="border-foreground/10 focus-within:border-foreground/25 flex w-full cursor-text flex-col gap-2 rounded-(--composer-radius) border bg-(--composer-bg) p-(--composer-padding) transition-[border-color]">
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="placeholder:text-muted-foreground/60 max-h-48 min-h-10 w-full resize-none bg-transparent px-2.5 py-1 text-base leading-6 outline-none caret-primary"
          rows={1}
          autoFocus={autoFocus}
          enterKeyHint="send"
        />
        <div className="flex items-center justify-end">
          {/* Send */}
          <AuiIf condition={(s) => !s.composer.canCancel}>
            <ComposerPrimitive.Send asChild>
              <TooltipIconButton
                tooltip="Send message"
                variant="default"
                size="icon"
                className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ArrowUpIcon className="size-4" />
              </TooltipIconButton>
            </ComposerPrimitive.Send>
          </AuiIf>
          {/* Cancel */}
          <AuiIf condition={(s) => s.composer.canCancel}>
            <ComposerPrimitive.Cancel asChild>
              <Button type="button" variant="default" size="icon" className="size-7 rounded-full">
                <SquareIcon className="size-3.5 fill-current" />
              </Button>
            </ComposerPrimitive.Cancel>
          </AuiIf>
        </div>
      </div>
    </ComposerPrimitive.Root>
  )
}