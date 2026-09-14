---
name: Bug
about: Report a defect or unexpected behaviour
labels: bug
title: "[BUG] "
assignees: ""
---

## Summary
<!-- 1-2 sentences. What broke and when did it start? -->

<!-- Example: "FileDetails mode crashes when analyzing a file with syntax errors. Expected graceful handling, got panic." -->

## Steps to Reproduce

1.
2.
3.

## Expected Behaviour
<!-- What should happen? -->

## Actual Behaviour
<!-- What actually happened? Include redacted error messages, stack traces, or unexpected output. Never post secrets, credentials, tokens, client data, or PII. -->

```text
<!-- paste error output here -->
```

## Logs / Error Output
<!-- Paste relevant logs or stack traces here. -->

```text
<!-- log output -->
```

## Environment

- OS: <!-- e.g., macOS 13, Ubuntu 20.04 -->
- Tool / runtime version: `<!--tool> --version`
- Runtime version: <!-- e.g. 1.2.3 -->
- Relevant config or flags: <!-- list any flags used -->

## Root Cause Analysis
<!-- Optional. If you have a hypothesis about what is causing this, describe it here. Include file paths and line numbers if known. -->

## Fix Direction
<!-- Optional. Suggest an approach or reference similar fixes. -->

## Acceptance Criteria

- [ ] Bug is no longer reproducible following the steps above
- [ ] Regression test added covering this scenario
- [ ] All CI checks pass (tests, lint, format)
- [ ] No unrelated changes introduced
