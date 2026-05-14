# PR Review Instructions

## Scope

Review only what the PR changes. Do not flag issues in files the PR does not touch.

## Workflow files

When reviewing `.github/workflows/` changes:

- Evaluate the full job context, not individual steps in isolation. A step that installs a binary
  and a step that executes it are part of the same job; verify both exist before flagging a
  missing publish or execution command.
- Flag `${{ expression }}` interpolation directly inside `run:` scripts as an injection risk;
  inputs should be passed via `env:` blocks.
- Verify action pins use commit SHAs, not mutable tags.
- Check that `permissions:` blocks are present and minimal.

## action.yml / composite actions

- Verify new inputs have a `description` field.
- Do not flag missing `default:` on required inputs; required inputs have no default by design.

## General

- One comment per distinct issue; do not duplicate findings across multiple inline comments.
- Prefer suggesting a fix (suggestion block) over describing the problem when the fix is
  unambiguous.
- Do not comment on code style that linters or formatters catch automatically; those are enforced
  by CI.
