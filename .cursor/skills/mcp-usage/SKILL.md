---
name: mcp-usage
description: Safely decide when and how to use MCP servers for docs, browser QA, and Figma. Use when configuring MCP, choosing between MCP and local tools, or protecting secrets in integrations.
---

# MCP usage

## When to use

Configuring or using MCP for documentation, browser testing, Figma, or other integrations.

## Inspect first

- User MCP (`~/.cursor/mcp.json`) and any project MCP files
- Session-available MCP namespaces
- Whether credentials are already configured securely

## Approach

1. Prefer verified, already-available servers.
2. Merge config; never overwrite existing servers blindly.
3. Keep secrets in Cursor MCP settings or env — never in git.
4. If MCP is down, fall back to local CLI/docs and report the gap.

## Avoid

- Inventing server names or copying unverified JSON
- Committing tokens or private URLs
- Blocking setup because one MCP is unavailable

## Verify

- Existing servers still listed; no secrets in the repo; gaps documented in `docs/development-tools.md`
