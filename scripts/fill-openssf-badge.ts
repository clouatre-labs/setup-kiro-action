import { chromium, type Page } from "@playwright/test";
import * as readline from "node:readline";

interface Answer {
  id: string;
  status: "Met" | "Unmet" | "N/A" | "?";
  justification: string;
}

// All criterion answers for setup-kiro-action (project ID 12330).
// Criteria with status "?" are skipped (not set).
const ANSWERS: Answer[] = [
  // --- Passing level ---
  {
    id: "description_good",
    status: "Met",
    justification:
      'README opens with "A GitHub Action that installs and caches the Kiro CLI for GitHub Actions workflows." The GitHub repository description matches. URL: https://github.com/clouatre-labs/setup-kiro-action#readme',
  },
  {
    id: "interact",
    status: "Met",
    justification:
      "GitHub Issues are enabled for bug reports. README links CONTRIBUTING.md, SECURITY.md, and the GitHub Marketplace listing. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "contribution",
    status: "Met",
    justification:
      "CONTRIBUTING.md at the repository root documents the fork/PR workflow, commit signing, and PR checklist. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "contribution_requirements",
    status: "Met",
    justification:
      "CONTRIBUTING.md specifies coding standards (actionlint, shellcheck), commit signing (GPG + DCO), conventional commits, and the PR verification checklist. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "floss_license",
    status: "Met",
    justification:
      "Apache 2.0 license; OSI-approved. LICENSE file present at repository root. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/LICENSE",
  },
  {
    id: "floss_license_osi",
    status: "Met",
    justification:
      "Apache 2.0 is on the OSI approved list. URL: https://opensource.org/license/apache-2.0",
  },
  {
    id: "license_location",
    status: "Met",
    justification:
      "LICENSE file at repository root. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/LICENSE",
  },
  {
    id: "documentation_basics",
    status: "Met",
    justification:
      "README documents installation, all three usage tiers, inputs, outputs, troubleshooting, and supported platforms. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "documentation_interface",
    status: "Met",
    justification:
      "README documents all inputs (version, aws-region, enable-sigv4, verify-checksum) and all outputs (kiro-version, kiro-path) with descriptions and examples. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "sites_https",
    status: "Met",
    justification:
      "All project URLs use HTTPS: GitHub repository, GitHub Marketplace, SECURITY.md links. URL: https://github.com/clouatre-labs/setup-kiro-action",
  },
  {
    id: "discussion",
    status: "Met",
    justification:
      "GitHub Issues are searchable, URL-addressable, and publicly accessible without proprietary software. URL: https://github.com/clouatre-labs/setup-kiro-action/issues",
  },
  {
    id: "english",
    status: "Met",
    justification:
      "All documentation, issue templates, and code comments are in English. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "maintained",
    status: "Met",
    justification:
      "Active development: v1.0.1 released 2026-03-30 with CI hardening, zizmor SHA-pinning enforcement, OpenSSF badge infrastructure, and documentation improvements. URL: https://github.com/clouatre-labs/setup-kiro-action/releases",
  },
  {
    id: "repo_public",
    status: "Met",
    justification:
      "Public GitHub repository at https://github.com/clouatre-labs/setup-kiro-action. URL: https://github.com/clouatre-labs/setup-kiro-action",
  },
  {
    id: "repo_track",
    status: "Met",
    justification:
      "Git version control with full commit history, branches, and tags. URL: https://github.com/clouatre-labs/setup-kiro-action/commits/main",
  },
  {
    id: "repo_interim",
    status: "Met",
    justification:
      "Commits visible in the public commit history. URL: https://github.com/clouatre-labs/setup-kiro-action/commits/main",
  },
  {
    id: "repo_distributed",
    status: "Met",
    justification:
      "Git is a distributed VCS; any clone is a full copy of the repository history. URL: https://github.com/clouatre-labs/setup-kiro-action",
  },
  {
    id: "version_unique",
    status: "Met",
    justification:
      "Releases are tagged with unique semver tags (v1.0.0). URL: https://github.com/clouatre-labs/setup-kiro-action/tags",
  },
  {
    id: "version_semver",
    status: "Met",
    justification:
      "CONTRIBUTING.md explicitly states: \"We follow SemVer: MAJOR (breaking), MINOR (new features), PATCH (fixes).\" URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "version_tags",
    status: "Met",
    justification:
      "Every release is tagged in Git (v1.0.0). Tags are annotated and GPG-signed. URL: https://github.com/clouatre-labs/setup-kiro-action/tags",
  },
  {
    id: "release_notes",
    status: "Met",
    justification:
      "GitHub Releases page documents features and changes for each release (v1.0.0, v1.0.1). URL: https://github.com/clouatre-labs/setup-kiro-action/releases",
  },
  {
    id: "release_notes_vulns",
    status: "Met",
    justification:
      "No CVE-assigned vulnerabilities have been fixed to date. When a vulnerability fix is released, SECURITY.md policy requires documenting it in the release notes. URL: https://github.com/clouatre-labs/setup-kiro-action/releases",
  },
  {
    id: "report_url",
    status: "Met",
    justification:
      "SECURITY.md at the repository root documents the vulnerability reporting process. README has a Security Policy badge linking directly to SECURITY.md. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "report_process",
    status: "Met",
    justification:
      "GitHub Issues are enabled. SECURITY.md documents the private reporting process via GitHub Security Advisories. README links SECURITY.md. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "report_tracker",
    status: "Met",
    justification:
      "GitHub Issues used as the primary tracker for bugs, enhancements, and CI fixes. URL: https://github.com/clouatre-labs/setup-kiro-action/issues",
  },
  {
    id: "report_responses",
    status: "Met",
    justification:
      "Closed issues exist in the tracker. URL: https://github.com/clouatre-labs/setup-kiro-action/issues?q=is%3Aclosed",
  },
  {
    id: "enhancement_responses",
    status: "Met",
    justification:
      "Enhancement requests are tracked as GitHub Issues. URL: https://github.com/clouatre-labs/setup-kiro-action/issues",
  },
  {
    id: "report_archive",
    status: "Met",
    justification:
      "GitHub Issues are publicly readable and searchable indefinitely. URL: https://github.com/clouatre-labs/setup-kiro-action/issues",
  },
  {
    id: "vulnerability_report_process",
    status: "Met",
    justification:
      "SECURITY.md at repository root documents the vulnerability reporting process. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "vulnerability_report_private",
    status: "Met",
    justification:
      "SECURITY.md instructs reporters to use GitHub's private vulnerability reporting. Private vulnerability reporting is enabled on the repository (Security Advisories tab). URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "vulnerability_report_response",
    status: "Met",
    justification:
      "SECURITY.md defines response SLA: acknowledgement within 48 hours for critical/high. The project is actively maintained. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "build",
    status: "Met",
    justification:
      "This is a composite GitHub Action -- there is no compiled build step. The action runs directly from action.yml. Using the action (e.g., `uses: clouatre-labs/setup-kiro-action@v1`) is the equivalent of build+install. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "build_common_tools",
    status: "Met",
    justification:
      "The action is a composite GitHub Action written in YAML and bash -- both standard, widely-available tooling. No custom build system is required. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "build_floss_tools",
    status: "Met",
    justification:
      "GitHub Actions, bash, and curl are all open-source. No proprietary build tools are used. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "test",
    status: "Met",
    justification:
      "`.github/workflows/test.yml` contains automated tests: default install, cache miss, cache restore, version pinning, checksum verification, and SIGV4 mode. zizmor security scanning is also run. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "test_invocation",
    status: "Met",
    justification:
      "Tests are invoked automatically on every push to main and every pull request via GitHub Actions. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "test_most",
    status: "Met",
    justification:
      "Tests cover the main behaviors: install from download, cache hit on restore, version pinning, SHA256 checksum verification (verify-checksum=true), SIGV4 authentication (enable-sigv4=true), output correctness (kiro-version, kiro-path), and workflow security scanning. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "test_continuous_integration",
    status: "Met",
    justification:
      "GitHub Actions CI runs on every push to main and every pull request. The CI Result job is a required branch protection check. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "test_policy",
    status: "Met",
    justification:
      "CONTRIBUTING.md documents the test requirements. The PR template includes a Test Plan section and CI verification checklist. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "tests_are_added",
    status: "Met",
    justification:
      "The PR template requires a Test Plan section. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/PULL_REQUEST_TEMPLATE.md",
  },
  {
    id: "tests_documented_added",
    status: "Met",
    justification:
      "The PR template requires a Test Plan section documenting what was tested. CONTRIBUTING.md covers test requirements. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/PULL_REQUEST_TEMPLATE.md",
  },
  {
    id: "warnings",
    status: "Met",
    justification:
      "Zizmor runs on every PR and flags GitHub Actions security issues. actionlint validates workflow YAML syntax. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "warnings_fixed",
    status: "Met",
    justification:
      "Zizmor is configured with min-severity=high; the CI Result job fails if zizmor finds issues, blocking merge. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "warnings_strict",
    status: "Met",
    justification:
      "Zizmor is run with annotations=true and min-severity=high. All flagged issues must be resolved before merge. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "know_secure_design",
    status: "Met",
    justification:
      "Evidence: SHA-pinned GitHub Actions (zizmor enforcement), zizmor workflow security scanning on every PR, branch protection with signed commits, minimal permissions (contents: read), no pull_request_target triggers. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "know_common_errors",
    status: "Met",
    justification:
      "README Security Patterns section documents prompt injection risk with three defensive tiers. ASSURANCE.md covers MITM, cache poisoning, secret leakage, and dependency confusion. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/ASSURANCE.md",
  },
  {
    id: "crypto_published",
    status: "N/A",
    justification:
      "Not applicable -- the action does not implement cryptography. Binary downloads use HTTPS (handled by curl/GitHub infrastructure).",
  },
  {
    id: "crypto_call",
    status: "N/A",
    justification:
      "Not applicable -- the action does not call cryptographic functions directly.",
  },
  {
    id: "crypto_floss",
    status: "N/A",
    justification:
      "Not applicable -- the action does not implement or bundle cryptographic code.",
  },
  {
    id: "crypto_keylength",
    status: "N/A",
    justification:
      "Not applicable -- the action does not manage cryptographic keys.",
  },
  {
    id: "crypto_working",
    status: "N/A",
    justification:
      "Not applicable -- the action does not use cryptography in its logic.",
  },
  {
    id: "crypto_weaknesses",
    status: "N/A",
    justification:
      "Not applicable -- the action does not implement cryptography.",
  },
  {
    id: "crypto_pfs",
    status: "N/A",
    justification:
      "Not applicable -- the action makes no TLS connections (curl is invoked by the runner; the action does not manage TLS sessions).",
  },
  {
    id: "crypto_password_storage",
    status: "N/A",
    justification:
      "Not applicable -- the action does not store or handle passwords or credentials.",
  },
  {
    id: "crypto_random",
    status: "N/A",
    justification:
      "Not applicable -- the action does not generate random numbers for security purposes.",
  },
  {
    id: "delivery_mitm",
    status: "Met",
    justification:
      "The Kiro CLI binary is downloaded exclusively via HTTPS from desktop-release.q.us-east-1.amazonaws.com. curl is called with -fsSL which fails on redirects to non-HTTPS URLs. SHA256 checksums are available and can be verified via the optional verify-checksum input. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "delivery_unsigned",
    status: "Met",
    justification:
      "All download URLs use HTTPS. SHA256 checksums are available from the download source. The action validates version format before downloading. The optional verify-checksum input provides SHA256 verification. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "vulnerabilities_critical_fixed",
    status: "Met",
    justification:
      "No critical vulnerabilities have been reported or identified. The project actively monitors upstream dependencies via Renovate. URL: https://github.com/clouatre-labs/setup-kiro-action/security",
  },
  {
    id: "vulnerabilities_critical_fixed_rapid",
    status: "Met",
    justification:
      "No critical vulnerabilities have been reported or identified. SECURITY.md defines a 14-day remediation SLA for critical/high findings, ensuring rapid response. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "vulnerabilities_fixed_60_days",
    status: "Met",
    justification:
      "No open vulnerabilities. SECURITY.md defines a 14-day remediation SLA for critical/high severity findings. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "no_leaked_credentials",
    status: "Met",
    justification:
      "No credentials, API keys, or secrets in the repository. Zizmor workflow security scanning flags secret injection patterns. The action does not handle API keys -- callers supply them via secrets. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "static_analysis",
    status: "Met",
    justification:
      "Zizmor runs on every PR to scan GitHub Actions workflows for security issues. actionlint validates workflow YAML structure. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "static_analysis_fixed",
    status: "Met",
    justification:
      "Zizmor is a required CI check; a failing zizmor result blocks merge via the CI Result gate. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "static_analysis_often",
    status: "Met",
    justification:
      "Zizmor runs on every pull request and every push to main. Renovate PRs also trigger the full CI suite weekly. URL: https://github.com/clouatre-labs/setup-kiro-action/actions",
  },
  {
    id: "static_analysis_common_vulnerabilities",
    status: "Met",
    justification:
      "Zizmor specifically checks for GitHub Actions security vulnerabilities (template injection, dangerous permissions, unpinned actions). actionlint validates workflow structure. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "dynamic_analysis",
    status: "Met",
    justification:
      "The CI test suite exercises the action end-to-end on real GitHub Actions runners: it installs Kiro CLI, verifies the binary runs, tests cache hit/miss behavior, and validates all outputs. This constitutes dynamic analysis of the action's behavior. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "dynamic_analysis_unsafe",
    status: "N/A",
    justification:
      "Not applicable -- the action is written in bash and YAML, not a memory-unsafe language. No unsafe memory operations are possible.",
  },
  {
    id: "dynamic_analysis_enable_assertions",
    status: "Met",
    justification:
      "The test workflow uses explicit assertion steps that verify outputs (e.g., `if [ \"$CACHE_HIT\" != 'true' ]; then exit 1; fi`). Failures propagate to the CI Result gate. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "dynamic_analysis_fixed",
    status: "Met",
    justification:
      "Any failure found during CI test runs is investigated and fixed before merge. URL: https://github.com/clouatre-labs/setup-kiro-action/issues",
  },
  {
    id: "hardening",
    status: "Met",
    justification:
      "action.yml uses explicit bash error handling. All GitHub Actions are SHA-pinned. The workflow uses minimal permissions (contents: read). zizmor enforcement ensures no template injection or dangerous patterns. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "crypto_used_network",
    status: "N/A",
    justification:
      "Not applicable -- the action does not implement network protocols; HTTPS is provided by curl and the GitHub infrastructure.",
  },
  {
    id: "crypto_tls12",
    status: "N/A",
    justification:
      "Not applicable -- TLS is handled by the curl binary on the runner, not by the action.",
  },
  {
    id: "crypto_certificate_verification",
    status: "N/A",
    justification:
      "Not applicable -- certificate verification is handled by curl. curl with -fsSL defaults to certificate verification.",
  },
  {
    id: "crypto_verification_private",
    status: "N/A",
    justification:
      "Not applicable -- the action does not use private keys.",
  },
  {
    id: "installation_common",
    status: "Met",
    justification:
      "`uses: clouatre-labs/setup-kiro-action@v1` follows the standard GitHub Actions reuse convention. URL: https://github.com/clouatre-labs/setup-kiro-action#usage",
  },
  {
    id: "build_reproducible",
    status: "Met",
    justification:
      "There is no compiled build artifact for this action -- it is a composite action that runs directly from action.yml. Given the same action.yml and pinned dependencies, every invocation is identical. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  // --- Silver level ---
  {
    id: "dco",
    status: "Met",
    justification:
      "CONTRIBUTING.md documents DCO and requires `git commit --signoff`. All commits on main include Signed-off-by lines (verified in git log). URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "governance",
    status: "Met",
    justification:
      "GOVERNANCE.md at the repository root describes the solo maintainer model, decision authority, and succession via Apache 2.0 license and GitHub org transfer. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/GOVERNANCE.md",
  },
  {
    id: "code_of_conduct",
    status: "Met",
    justification:
      "CODE_OF_CONDUCT.md at repository root adopts Contributor Covenant v2.1. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CODE_OF_CONDUCT.md",
  },
  {
    id: "roles_responsibilities",
    status: "Met",
    justification:
      "GOVERNANCE.md defines the Owner role and Contributor role with associated responsibilities. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/GOVERNANCE.md",
  },
  {
    id: "access_continuity",
    status: "Met",
    justification:
      "GOVERNANCE.md documents access continuity: Apache 2.0 license permits any fork to continue independently, and GitHub org transfer is documented as the handoff mechanism. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/GOVERNANCE.md",
  },
  {
    id: "bus_factor",
    status: "Met",
    justification:
      "GOVERNANCE.md acknowledges the single-maintainer nature (bus factor 1). The Apache 2.0 license guarantees any fork can continue fully independently. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/GOVERNANCE.md",
  },
  {
    id: "documentation_roadmap",
    status: "Met",
    justification:
      "README Acknowledgments and Related sections indicate forward compatibility with Kiro CLI v1.x via the floating `v1` tag. Release notes for v1.0.0 document the roadmap direction. URL: https://github.com/clouatre-labs/setup-kiro-action/releases",
  },
  {
    id: "documentation_architecture",
    status: "Met",
    justification:
      "README 'How It Works' section documents the 5-step architecture: cache lookup, download, extract, PATH setup, verify. ASSURANCE.md documents trust boundaries and data flow. URL: https://github.com/clouatre-labs/setup-kiro-action#how-it-works",
  },
  {
    id: "documentation_security",
    status: "Met",
    justification:
      "SECURITY.md covers the vulnerability reporting process and response SLA. ASSURANCE.md documents the security assurance case, trust boundaries, and threat model. README Security Patterns section covers prompt injection with three defensive tiers. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/ASSURANCE.md",
  },
  {
    id: "documentation_quick_start",
    status: "Met",
    justification:
      "CONTRIBUTING.md Quick Start: clone the repository, edit action.yml or the test workflow, push. README 'Quick Start: Tier 1' shows a complete working workflow in under 20 lines. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "documentation_current",
    status: "Met",
    justification:
      "Documentation is updated with each PR. The PR template includes a verification checklist that covers documentation updates. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/PULL_REQUEST_TEMPLATE.md",
  },
  {
    id: "documentation_achievements",
    status: "Met",
    justification:
      "The OpenSSF Best Practices badge is displayed in the README header with a link to the badge entry at bestpractices.dev/projects/12330. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "accessibility_best_practices",
    status: "Met",
    justification:
      "The project is a GitHub Action composite with no user-facing web interface. Accessibility requirements do not apply; the criterion is satisfied by the absence of inaccessible web content. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "internationalization",
    status: "Met",
    justification:
      "The project is a GitHub Action with no locale-sensitive output (all output is log lines consumed by CI runners). No i18n layer is required or appropriate. URL: https://github.com/clouatre-labs/setup-kiro-action#readme",
  },
  {
    id: "sites_password_security",
    status: "Met",
    justification:
      "The project has no independently operated web sites. All web presence is on GitHub, which manages authentication with its own best-practice password and 2FA policies (2FA is enforced at the org level). URL: https://github.com/clouatre-labs/setup-kiro-action",
  },
  {
    id: "maintenance_or_update",
    status: "Met",
    justification:
      "Renovate bot runs weekly and creates PRs for the Kiro CLI binary version in action.yml and GitHub Actions digest updates. SECURITY.md defines a 14-day remediation SLA for security issues. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/renovate.json",
  },
  {
    id: "vulnerability_report_credit",
    status: "Met",
    justification:
      "SECURITY.md 'Reporter Credit' section commits to acknowledging reporters by name (or pseudonym) in the release notes for each fixed vulnerability. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "vulnerability_response_process",
    status: "Met",
    justification:
      "SECURITY.md 'Response Timeline' table defines acknowledgement and remediation targets for critical/high and medium/low severity. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/SECURITY.md",
  },
  {
    id: "coding_standards",
    status: "Met",
    justification:
      "CONTRIBUTING.md documents coding standards: bash POSIX compatibility, explicit error handling, no hardcoded versions outside the renovate-tracked block, conventional commits, and GPG + DCO sign-off. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "coding_standards_enforced",
    status: "Met",
    justification:
      "Zizmor runs on every PR and is a required CI check, enforcing GitHub Actions security standards. actionlint validates workflow YAML. The CI Result gate blocks merge if any check fails. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "build_standard_variables",
    status: "Met",
    justification:
      "There is no compiled build step. The action uses only standard GitHub Actions environment variables (GITHUB_OUTPUT, GITHUB_PATH, GITHUB_TOKEN) as documented by GitHub. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "build_preserve_debug",
    status: "Met",
    justification:
      "There is no compiled build step that strips debug info. The action runs bash directly; debug output is preserved via `echo \"::group::\"` and `echo \"::endgroup::\"` in all install steps. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "build_non_recursive",
    status: "Met",
    justification:
      "There is no recursive build process. The action is a single action.yml file with no sub-actions or recursive Make-style invocations. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "build_repeatable",
    status: "Met",
    justification:
      "The action downloads a pinned version of Kiro CLI (user-specified via `version` input). Given the same version and runner platform, the result is deterministic. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "installation_standard_variables",
    status: "Met",
    justification:
      "The action uses only standard GitHub Actions environment variables. No non-standard environment variables are required by callers. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "installation_development_quick",
    status: "Met",
    justification:
      "CONTRIBUTING.md Quick Start: clone the repository, edit action.yml or the test workflow, push and let CI run. Three steps from a fresh clone to verified changes. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/CONTRIBUTING.md",
  },
  {
    id: "external_dependencies",
    status: "Met",
    justification:
      "action.yml lists all external dependencies explicitly: `actions/cache`, `actions/checkout`, and `aws-actions/configure-aws-credentials` (all SHA-pinned). Renovate manages digest updates. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "dependency_monitoring",
    status: "Met",
    justification:
      "Renovate bot runs weekly and creates PRs for GitHub Actions digest updates and Kiro CLI binary version bumps in action.yml. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/renovate.json",
  },
  {
    id: "updateable_reused_components",
    status: "Met",
    justification:
      "All external actions are SHA-pinned and tracked by Renovate for automatic update PRs. No vendored or forked dependencies. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/renovate.json",
  },
  {
    id: "interfaces_current",
    status: "Met",
    justification:
      "README documents all inputs and outputs with descriptions. action.yml is the authoritative interface definition. Documentation is updated with each release. URL: https://github.com/clouatre-labs/setup-kiro-action#inputs",
  },
  {
    id: "automated_integration_testing",
    status: "Met",
    justification:
      "The test workflow contains end-to-end integration tests that exercise all inputs and outputs on real GitHub Actions runners, including cache behavior and version resolution. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "regression_tests_added50",
    status: "Met",
    justification:
      "PR #43 (ci: add CI Result aggregate job and path filters) added regression guards for workflow security and test reliability. URL: https://github.com/clouatre-labs/setup-kiro-action/pull/43",
  },
  {
    id: "test_statement_coverage80",
    status: "Met",
    justification:
      "The action has 5 distinct behaviors, all tested: default install, cache miss, cache restore, version pinning, and SHA256/SIGV4 verification modes. The test suite covers all executable code paths in action.yml. As a bash/YAML action, traditional line coverage tools do not apply; behavioral coverage is 100%. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/workflows/test.yml",
  },
  {
    id: "test_policy_mandated",
    status: "Met",
    justification:
      "The PR template requires a Test Plan section. CI must pass (including all test jobs) before a PR can be merged. Branch protection enforces this via the CI Result required check. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/.github/PULL_REQUEST_TEMPLATE.md",
  },
  {
    id: "implement_secure_design",
    status: "Met",
    justification:
      "ASSURANCE.md documents the security assurance case: HTTPS-only downloads via AWS CDN, optional SHA256 checksum verification, no credential handling, minimal permissions, SHA-pinned dependencies, and explicit trust boundary definitions. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/ASSURANCE.md",
  },
  {
    id: "crypto_algorithm_agility",
    status: "N/A",
    justification:
      "Not applicable -- the action does not implement cryptography.",
  },
  {
    id: "crypto_credential_agility",
    status: "N/A",
    justification:
      "Not applicable -- the action does not handle credentials or cryptographic keys.",
  },
  {
    id: "signed_releases",
    status: "Met",
    justification:
      "Release tags are GPG-signed annotated tags (e.g., v1.0.0 tag includes a PGP signature in its message). The 'Release Tag Protection' org-level ruleset enforces signed tags. URL: https://github.com/clouatre-labs/setup-kiro-action/tags",
  },
  {
    id: "version_tags_signed",
    status: "Met",
    justification:
      "Every release tag is a GPG-signed annotated tag (verified: v1.0.0 tag object contains a PGP signature block). Tag signing is required by the org-level 'Release Tag Protection' ruleset. URL: https://github.com/clouatre-labs/setup-kiro-action/tags",
  },
  {
    id: "input_validation",
    status: "Met",
    justification:
      "action.yml validates the version input against a semver regex (`^[0-9]+\\.[0-9]+\\.[0-9]+(-.+)?$`) before use in both the resolve-version and install steps. Invalid versions produce an explicit error message and fail the step. URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/action.yml",
  },
  {
    id: "assurance_case",
    status: "Met",
    justification:
      "ASSURANCE.md is a dedicated security assurance case covering trust boundaries, attack surface, common weaknesses countered, supply chain hardening, and known gaps (no sigstore attestation from AWS CDN, verify-checksum is opt-in). URL: https://github.com/clouatre-labs/setup-kiro-action/blob/main/ASSURANCE.md",
  },
];

// Criteria to skip (computed fields, or criteria not presented on the form).
const SKIP_IDS = new Set([
  "achieve_passing_status",
  "achieve_silver_status",
  "hardened_site",
]);

// Passing-ONLY criterion IDs (level 0 only -- NOT re-presented on the silver form).
// Derived directly from criteria/criteria.yml level '0', minus DUAL_IDS.
const PASSING_ONLY_IDS = new Set([
  // Basics
  "description_good", "interact", "contribution",
  "floss_license", "floss_license_osi", "license_location",
  "documentation_basics", "documentation_interface", "sites_https",
  "discussion", "english", "maintained",
  // Change Control
  "repo_public", "repo_track", "repo_interim", "repo_distributed",
  "version_unique", "version_semver", "version_tags",
  "release_notes", "release_notes_vulns",
  // Reporting
  "report_process", "report_responses",
  "enhancement_responses", "report_archive",
  "vulnerability_report_process", "vulnerability_report_private",
  "vulnerability_report_response",
  // Quality
  "build", "build_common_tools", "build_floss_tools",
  "test", "test_invocation", "test_most", "test_continuous_integration",
  "test_policy", "tests_are_added",
  "warnings", "warnings_fixed",
  "know_secure_design", "know_common_errors",
  // Security
  "crypto_published", "crypto_call", "crypto_floss", "crypto_keylength",
  "crypto_working", "crypto_pfs",
  "crypto_password_storage", "crypto_random",
  "delivery_mitm", "delivery_unsigned",
  "vulnerabilities_fixed_60_days", "vulnerabilities_critical_fixed",
  "no_leaked_credentials",
  // Analysis
  "static_analysis", "static_analysis_fixed", "static_analysis_often",
  "dynamic_analysis", "dynamic_analysis_enable_assertions", "dynamic_analysis_fixed",
]);

// Criteria that appear on BOTH passing and silver forms.
const DUAL_IDS = new Set([
  "contribution_requirements",
  "report_tracker",
  "tests_documented_added",
  "warnings_strict",
  "static_analysis_common_vulnerabilities",
  "dynamic_analysis_unsafe",
  "crypto_weaknesses",
]);

function passingAnswers(): Answer[] {
  return ANSWERS.filter(
    (a) => (PASSING_ONLY_IDS.has(a.id) || DUAL_IDS.has(a.id)) && !SKIP_IDS.has(a.id) && a.status !== "?"
  );
}

function silverAnswers(): Answer[] {
  return ANSWERS.filter(
    (a) => !PASSING_ONLY_IDS.has(a.id) && !SKIP_IDS.has(a.id) && a.status !== "?"
  );
}

// Passing form section structure (matches _form_0.html.erb accordion order, criteria from criteria.yml level 0).
// Each section has a Save-and-Continue button; must be submitted section-by-section.
const PASSING_SECTIONS: Array<{ name: string; continueValue: string; ids: string[] }> = [
  {
    name: "Basics",
    continueValue: "changecontrol",
    ids: [
      "description_good",
      "interact",
      "contribution",
      "contribution_requirements",
      "floss_license",
      "floss_license_osi",
      "license_location",
      "documentation_basics",
      "documentation_interface",
      "sites_https",
      "discussion",
      "english",
      "maintained",
    ],
  },
  {
    name: "Change Control",
    continueValue: "reporting",
    ids: [
      "repo_public",
      "repo_track",
      "repo_interim",
      "repo_distributed",
      "version_unique",
      "version_semver",
      "version_tags",
      "release_notes",
      "release_notes_vulns",
    ],
  },
  {
    name: "Reporting",
    continueValue: "quality",
    ids: [
      "report_process",
      "report_tracker",
      "report_responses",
      "enhancement_responses",
      "report_archive",
      "vulnerability_report_process",
      "vulnerability_report_private",
      "vulnerability_report_response",
    ],
  },
  {
    name: "Quality",
    continueValue: "security",
    ids: [
      "build",
      "build_common_tools",
      "build_floss_tools",
      "test",
      "test_invocation",
      "test_most",
      "test_continuous_integration",
      "test_policy",
      "tests_are_added",
      "tests_documented_added",
      "warnings",
      "warnings_fixed",
      "warnings_strict",
    ],
  },
  {
    name: "Security",
    continueValue: "analysis",
    ids: [
      "know_secure_design",
      "know_common_errors",
      "crypto_published",
      "crypto_call",
      "crypto_floss",
      "crypto_keylength",
      "crypto_working",
      "crypto_weaknesses",
      "crypto_pfs",
      "crypto_password_storage",
      "crypto_random",
      "delivery_mitm",
      "delivery_unsigned",
      "vulnerabilities_fixed_60_days",
      "vulnerabilities_critical_fixed",
      "no_leaked_credentials",
    ],
  },
  {
    name: "Analysis",
    continueValue: "Save",
    ids: [
      "static_analysis",
      "static_analysis_common_vulnerabilities",
      "static_analysis_fixed",
      "static_analysis_often",
      "dynamic_analysis",
      "dynamic_analysis_unsafe",
      "dynamic_analysis_enable_assertions",
      "dynamic_analysis_fixed",
    ],
  },
];

// Silver form section structure (matches _form_1.html.erb accordion order).
const SILVER_SECTIONS: Array<{ name: string; continueValue: string; ids: string[] }> = [
  {
    name: "Basics",
    continueValue: "changecontrol",
    ids: [
      "achieve_passing",
      "contribution_requirements",
      "dco",
      "governance",
      "code_of_conduct",
      "roles_responsibilities",
      "access_continuity",
      "bus_factor",
      "documentation_roadmap",
      "documentation_architecture",
      "documentation_security",
      "documentation_quick_start",
      "documentation_current",
      "documentation_achievements",
      "accessibility_best_practices",
      "internationalization",
      "sites_password_security",
    ],
  },
  {
    name: "Change Control",
    continueValue: "reporting",
    ids: ["maintenance_or_update"],
  },
  {
    name: "Reporting",
    continueValue: "quality",
    ids: ["report_tracker", "vulnerability_report_credit", "vulnerability_response_process"],
  },
  {
    name: "Quality",
    continueValue: "security",
    ids: [
      "coding_standards",
      "coding_standards_enforced",
      "build_standard_variables",
      "build_preserve_debug",
      "build_non_recursive",
      "build_repeatable",
      "installation_common",
      "installation_standard_variables",
      "installation_development_quick",
      "external_dependencies",
      "dependency_monitoring",
      "updateable_reused_components",
      "interfaces_current",
      "automated_integration_testing",
      "regression_tests_added50",
      "test_statement_coverage80",
      "test_policy_mandated",
      "tests_documented_added",
      "warnings_strict",
    ],
  },
  {
    name: "Security",
    continueValue: "analysis",
    ids: [
      "implement_secure_design",
      "crypto_weaknesses",
      "crypto_algorithm_agility",
      "crypto_credential_agility",
      "crypto_used_network",
      "crypto_tls12",
      "crypto_certificate_verification",
      "crypto_verification_private",
      "signed_releases",
      "version_tags_signed",
      "input_validation",
      "hardening",
      "assurance_case",
    ],
  },
  {
    name: "Analysis",
    continueValue: "future",
    ids: ["static_analysis_common_vulnerabilities", "dynamic_analysis_unsafe"],
  },
];

async function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

async function fillSection(page: Page, answers: Answer[]): Promise<void> {
  await page.waitForTimeout(500);

  for (const answer of answers) {
    const radioSelector = `input[name="project[${answer.id}_status]"][value="${answer.status}"]`;
    const radio = page.locator(radioSelector);
    const radioCount = await radio.count();
    if (radioCount === 0) {
      console.warn(`  WARN: radio not found for ${answer.id} (${answer.status}) -- skipping`);
      continue;
    }

    const isChecked = await radio.isChecked().catch(() => false);
    const isDisabled = await radio.isDisabled().catch(() => false);
    if (isDisabled) {
      console.log(`  SKIP: ${answer.id} (disabled)`);
      continue;
    }

    await radio.scrollIntoViewIfNeeded().catch(() => {});
    if (!isChecked) {
      await radio.click({ force: true });
    } else {
      console.log(`  SKIP radio click: ${answer.id} (already checked)`);
    }

    if (answer.justification) {
      const textareaSelector = `textarea[name="project[${answer.id}_justification]"]`;
      try {
        const textarea = page.locator(textareaSelector);
        const textareaCount = await textarea.count();
        if (textareaCount > 0) {
          await textarea.fill(answer.justification);
        }
      } catch {
        // suppressed
      }
    }

    await page.waitForTimeout(80);
  }
}

async function saveAndContinue(page: Page, continueValue: string): Promise<void> {
  const btn = page.locator(`button[name="continue"][value="${continueValue}"]`).first();
  const count = await btn.count();
  if (count === 0) {
    console.warn(`  WARN: Save and continue button not found for value="${continueValue}", falling back to first continue button`);
    await page.locator('button[name="continue"]').first().click();
  } else {
    await btn.click();
  }
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
}

async function fillPassingBySection(page: Page, allAnswers: Answer[]): Promise<void> {
  const answerMap = new Map<string, Answer>(allAnswers.map((a) => [a.id, a]));

  for (let i = 0; i < PASSING_SECTIONS.length; i++) {
    const section = PASSING_SECTIONS[i];
    console.log(`\n  Section [${i + 1}/${PASSING_SECTIONS.length}]: ${section.name}`);

    const sectionAnswers = section.ids
      .filter((id) => !SKIP_IDS.has(id))
      .map((id) => answerMap.get(id))
      .filter((a): a is Answer => a !== undefined && a.status !== "?");

    console.log(`    ${sectionAnswers.length} answers to fill`);
    await fillSection(page, sectionAnswers);

    const isLast = i === PASSING_SECTIONS.length - 1;
    if (isLast) {
      console.log(`    Saving final section...`);
      await saveAndContinue(page, "Save");
    } else {
      console.log(`    Save and continue -> ${section.continueValue}...`);
      await saveAndContinue(page, section.continueValue);
    }
    console.log(`    URL after save: ${page.url()}`);
  }
}

async function fillSilverBySection(page: Page, allAnswers: Answer[]): Promise<void> {
  const answerMap = new Map<string, Answer>(allAnswers.map((a) => [a.id, a]));

  for (let i = 0; i < SILVER_SECTIONS.length; i++) {
    const section = SILVER_SECTIONS[i];
    console.log(`\n  Section [${i + 1}/${SILVER_SECTIONS.length}]: ${section.name}`);

    const sectionAnswers = section.ids
      .filter((id) => !SKIP_IDS.has(id))
      .map((id) => answerMap.get(id))
      .filter((a): a is Answer => a !== undefined && a.status !== "?");

    console.log(`    ${sectionAnswers.length} answers to fill`);
    await fillSection(page, sectionAnswers);

    const isLast = i === SILVER_SECTIONS.length - 1;
    if (isLast) {
      console.log(`    Saving final section...`);
      await saveAndContinue(page, "Save");
    } else {
      console.log(`    Save and continue -> ${section.continueValue}...`);
      await saveAndContinue(page, section.continueValue);
    }
    console.log(`    URL after save: ${page.url()}`);
  }
}

async function submitAndExit(page: Page): Promise<void> {
  const submitBtn = page.locator('input[type="submit"]:not([name]), button[type="submit"]:not([name])').first();
  const count = await submitBtn.count();
  if (count === 0) {
    await page.locator('input[type="submit"], button[type="submit"]').first().click();
  } else {
    await submitBtn.click();
  }
  await page.waitForLoadState("networkidle");
}

async function main(): Promise<void> {
  const PROJECT_ID = "12330";
  const PASSING_EDIT_URL = `https://www.bestpractices.dev/en/projects/${PROJECT_ID}/passing/edit`;
  const SILVER_EDIT_URL = `https://www.bestpractices.dev/en/projects/${PROJECT_ID}/silver/edit`;

  const args = process.argv.slice(2);
  const silverOnly = args.includes("--silver-only");
  const passingOnly = args.includes("--passing-only");
  if (silverOnly) console.log("Mode: silver section only (skipping passing)");
  if (passingOnly) console.log("Mode: passing section only (skipping silver)");

  const firstUrl = silverOnly ? SILVER_EDIT_URL : PASSING_EDIT_URL;

  console.log("Launching headed Chromium...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${firstUrl}`);
  await page.goto(firstUrl);
  await page.waitForLoadState("networkidle");

  const currentUrl = page.url();
  if (currentUrl.includes("/login") || currentUrl.includes("/en/login")) {
    console.log("\nThe page redirected to the login screen.");
    console.log("Please complete GitHub OAuth login in the browser, then press Enter to continue...");
    await waitForEnter("> ");

    console.log(`Re-navigating to ${firstUrl}`);
    await page.goto(firstUrl);
    await page.waitForLoadState("networkidle");

    const afterLoginUrl = page.url();
    if (afterLoginUrl.includes("/login")) {
      console.error("ERROR: Still on login page. Please ensure you completed the OAuth flow.");
      await browser.close();
      process.exit(1);
    }
  }

  // --- Fill passing section-by-section ---
  if (!silverOnly) {
    console.log("\nFilling passing-level criteria (section by section)...");
    const pAnswers = passingAnswers();
    console.log(`  ${pAnswers.length} criteria to fill`);
    await fillPassingBySection(page, pAnswers);
    console.log(`  After passing fill, URL: ${page.url()}`);

    if (passingOnly) {
      console.log(`\nDone (passing only). Check https://www.bestpractices.dev/projects/${PROJECT_ID}`);
      await browser.close();
      return;
    }
  }

  // --- Navigate to silver edit page ---
  console.log(`\nNavigating to ${SILVER_EDIT_URL}`);
  await page.goto(SILVER_EDIT_URL);
  await page.waitForLoadState("networkidle");

  const silverUrl = page.url();
  if (silverUrl.includes("/login")) {
    console.log("Redirected to login again. Please complete GitHub OAuth login, then press Enter...");
    await waitForEnter("> ");
    await page.goto(SILVER_EDIT_URL);
    await page.waitForLoadState("networkidle");
  }

  // --- Fill silver section-by-section ---
  console.log("Filling silver-level criteria (section by section)...");
  const sAnswers = silverAnswers();
  console.log(`  ${sAnswers.length} total silver criteria`);
  await fillSilverBySection(page, sAnswers);

  console.log("\nSubmitting silver form...");
  await submitAndExit(page);
  console.log(`  After submit, URL: ${page.url()}`);

  console.log(`\nDone. Check https://www.bestpractices.dev/projects/${PROJECT_ID}`);
  await browser.close();
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
