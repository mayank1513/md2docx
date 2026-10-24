---
"@m2d/cli": major
---

- **BREAKING CHANGE**: Removed `shared` and `SharedOptions` from package exports.
- Exported programmatic file runner as `toDocxFile` with `ToDocxFileOptions` interface.
- Fix CLI binary execution when invoked via `pnpx`, `npx`, or binary shims.
- Add `--debug` and `--log-level` flags with detailed diagnostics using `@turboforge/cli-kit` structured logger.
- Add support for `--flag=value` parameter syntax.

