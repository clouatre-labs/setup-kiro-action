# Security Policy

## Reporting Vulnerabilities

To report a security vulnerability in this action, please use GitHub's private vulnerability reporting feature:

1. Navigate to the [Security tab](https://github.com/clouatre-labs/setup-kiro-action/security/advisories) of this repository
2. Click "Report a vulnerability" and fill in the details
3. GitHub will create a private advisory for discussion

Alternatively, email hugues@linux.com with vulnerability details.

**Scope:** This action only (not Kiro CLI itself)

**Response Timeline**

| Severity | Acknowledgment | Remediation |
|----------|---|---|
| Critical/High | 48 hours | 14 days |
| Medium/Low | 5 business days | 30 days |

Once fixed and released, credit will be given to the reporter by name or pseudonym (your choice) in the release notes.

## Supported Versions

| Version | Supported | Status |
|---------|-----------|--------|
| v1.x    | Yes       | Active |
| < v1.0  | No        | Unsupported |

## Security Contact

**Primary:** hugues@linux.com

## Branch Protection

The `main` branch requires:

- All CI checks must pass (enforced via CI Result aggregate job)
- At least one approval before merge
- Commits must be signed (DCO)
- Release tags must be GPG-signed
- Renovate PRs trigger full CI test suite

## Disclosure Policy

- Fix will be developed and tested privately (GitHub Security Advisory)
- Release with fix will be published once patched
- Coordinated disclosure timeline: 30 days to patch before public disclosure
- Reporter will be credited in release notes
- Security advisory will be published alongside the release

## Out of Scope

- Kiro CLI vulnerabilities: Report to [AWS Amazon Q Developer CLI](https://github.com/aws/amazon-q-developer-cli/security)
- Workflow security patterns: See [examples/](examples/) and [ASSURANCE.md](ASSURANCE.md) for defensive guidance
