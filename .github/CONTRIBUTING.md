# Contributing to Clouatre Labs

Thank you for considering contributing to our projects!

## How to Contribute

1. **Check existing issues** - See if someone is already working on it
2. **Open an issue first** - Discuss your idea before starting work
3. **Fork and create a branch** - Use a descriptive name like `feat/foo`
4. **Follow the code style** - Match the existing patterns in the project
5. **Write tests** - Ensure your changes are covered by tests
6. **Keep PRs focused** - One logical change per PR (aim for 100-300 lines)
7. **Document your changes** - Update README/docs if needed

## Commit Signing and Merge Strategy

All repositories in this organization enforce signed commits via
org-level rulesets. See [ORG-STANDARDS.md](ORG-STANDARDS.md) for the
enforcement model.

### For Human Contributors

All commits must be GPG or SSH signed and include a DCO sign-off:

```bash
git commit -S --signoff -m "feat(scope): description"
```

**Setup:**

1. [Generate a GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)
   (or SSH signing key)
2. [Add it to GitHub](https://github.com/settings/keys)
3. Configure Git:

   ```bash
   git config --global commit.gpgsign true
   git config --global tag.gpgsign true
   ```

### For AI Agents (Copilot, Renovate)

AI agents and bots cannot sign commits. Their PRs are squash-merged by
a maintainer, producing a single signed merge commit that satisfies the
`required_signatures` ruleset. This is by design:

- **Copilot coding agent** is configured as a bypass actor for `required_signatures`
- **Renovate** PRs are merged by an admin who has bypass privileges
- The **DCO App** separately enforces sign-off on all commits

### Merge Methods

All three merge methods are available (merge, squash, rebase).
Maintainers choose per PR:

- **Squash merge** - default for most PRs; produces a clean single commit
- **Merge commit** - for PRs where individual commit history matters
- **Rebase merge** - for linear history without a merge commit

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to learn
and build together.

## Questions?

Open an issue or discussion in the relevant project repository.
