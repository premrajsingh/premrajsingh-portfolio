
# Security

- Never hardcode tokens, passwords, API keys, or private URLs in source, rules, skills, or docs.
- Never commit `.env` or real credentials; use `.env.example` with empty placeholders only.
- Configure MCP secrets only in Cursor MCP settings / local env — not in git.
- Do not invent credentials or MCP endpoints.
- Prefer least privilege (filesystem MCP scoped to this repo).
- Do not exfiltrate secrets into chat logs or documentation.
- Paid GSAP plugins only with confirmed user licensing.
