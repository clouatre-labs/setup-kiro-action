# Setup Kiro CLI Action

<p align="center">
  <a href="https://github.com/clouatre-labs/setup-kiro-action/actions/workflows/test.yml"><img alt="CI" src="https://github.com/clouatre-labs/setup-kiro-action/actions/workflows/test.yml/badge.svg"></a>
  <a href="https://github.com/marketplace/actions/setup-kiro-cli"><img alt="GitHub Marketplace" src="https://img.shields.io/badge/Marketplace-Setup%20Kiro%20CLI-blue?logo=github"></a>
  <a href="LICENSE"><img alt="License: Apache 2.0" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"></a>
  <a href="https://www.bestpractices.dev/projects/12330"><img alt="OpenSSF Best Practices (Silver)" src="https://www.bestpractices.dev/projects/12330/badge"></a>
</p>

<p align="center">A GitHub Action that installs and caches <a href="https://kiro.dev/docs/cli/">Kiro CLI</a> for CI/CD workflows, with headless IAM authentication via SIGV4. OpenSSF silver certified: fewer than 1% of open source projects reach this level.</p>

**Unofficial community action.** Not affiliated with or endorsed by Amazon Web Services. "Kiro" and "Amazon Web Services" are trademarks of AWS.

> [!IMPORTANT]
> **Prompt Injection Risk:** When AI analyzes user-controlled input (git diffs, code comments, commit messages), malicious actors can embed instructions to manipulate output. This applies to ANY AI tool.
>
> For production use, see [Security Patterns](#security-patterns) below for three defensive tiers.

## Usage

```yaml
# Recommended: get latest v1.x updates automatically
- uses: clouatre-labs/setup-kiro-action@v1

# Pin to exact SHA (recommended for supply chain integrity)
- uses: clouatre-labs/setup-kiro-action@91393ee22956aee30d31f53abc8d37ac69e02102  # v1.0.1
```

**Current default Kiro CLI version:** See [`action.yml`](action.yml#L15)

## Quick Start: Tier 1 (Maximum Security)

```yaml
name: AI Analysis - Maximum Security
on: [pull_request]

permissions:
  id-token: write
  contents: read

jobs:
  analyze:
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd  # v6

      - name: Lint Code
        run: pipx run ruff check --output-format=json . > lint.json || true

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@8df5847569e6427dd6c4fb1cf565c83acfa8afa7  # v6.0.0
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Setup Kiro CLI
        uses: clouatre-labs/setup-kiro-action@91393ee22956aee30d31f53abc8d37ac69e02102  # v1.0.1
        with:
          enable-sigv4: true
          aws-region: us-east-1

      - name: AI Analysis
        run: |
          echo "Summarize these linting issues and suggest fixes:" > prompt.txt
          cat lint.json >> prompt.txt
          kiro-cli-chat chat --no-interactive "$(cat prompt.txt)" > analysis.md

      - name: Upload Analysis
        uses: actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f  # v7
        with:
          name: ai-analysis
          path: analysis.md
```

## Features

- **Automatic caching** - Caches Kiro CLI binaries for faster subsequent runs
- **SIGV4 authentication** - IAM-based headless authentication for CI/CD
- **Lightweight** - No external dependencies

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `version` | Kiro CLI version to install | No | See [`action.yml`](action.yml#L15) |
| `aws-region` | AWS region for Kiro CLI operations | No | `us-east-1` |
| `enable-sigv4` | Enable SIGV4 authentication mode | No | `false` |
| `verify-checksum` | Verify SHA256 checksum of downloaded binary | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `kiro-version` | Installed Kiro CLI version |
| `kiro-path` | Path to Kiro CLI binary directory |

## Security Patterns

This action supports three security tiers for AI-augmented CI/CD:

- **Tier 1 (Maximum Security)**: AI analyzes only tool output (JSON), never raw code. [See workflow](examples/tier1-maximum-security.yml)
- **Tier 2**: AI sees file stats, requires manual approval. [See workflow](examples/tier2-balanced-security.yml)
- **Tier 3**: Full diff analysis, trusted teams only. [See workflow](examples/tier3-advanced-patterns.yml)

**Safe Pattern:** AI analyzes tool output (ruff, trivy, semgrep), not raw code.

**Unsafe Pattern:** AI analyzes git diffs directly, which is vulnerable to prompt injection.

Read the full explanation: [AI-Augmented CI/CD blog post](https://clouatre.ca/posts/ai-augmented-cicd)

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Supported Platforms

**GitHub-hosted runners only** - Designed for simple, fast, manageable CI/CD.

| OS | Architecture | Runner Label |
|----|--------------|--------------|
| Ubuntu | x64 | `ubuntu-24.04`, `ubuntu-22.04` |

macOS and Windows are not supported. For macOS, use the official install script: `curl -fsSL https://cli.kiro.dev/install | bash`

Self-hosted ARM64 runners may work but are untested.

## Authentication

### OIDC (Recommended)

Uses GitHub's OIDC provider for secure, credential-free authentication. See the [Tier 1 example](examples/tier1-maximum-security.yml) for a complete workflow.

Required IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["q:StartConversation", "q:SendMessage", "q:GetConversation"],
    "Resource": "*"
  }]
}
```

### IAM Credentials (Local / Simple Setups)

```yaml
- uses: clouatre-labs/setup-kiro-action@91393ee22956aee30d31f53abc8d37ac69e02102  # v1.0.1
  # Do NOT set enable-sigv4 with long-lived credentials

- name: Use Kiro CLI
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: us-east-1
  run: kiro-cli-chat chat --no-interactive "What is 2+2?"
```

Do not use `enable-sigv4: true` with long-lived IAM credentials (AKIA\* keys).

## How It Works

On first run, the action downloads the Kiro CLI binary from AWS CDN and caches it at `~/.local/bin/`. Subsequent runs restore from cache. When `enable-sigv4` is set, the action exports `AMAZON_Q_SIGV4=true` for headless IAM authentication.

> **SIGV4 Discovery:** The `AMAZON_Q_SIGV4` environment variable was discovered through source code analysis of the [amazon-q-developer-cli](https://github.com/aws/amazon-q-developer-cli) repository. It is an undocumented feature that enables headless IAM authentication for CI/CD environments.

## Troubleshooting

**Binary not found:** Ensure the action step runs before any `kiro-cli-chat` invocation.

**SIGV4 not working:** Verify `enable-sigv4: true` is set, AWS credentials are available, and the IAM role includes Amazon Q/Kiro permissions.

**Cache not working:** The cache key includes OS and architecture. Changing runners creates a new cache entry - this is expected.

## Migration from Q CLI

| Q CLI | Kiro CLI |
|-------|----------|
| `clouatre-labs/setup-q-cli-action@v1` | `clouatre-labs/setup-kiro-action@v1` |
| `qchat chat --no-interactive "..."` | `kiro-cli-chat chat --no-interactive "..."` |
| `steps.q.outputs.q-version` | `steps.kiro.outputs.kiro-version` |
| `steps.q.outputs.q-path` | `steps.kiro.outputs.kiro-path` |

## Contributing

Contributions are welcome. Please open an issue or PR.

## License

Apache 2.0. See [LICENSE](LICENSE).

## Related

- [AI-Augmented CI/CD](https://clouatre.ca/posts/ai-augmented-cicd/) - 3-tier security model for AI code review in CI/CD pipelines
- [Kiro CLI Documentation](https://kiro.dev/docs/cli/) - Official Kiro CLI documentation
- [Amazon Q Developer CLI](https://github.com/aws/amazon-q-developer-cli) - Upstream repository (Apache 2.0)
- [Setup Goose Action](https://github.com/clouatre-labs/setup-goose-action) - Similar action for Goose AI agent
- [Setup Q CLI Action](https://github.com/clouatre-labs/setup-q-cli-action) - Previous action for Q CLI (deprecated)

## Acknowledgments

Built by [clouatre-labs](https://github.com/clouatre-labs) for the developer community.

**Trademark Notice:** "Kiro" and "Amazon Web Services" are trademarks of Amazon.com, Inc. or its affiliates. This project is not affiliated with, endorsed by, or sponsored by Amazon Web Services.
