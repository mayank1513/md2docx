# Agent Rules & Guidelines
Welcome to **Md2Docx**. This document defines the engineering standards, monorepo architecture, operational workflows, and agent alignment rules for template users and AI coding assistants.

## ⚠️ Critical Behavioral Rules

1. **PROPOSE AND CONFIRM BEFORE IMPLEMENTING**:
   - Always propose your design or architecture idea first and get explicit confirmation before implementing.
   - Never overengineer, assume, or add unconfirmed features/syntaxes out of scope.
   - If in doubt about requirements, design, or scope, ask first.
2. **Git Operations Policy**:
   - All Git operations that make any changes (`git add`, `git commit`, `git push`, `git reset`, `git checkout`, `git restore`, `git stash`, etc.) are **risky operations**. Never execute them without explicit confirmation from the user.
   - Read-only Git inspection commands (`git status`, `git log`, `git diff`) are safe.

---

# Commit Message Rules
## Context

- Generate commit based on `git diff --cached`
- Check the `git log` if needed to get the context of the changes.
- If no files are staged, inform the user and ask them to stage files.
- Ignore package lock files such as pnpm-lock.yaml, package-lock.json etc.

## Format

Your response must be in the following format:

```
<type>(<scope>): <title>

[optional body]

[optional footer]
```

### Guidelines

- **Title**: Imperative mood (e.g., "add" not "added"), under 72 chars.
- **Body**: Detailed explanation if needed, wrapped at 72 chars.
- **Footer**: For breaking changes or closing issues.
- **Ignore**: Do not read package lock files such as yarn.lock, pnpm-lock.yaml, package-lock.json etc.
