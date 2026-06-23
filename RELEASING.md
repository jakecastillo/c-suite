# Releasing c-suite

Releases are **GitHub Releases**. Creating one creates the version tag, which triggers
CI ([`.github/workflows/release.yml`](.github/workflows/release.yml)) to run the full
gate and **publish to npm with provenance**. The npm publish is idempotent — if the
version is already on npm (e.g. a manual first publish, or a re-run), CI skips it.

## One-time setup: npm auth for CI

Pick one.

### A. Trusted Publishing — recommended, no secrets

1. Make sure the `c-suite` package exists on npm (see *First release* below).
2. On npmjs.com → the `c-suite` package → **Settings → Publishing access** → add a
   **GitHub Actions** trusted publisher:
   - Repository: `jakecastillo/c-suite`
   - Workflow: `release.yml`
3. Done. `npm publish --provenance` in CI authenticates via OIDC — no token to rotate.

### B. Token fallback

1. Create a **Granular Access Token** on npm with publish rights to `c-suite`.
2. Add it as the `NPM_TOKEN` repo secret: **Settings → Secrets and variables → Actions**.
3. Uncomment the `NODE_AUTH_TOKEN` env block in `release.yml`.

## Cutting a release

```bash
# 1. bump the version + update the changelog, then commit & push
#    edit package.json "version" and CHANGELOG.md

# 2. create the GitHub Release — this creates the tag, which triggers CI to
#    publish to npm with provenance
gh release create "v$(node -p "require('./package.json').version")" --generate-notes

# 3. watch CI publish to npm
gh run watch
```

## First release (bootstrapping a brand-new package)

npm's Trusted Publishing UI needs the package to exist before you can configure it, so
the very first publish is a chicken-and-egg. Do one of:

- **One-time local publish**, then switch to Trusted Publishing for every release after:
  ```bash
  npm whoami                       # confirm you're logged in (npm login if not)
  npm publish --access public      # provenance needs CI; this first one won't have it
  ```
  Then create the GitHub Release (`gh release create v0.1.0 --generate-notes`); CI sees
  the version already on npm and skips the publish.
- **Token fallback (B)** for the first tag push, then optionally move to Trusted Publishing.

## Note on attribution

Commits and tags in this repo are authored as the `jakecastillo` GitHub identity
(`22990083+jakecastillo@users.noreply.github.com`). Before tagging, verify both:
`gh api user --jq .login` is `jakecastillo` and `git log -1 --format='%ae'` matches.
