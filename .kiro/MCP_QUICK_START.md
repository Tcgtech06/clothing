P# MCP Quick Start - 2 Steps (Updated)

## ✅ Prerequisites Already Met

You already have Node.js and npm installed (required for your Next.js project), so you're ready to go!

## Step 1: Reconnect MCP Servers

The configuration has been updated to use `npx` (comes with Node.js).

**Open Command Palette** (Ctrl+Shift+P) → Type "MCP" → Select **"MCP: Reconnect Servers"**

## Step 2: Verify Connection

1. Open Kiro Feature Panel (sidebar)
2. Look for "MCP Server" section
3. You should see:
   - ✅ filesystem (connected)

## That's It! 🎉

Your MCP filesystem server is now active.

## Quick Test

Ask Kiro:
- "Use MCP to list all TypeScript files"
- "Read the package.json file using the filesystem MCP server"

## Configuration File

Location: `.kiro/settings/mcp.json`

Current configuration:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "D:\\TCG TECHNOLOGY CLIENTS\\cloth"],
      "disabled": false
    }
  }
}
```

## What Changed?

- **Before**: Used `uvx` (Python) - packages didn't exist
- **Now**: Uses `npx` (Node.js) - official MCP packages work correctly

## Need Help?

- **Troubleshooting**: Read `.kiro/MCP_TROUBLESHOOTING.md`
- **Full Guide**: Read `.kiro/MCP_SETUP_GUIDE.md`
- **Check Logs**: View "MCP Logs" output panel in Kiro

## Optional: Add More Servers

Edit `.kiro/settings/mcp.json` to add:

### Memory Server (persistent context)
```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"],
  "disabled": false
}
```

### GitHub Server (requires token)
```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
  },
  "disabled": false
}
```

After adding, reconnect servers using Command Palette.
