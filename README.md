# Setup Kiro CLI Action

[![Test Action](https://github.com/clouatre-labs/setup-kiro-action/actions/workflows/test.yml/badge.svg)](https://github.com/clouatre-labs/setup-kiro-action/actions/workflows/test.yml)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Setup%20Kiro%20CLI-blue?logo=github)](https://github.com/marketplace/actions/setup-kiro-cli)
[![Composite Action](https://img.shields.io/badge/Composite-Action-green?logo=github)](https://docs.github.com/en/actions/creating-actions/about-custom-actions#composite-actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Latest Release](https://img.shields.io/github/v/release/clouatre-labs/setup-kiro-action)](https://github.com/clouatre-labs/setup-kiro-action/releases/latest)

GitHub Action to install and cache [Kiro CLI](https://kiro.dev/docs/cli/) for use in workflows.

**Unofficial community action.** Not affiliated with or endorsed by Amazon Web Services (AWS). "Kiro" and "Amazon Web Services" are trademarks of AWS.

## Quick Start - Tier 1 (Maximum Security)

> [!IMPORTANT]
> **Prompt Injection Risk:** When AI analyzes user-controlled input (git diffs, code comments, commit messages), malicious actors can embed instructions to manipulate output. This applies to ANY AI tool, not just Kiro CLI or this action.
> 
> For production use, see [Security Patterns](#security-patterns) below for three defensive tiers (tool output analysis, manual approval, trusted-only execution).

```yaml
name: Linter Analysis with Kiro CLI
on: [push]

permissions:
  id-token: write
  contents: read

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Run Linter
        run: pipx run ruff check --output-format=json . > lint.json || true

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Kiro CLI
        uses: clouatre-labs/setup-kiro-action@v1
        with:
          enable-sigv4: true
          aws-region: us-east-1

      - name: AI Analysis of Linter Output
        run: |
          echo "Summarize these linting issues and suggest fixes:" > prompt.txt
          cat lint.json >> prompt.txt
          kiro-cli-chat chat --no-interactive "$(cat prompt.txt)" > analysis.md

      - name: Upload Analysis Artifact
        uses: actions/upload-artifact@v5
        with:
          name: ai-analysis
          path: analysis.md
```

## Features

- **Automatic caching** - Caches Kiro CLI binaries for faster subsequent runs
- **SIGV4 authentication** - IAM-based headless authentication for CI/CD
- **GitHub-hosted runners** - Supports x64 Ubuntu runners (simple, fast, manageable)
- **Lightweight** - Composite action with no external dependencies

## Security

**Safe Pattern:** AI analyzes tool output (ruff, trivy, semgrep), not raw code.

**Unsafe Pattern:** AI analyzes git diffs directly → vulnerable to prompt injection.

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Security Patterns

This action supports three security tiers for AI-augmented CI/CD:

- **Tier 1 (Maximum Security)**: AI analyzes only tool output (JSON), never raw code. [See workflow](examples/tier1-maximum-security.yml)
- **Tier 2**: AI sees file stats, requires manual approval. [See workflow](examples/tier2-balanced-security.yml)
- **Tier 3**: Full diff analysis, trusted teams only. [See workflow](examples/tier3-advanced-patterns.yml)

Read the full explanation: [AI-Augmented CI/CD blog post](https://clouatre.ca/posts/ai-augmented-cicd)

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `version` | Kiro CLI version to install | No | See [`action.yml`](action.yml#L15) |
| `aws-region` | AWS region for Kiro CLI operations | No | `us-east-1` |
| `enable-sigv4` | Enable SIGV4 authentication mode | No | `false` |
| `verify-checksum` | Verify SHA256 checksum of downloaded binary | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `kiro-version` | Installed Kiro CLI version |
| `kiro-path` | Path to Kiro CLI binary directory |

## Supported Platforms

**GitHub-hosted runners only** - Designed for simple, fast, manageable CI/CD.

| OS | Architecture | Runner Label |
|----|--------------|--------------|
| Ubuntu | x64 | `ubuntu-latest`, `ubuntu-24.04`, `ubuntu-22.04` |

**Not supported:** macOS, Windows. For macOS, use the official install script: `curl -fsSL https://cli.kiro.dev/install | bash`

Self-hosted ARM64 runners may work but are untested.

## Authentication Methods

### Method 1: OIDC (Recommended for GitHub Actions)

Uses GitHub's OIDC provider for secure, credential-free authentication.

1. Create OIDC provider:
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

2. Create IAM role with trust policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:<ORG>/*:*"
      }
    }
  }]
}
```

3. Attach Kiro/Q Developer policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "q:StartConversation",
      "q:SendMessage",
      "q:GetConversation"
    ],
    "Resource": "*"
  }]
}
```

4. In your workflow:
```yaml
permissions:
  id-token: write  # Required for OIDC

- uses: aws-actions/configure-aws-credentials@v5
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1

- uses: clouatre-labs/setup-kiro-action@v1
  with:
    enable-sigv4: true  # Required with OIDC
```

### Method 2: IAM User Credentials (Local Development)

```yaml
- uses: clouatre-labs/setup-kiro-action@v1
  # Do NOT set enable-sigv4 with long-lived credentials

- name: Use Kiro CLI
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: us-east-1
  run: kiro-cli-chat chat --no-interactive "What is 2+2?"
```

**Important:** Do not use `enable-sigv4: true` with long-lived IAM credentials (AKIA* keys).

## Examples

### Pin to Specific Version

```yaml
- uses: clouatre-labs/setup-kiro-action@v1
  with:
    version: '1.20.2'  # Use any specific version
    verify-checksum: true  # Recommended for production
```

## Version Management

This action defaults to a tested version that's automatically updated weekly.

**Pin to a specific version:**
```yaml
- uses: clouatre-labs/setup-kiro-action@v1
  with:
    version: '1.20.2'
```

## How It Works

1. Checks cache for Kiro CLI binary matching version and platform
2. If cache miss, downloads from AWS CDN
3. Extracts `kiro-cli-chat` binary to `~/.local/bin/`
4. Adds binary location to `$GITHUB_PATH`
5. Optionally configures SIGV4 authentication
6. Verifies installation with `kiro-cli-chat --version`

## Cache Key Format

```
kiro-{version}-{os}-{arch}
```

Example: `kiro-1.20.2-Linux-X64`

## Troubleshooting

### Binary not found after installation

Ensure you're using the action before attempting to run `kiro-cli-chat`:

```yaml
- uses: clouatre-labs/setup-kiro-action@v1
- run: kiro-cli-chat --version  # This will work
```

### SIGV4 authentication not working

Verify:
1. `enable-sigv4: true` is set in action inputs
2. AWS credentials are available as environment variables
3. IAM permissions include Amazon Q/Kiro access
4. Correct AWS region is configured

### Unsupported platform error

Kiro CLI binaries are only available for Linux via this action. Use `ubuntu-latest`, `ubuntu-24.04`, or `ubuntu-22.04` runners:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest  # Recommended
```

For macOS, use the official install script directly in your workflow:
```yaml
- run: curl -fsSL https://cli.kiro.dev/install | bash
```

### Cache not working

The cache key includes OS and architecture. If you change runners or platforms, a new cache entry will be created. This is expected behavior.

## Development

This is a composite action (YAML-based) with no compilation required.

### Running Test Workflows

To run the Kiro CLI test workflow (`.github/workflows/test-kiro-cli.yml`):

```bash
# Add AWS_ROLE_ARN secret to your repository
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>"
```

Requires OIDC provider configured (see Authentication Methods above).

### Testing Locally

```bash
# Clone the repository
git clone https://github.com/clouatre-labs/setup-kiro-action
cd setup-kiro-action

# Test in a workflow (see .github/workflows/test.yml)
```

## Migration from Q CLI

If you're migrating from `setup-q-cli-action`:

| Q CLI | Kiro CLI |
|-------|----------|
| `clouatre-labs/setup-q-cli-action@v1` | `clouatre-labs/setup-kiro-action@v1` |
| `qchat chat --no-interactive "prompt"` | `kiro-cli-chat chat --no-interactive "prompt"` |
| `${{ steps.q.outputs.q-version }}` | `${{ steps.kiro.outputs.kiro-version }}` |
| `${{ steps.q.outputs.q-path }}` | `${{ steps.kiro.outputs.kiro-path }}` |

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT - See [LICENSE](LICENSE)

## Related

- [Kiro CLI Documentation](https://kiro.dev/docs/cli/) - Official Kiro CLI documentation
- [Amazon Q Developer CLI](https://github.com/aws/amazon-q-developer-cli) - Upstream repository (Apache 2.0)
- [Setup Q CLI Action](https://github.com/clouatre-labs/setup-q-cli-action) - Previous action for Q CLI (deprecated)
- [Setup Goose Action](https://github.com/clouatre-labs/setup-goose-action) - Similar action for Goose AI agent

## Acknowledgments

Built by [clouatre-labs](https://github.com/clouatre-labs) for the developer community.

**Trademark Notice:** "Kiro" and "Amazon Web Services" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with, endorsed by, or sponsored by Amazon Web Services.

**SIGV4 Discovery:** The `AMAZON_Q_SIGV4` authentication mechanism was discovered through source code analysis of the [amazon-q-developer-cli](https://github.com/aws/amazon-q-developer-cli) repository. It is an undocumented feature that enables headless IAM authentication for CI/CD environments.
