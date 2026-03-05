import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor labels
test("shows 'Creating {filename}' for str_replace_editor create", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/Button.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing {filename}' for str_replace_editor str_replace", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "src/components/Card.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("shows 'Editing {filename}' for str_replace_editor insert", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "src/components/Form.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Editing Form.tsx")).toBeDefined();
});

test("shows 'Reading {filename}' for str_replace_editor view", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "src/App.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Reading App.tsx")).toBeDefined();
});

test("shows 'Undoing edit to {filename}' for str_replace_editor undo_edit", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "src/App.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Undoing edit to App.tsx")).toBeDefined();
});

// file_manager labels
test("shows 'Renaming {from} to {to}' for file_manager rename", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Renaming Old.tsx to New.tsx")).toBeDefined();
});

test("shows 'Deleting {filename}' for file_manager delete", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "src/components/Unused.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

// Path extraction
test("extracts filename from deeply nested path", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/ui/forms/Input.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Creating Input.tsx")).toBeDefined();
});

test("works when path is just a filename with no slashes", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "Button.tsx" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

// Loading and done states
test("shows spinner when isDone is false", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "Button.tsx" }}
      isDone={false}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot and no spinner when isDone is true", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "Button.tsx" }}
      isDone={true}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// Fallbacks
test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      args={{}}
      isDone={false}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("uses fallback label when path is missing", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});

test("uses fallback label for file_manager rename when paths are missing", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename" }}
      isDone={false}
    />
  );
  expect(screen.getByText("Renaming file")).toBeDefined();
});
