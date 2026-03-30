# Contributing to setup-kiro-action

Contributions are welcome. This document covers the essentials.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/setup-kiro-action.git
cd setup-kiro-action
# Edit action.yml or .github/workflows/test.yml
# Test locally with act (Linux jobs only) or push a branch and let CI run
```

## Before Submitting

- Validate the workflow with actionlint: `actionlint .github/workflows/test.yml`
- Ensure bash blocks pass shellcheck (run against extracted shell scripts)
- Confirm all CI checks pass before requesting review

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `chore`, `ci`, `test`, `refactor`

## Signing Requirements

All commits must be GPG-signed and include a DCO sign-off:

```bash
git commit -S --signoff -m "feat(action): add aws-region support"
```

The DCO sign-off certifies that you have the right to contribute the code under the project license. See [developercertificate.org](https://developercertificate.org/).

## Coding Standards

- Bash blocks in `action.yml` must be POSIX-compatible where possible
- Prefer explicit error handling over silent failures (`set -e` is implicit in Actions shell steps)
- No hardcoded versions outside `action.yml` inputs and the renovate-tracked `env` block in CI
- Keep composite action steps focused; each step should do one thing

## Testing

The test workflow exercises:

- Default install on Ubuntu x64
- Cache miss (first install) and cache hit (restore)
- Version pinning
- SHA256 checksum verification (when verify-checksum=true)
- SIGV4 authentication mode (when enable-sigv4=true)
- zizmor workflow security scanning

Add a test step or job when introducing new inputs, outputs, or install behaviors.

## PR Process

1. Fork the repository and create a feature branch from `main`
2. Make your changes following the standards above
3. Push and open a pull request; the PR template will guide you
4. CI must pass before review
5. One approval required to merge

## Versioning

We follow [SemVer](https://semver.org/): MAJOR (breaking), MINOR (new features), PATCH (fixes).

The `v1` floating tag is updated automatically on each release to track the latest v1.x.
