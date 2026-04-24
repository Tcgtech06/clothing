# MCP Quick Start - 3 Steps

## Step 1: Install uv (Python Package Manager)

Choose one method:

```bash
# Option A: Using pip
pip install uv

# Option B: Using official installer
# Visit: https://docs.astral.sh/uv/getting-started/installation/
```

Verify:
```bash
uvx --version
```

## Step 2: Restart Kiro or Reconnect MCP Servers

- **Option A**: Restart Kiro completely
- **Option B**: Open Command Palette (Ctrl+Shift+P) → Type "MCP" → Select "MCP: Reconnect Servers"

## Step 3: Verify Connection

1. Open Kiro Feature Panel (sidebar)
2. Look for "MCP Server" section
3. You should see 3 servers:
   - ✅ filesystem (connected)
   - ✅ fetch (connected)
   - ✅ git (connected)

## That's It! 🎉

Your MCP servers are now active. Kiro will automatically use them when needed.

## Quick Test

Ask Kiro:
- "Show me the git commit history using MCP"
- "Use MCP to fetch data from https://api.github.com"
- "List all TypeScript files using the filesystem MCP server"

## Configuration File

Location: `.kiro/settings/mcp.json`

Edit this file to:
- Add more servers
- Disable servers
- Configure auto-approve tools

## Need Help?

- Read full guide: `.kiro/MCP_SETUP_GUIDE.md`
- Command Palette → "Help: MCP Documentation"
- Check MCP Server view for error messages
