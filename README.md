# Auto NPM Versioner

A simple workflow to automatically version your NPM package.

Heavily inspired by [technote-space/package-version-check-action](https://github.com/technote-space/package-version-check-action)

Basic usage:
```yaml
- name: Check package version
  uses: majortom327/auto-version@v0.0.3
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

It should update your package json version on each push by a patch version.
It should set the version by the tag if you push a tag.

This is a PoC for my own use, so it's not very customizable for now.
