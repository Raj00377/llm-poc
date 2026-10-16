import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  AuiIf,
} from "@assistant-ui/react";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { MarkdownText } from "./MarkDownText";
import { TooltipIconButton } from "./TooltipIconButton";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { ThinkingIndicator } from "./assistant-ui/elements/thinking-indicator";

/* ── Thread root ─────────────────────────────────────────────────── */
export function Thread({ autoFocus = true }) {
  return (
    <ThreadPrimitive.Root
      className="aui-root chat-bg flex h-full flex-col @container"
      style={{
        "--thread-max-width": "75%",
        "--composer-radius": "0.2rem",
        "--composer-padding": "8px",
      }}
    >
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth">
        <div className="mx-auto justify-center flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4">
          {/* Welcome / empty state */}
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <div className="mb-6 flex flex-col px-2">
              <p className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-medium tracking-tight duration-200 text-foreground">
                How can I help you today?
              </p>
            </div>
          </AuiIf>

          {/* Messages */}
          <div className="mb-14 flex flex-col gap-y-6 empty:hidden">
            <ThreadPrimitive.Messages
              components={{
                UserMessage: UserMessage,
                AssistantMessage: AssistantMessage,
              }}
            />

            <AuiIf condition={(s) => s.thread.isRunning}>
              <ThinkingIndicator
                label="Thinking"
                className="text-md"
              />
            </AuiIf>
          </div>

          {/* Sticky footer */}
          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 rounded-lg py-4 bg-linear-to-t from-white to-white/40 ">
            <ThreadScrollToBottom />
            {/* <MinimalComposer /> */}
            <Composer autoFocus={autoFocus} />
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

/* ── Scroll to bottom ────────────────────────────────────────────── */
function ThreadScrollToBottom() {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 left-[50%] z-10 self-center rounded-full p-4 disabled:invisible shadow-lg"
      >
        <ArrowDownIcon className="absolute" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
}

/* ── User message ────────────────────────────────────────────────── */
function UserMessage() {
  return (
    <MessagePrimitive.Root
      data-role="user"
      className="fade-in slide-in-from-bottom-1 animate-in grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [&:where(>*)]:col-start-2"
    >
      <div className="relative col-start-2 min-w-0">
        <div className="bg-primary-accent rounded-md text-foreground peer px-4 py-2 wrap-break-word empty:hidden">
          <MessagePrimitive.Content />
        </div>
        {/* Edit button on hover */}
        <div className="absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden">
          <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            className="flex flex-col items-end"
          >
            <ActionBarPrimitive.Edit asChild>
              <TooltipIconButton tooltip="Edit">
                <PencilIcon />
              </TooltipIconButton>
            </ActionBarPrimitive.Edit>
          </ActionBarPrimitive.Root>
        </div>
      </div>
      <BranchPicker className="col-span-full col-start-1 -me-1 justify-end" />
    </MessagePrimitive.Root>
  );
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
  );
}

/* ── Assistant action bar ────────────────────────────────────────── */
function AssistantActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="text-muted-foreground animate-in fade-in -ms-1 flex gap-2 duration-400"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy" className="size-5">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon className="animate-in zoom-in-50 fade-in duration-200 ease-out" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon className="animate-in zoom-in-75 fade-in duration-150" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.FeedbackPositive asChild>
        <TooltipIconButton
          tooltip="Helpful"
          className="data-[submitted=true]:bg-accent data-[submitted=true]:text-accent-foreground size-5"
        >
          <ThumbsUpIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.FeedbackPositive>

      <ActionBarPrimitive.FeedbackNegative asChild>
        <TooltipIconButton
          tooltip="Not helpful"
          className="data-[submitted=true]:bg-accent data-[submitted=true]:text-accent-foreground size-5"
        >
          <ThumbsDownIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.FeedbackNegative>

      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh" className="size-5">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
}

/* ── Branch picker ───────────────────────────────────────────────── */
function BranchPicker({ className }) {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground -ms-2 me-2 inline-flex items-center text-xs",
        className,
      )}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
}

/* ── Edit composer (inline message editing) ──────────────────────── */
function EditComposer() {
  return (
    <MessagePrimitive.Root className="flex flex-col px-2">
      <ComposerPrimitive.Root className="border-foreground/10 focus-within:border-foreground/25 ms-auto flex w-full max-w-[85%] cursor-text flex-col rounded-md border bg-(--composer-bg) transition-[border-color]">
        <ComposerPrimitive.Input
          className="text-foreground min-h-14 w-full resize-none bg-transparent px-4 pt-3 pb-1 text-base outline-none"
          autoFocus
        />
        <div className="mx-2.5 mb-2.5 flex items-center gap-1.5 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" className="h-8 px-3">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
}

function MinimalComposer() {
  return (
    <ComposerPrimitive.Root className="flex w-full rounded-3xl border bg-white">
      <ComposerPrimitive.Input
        placeholder="Ask anything..."
        className="min-h-10 w-full resize-none bg-transparent px-5 py-4 text-sm focus:outline-none"
        rows={1}
      />
      <div className="flex items-center justify-end px-3 pb-3">
        <ComposerPrimitive.Send className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30">
          <ArrowUpIcon className="size-4" />
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}

/* ── Composer ────────────────────────────────────────────────────── */
function Composer({ autoFocus }) {
  return (
    <ComposerPrimitive.Root
      compact
      className="w-full rounded-lg border border-gray-400 bg-white group/composer flex flex-col data-compact:flex-row data-compact:items-center"
    >
      <ComposerPrimitive.Input
        placeholder="Ask anything..."
        className="min-h-10 max-h-50 w-full resize-none bg-transparent px-5 py-4 text-sm focus:outline-none"
        rows={1}
        autoFocus={autoFocus}
        enterKeyHint="send"
      />
      <div className="flex items-center justify-end px-3 py-3">
        {/* Send */}
        <AuiIf condition={(s) => !s.composer.canCancel}>
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send message"
              variant="default"
              size="icon"
              className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30"
            >
              <ArrowUpIcon className="size-4" stroke="white" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </AuiIf>
        {/* Cancel */}
        <AuiIf condition={(s) => s.composer.canCancel}>
          <ComposerPrimitive.Cancel asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="size-8 rounded-full"
            >
              <SquareIcon className="size-4 fill-white stroke-white" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </ComposerPrimitive.Root>
  );
}
