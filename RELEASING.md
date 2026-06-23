# Releasing c-suite

Releases are cut by **pushing a version tag**. CI does the rest
([`.github/workflows/release.yml`](.github/workflows/release.yml)): it runs the full
gate, publishes to npm **with provenance**, and creates the GitHub Release.

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
# 1. bump the version + update the changelog
#    edit package.json "version" and CHANGELOG.md, then commit

# 2. tag and push — CI publishes to npm and creates the GitHub Release
git tag "v$(node -p "require('./package.json').version")"
git push origin main --tags

# 3. watch it
gh run watch
```

## First release (bootstrapping a brand-new package)

npm's Trusted Publishing UI needs the package to exist before you can configure it,
so the very first publish is a chicken-and-egg. Do one of:

- **One-time local publish** (then switch to Trusted Publishing for every release
  after): `npm login` once, then `npm publish --provenance --access public` from a
  clean checkout. Requires the npm CLI to be authenticated (`npm whoami`).
- **Token fallback (B)** for the first tag push, then optionally move to Trusted
  Publishing.

## Note on attribution

Commits and tags in this repo are authored as the `jakecastillo` GitHub identity
(`22990083+jakecastillo@users.noreply.github.com`). Verify with `git log -1 --format='%ae'`
before tagging a release.
