# Security Assurance Case

This document provides the security assurance case for setup-kiro-action.

## What the action does

setup-kiro-action is a GitHub Actions composite action that downloads a pre-built binary of the [Kiro CLI](https://github.com/aws/amazon-q-developer-cli) from the official AWS CDN (desktop-release.q.us-east-1.amazonaws.com), caches it using the GitHub Actions cache, and adds it to `$GITHUB_PATH`. The action does not execute Kiro CLI, does not handle API keys, and performs no AI operations itself.

## Trust boundaries

| Boundary | Direction | Description |
|----------|-----------|-------------|
| AWS CDN (HTTPS) | Inbound | Kiro CLI binary downloaded from `desktop-release.q.us-east-1.amazonaws.com` |
| GitHub Actions cache | Bidirectional | Cached binary stored and restored by `actions/cache` |
| `$GITHUB_PATH` | Outbound | Binary location appended to the runner PATH |
| Caller workflow | Inbound | `version` and `aws-region` inputs supplied by the calling workflow |

The action makes no outbound calls beyond the AWS CDN download URL and optional AWS service calls (when `enable-sigv4=true`). It holds no credentials and writes no persistent state outside the runner environment.

## Attack surface

The primary attack surfaces are:

1. **Supply chain -- upstream binary**: The Kiro CLI binary is downloaded from the AWS CDN at `desktop-release.q.us-east-1.amazonaws.com`. This is mitigated by using HTTPS exclusively and pinning to a caller-specified version. Optional SHA256 checksum verification is available via the `verify-checksum` input (default: false).

2. **Prompt injection in caller workflows**: Callers that pass user-controlled content (git diffs, commit messages) to Kiro CLI are vulnerable to prompt injection. This is a known risk documented in the README with three defensive tiers (see [Security Patterns](README.md#security-patterns)).

3. **GitHub Actions workflow security**: The action's own workflow is scanned with [zizmor](https://github.com/zizmorcore/zizmor) on every PR. All actions are pinned to SHA digests. No `pull_request_target` triggers are used.

## Common weaknesses countered

| Weakness | Status |
|----------|--------|
| MITM on download | Mitigated -- HTTPS enforced; no plain-HTTP fallback; optional SHA256 verify-checksum |
| Malicious cached binary | Mitigated -- cache key includes version, OS, and arch; a stale or corrupted cache entry results in a fresh download |
| Secret leakage in logs | Mitigated -- zizmor scans all workflows; no secrets are handled by the action itself |
| Dependency confusion | Not applicable -- no package manager dependencies; binary only |
| Version pinning bypass | Mitigated -- `version` input is validated against semver regex before use |

## Supply chain hardening

- All GitHub Actions used by this action and its CI workflow are pinned to SHA digests (enforced by zizmor)
- Renovate bot creates weekly PRs for digest updates
- The Kiro CLI binary is downloaded from the official AWS CDN only
- Optional SHA256 checksum verification is available via the `verify-checksum` input

## Known gaps

- **No sigstore/Cosign attestation**: The AWS CDN does not provide Sigstore/Cosign attestations. The `verify-checksum` input provides SHA256 verification as an opt-in alternative (default: false).
- **Checksum verification is opt-in**: The `verify-checksum` input defaults to false for backwards compatibility. Users who require verification must explicitly set `verify-checksum: true`.

## External action dependencies

- `actions/cache@v4`: SHA-pinned and managed by Renovate for digest updates
- `actions/checkout@v4`: SHA-pinned and managed by Renovate for digest updates
- `aws-actions/configure-aws-credentials@v5`: SHA-pinned; used when `enable-sigv4: true`

## Security review

- **Review date:** 2026-03-30
- **Scope:** Full action.yml, CI workflow, trust boundaries, attack surface (as documented in this file)
- **Conclusion:** No exploitable vulnerabilities identified; residual prompt-injection risk is documented in README with mitigations; AWS CDN lacks sigstore attestation (acknowledged gap)
- **Reviewer:** Project maintainer (self-review; acceptable for solo projects under OpenSSF criteria)
