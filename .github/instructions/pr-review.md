# PR Review Instructions

## Grounding rules

- Only flag issues you can cite directly from the diff. If you cannot point to a specific line,
  do not raise the comment.
- If you are unsure whether something is a bug or intentional, say so explicitly rather than
  asserting it is wrong.
- Do not apply general knowledge about Rust, rmcp, or GitHub Actions if the diff does not
  contain evidence of a violation. Patterns and invariants are documented in `AGENTS.md`; cite
  that file if you reference a rule.

## Scope

Review only what the PR changes. Do not flag issues in files the PR does not touch.

## Rust crates

- Do not flag `.unwrap()` in test code; it is acceptable there.
- Do not suggest adding dependencies without a justification visible in the diff.
- Do not comment on style that `cargo fmt` or `cargo clippy` would catch automatically; those
  are enforced by CI.

## Workflow files

- Flag `${{ expression }}` interpolation directly inside `run:` scripts; inputs should be
  passed via `env:` blocks.
- Verify action pins use commit SHAs, not mutable tags.
- Check that `permissions:` blocks are present and minimal.

## General

- One comment per distinct issue; do not duplicate findings across multiple inline comments.
- Prefer a suggestion block over describing the problem when the fix is unambiguous.
- If you have no findings, say so. Do not invent issues to appear thorough.
