# MCP Server Status

## Current Configuration

**File**: `.kiro/settings/mcp.json`

### Active Servers:
1. **filesystem** - Local file operations
   - Command: `npx`
   - Package: `@modelcontextprotocol/server-filesystem`
   - Path: `D:\TCG TECHNOLOGY CLIENTS\cloth`
   - Status: Check MCP Server view in Kiro

## How to Reconnect

**Method 1: Command Palette**
1. Press `Ctrl+Shift+P`
2. Type "MCP"
3. Select "MCP: Reconnect Servers"

**Method 2: MCP Server View**
1. Open Kiro Feature Panel (sidebar)
2. Find "MCP Server" section
3. Click reconnect button

## How to Check Status

### View in Kiro:
- Open Kiro Feature Panel
- Look for "MCP Server" section
- Green checkmark = Connected
- Red X = Error

### View Logs:
- Open Output panel (View → Output)
- Select "Kiro - MCP Logs" from dropdown
- Look for connection messages

## Expected Log Messages (Success)

```
[info] [filesystem] Registering MCP server and starting connection
[info] [filesystem] MCP connection established successfully
```

## Error Messages to Watch For

### If you see: "Package not found"
- Wrong package name
- Check `.kiro/settings/mcp.json` uses correct package

### If you see: "Connection closed" or "Timeout"
- Server failed to start
- Check Node.js is installed: `node --version`
- Try manual test: `npx -y @modelcontextprotocol/server-filesystem --help`

### If you see: "Command not found: npx"
- Node.js not installed or not in PATH
- Reinstall Node.js or add to PATH

## Quick Health Check

Run these commands in terminal:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Test MCP package manually
npx -y @modelcontextprotocol/server-filesystem --help
```

All should work without errors.

## Disable MCP (If Not Needed)

Edit `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "disabled": true
    }
  }
}
```

Or delete the file entirely.

## Last Updated

Configuration updated: 2026-04-24
- Changed from `uvx` (Python) to `npx` (Node.js)
- Using official `@modelcontextprotocol` packages
- Simplified to single filesystem server for stability
