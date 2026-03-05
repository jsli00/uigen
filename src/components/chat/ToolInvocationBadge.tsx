"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  isDone: boolean;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = args.path as string | undefined;
  const filename = path ? (path.split("/").pop() ?? path) : undefined;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
      case "undo_edit":
        return filename ? `Undoing edit to ${filename}` : "Undoing edit";
      default:
        return filename ? `Editing ${filename}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": {
        const newPath = args.new_path as string | undefined;
        const newFilename = newPath ? (newPath.split("/").pop() ?? newPath) : undefined;
        if (filename && newFilename) return `Renaming ${filename} to ${newFilename}`;
        return "Renaming file";
      }
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolName, args, isDone }: ToolInvocationBadgeProps) {
  const label = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
