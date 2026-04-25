# MCP Server Troubleshooting

## Current Issue: Package Not Found

The MCP servers from `@modelcontextprotocol` are Node.js packages, not Python packages. We need to use `npx` instead of `uvx`.

## Updated Configuration

I've updated `.kiro/settings/mcp.json` to use `npx` (Node Package Executor) which comes with Node.js.

### Current Working Configuration:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "D:\\TCG TECHNOLOGY CLIENTS\\cloth"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Why This Works

- **npx**: Comes with Node.js (you already have it installed)
- **-y**: Auto-confirms package installation
- **@modelcontextprotocol/server-filesystem**: Official MCP filesystem server (Node.js package)

## Next Steps

1. **Reconnect MCP Servers**:
   - Open Command Palette (Ctrl+Shift+P)
   - Type "MCP"
   - Select "MCP: Reconnect Servers"

2. **Check Status**:
   - Open Kiro Feature Panel
   - Look for "MCP Server" section
   - Should see: ✅ filesystem (connected)

3. **View Logs**:
   - Check the MCP Logs output panel for any errors
   - Should see successful connection messages

## Alternative: Disable MCP Servers

If you don't need MCP servers right now, you can disable them:

```json
{
  "mcpServers": {
    "filesystem": {
      "disabled": true
    }
  }
}
```

Or simply delete the `.kiro/settings/mcp.json` file.

## Common MCP Servers (Node.js based)

### Filesystem (Local file operations)
```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "D:\\TCG TECHNOLOGY CLIENTS\\cloth"]
}
```

### Memory (Persistent memory across sessions)
```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

### GitHub (GitHub API access)
```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
  }
}
```

### Brave Search (Web search)
```json
"brave-search": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "your-api-key"
  }
}
```

## Python-based MCP Servers (using uvx)

Some MCP servers are Python-based and use `uvx`. These are typically custom or third-party servers.

Example:
```json
"custom-python-server": {
  "command": "uvx",
  "args": ["package-name"]
}
```

## Error Messages Explained

### "No solution found when resolving tool dependencies"
- Package doesn't exist in Python package registry
- Solution: Use `npx` for Node.js packages or find correct package name

### "MCP error -32000: Connection closed"
- Server failed to start or crashed immediately
- Check package name and arguments

### "MCP error -32001: Request timed out"
- Server took too long to respond (>30 seconds)
- Package might be downloading dependencies
- Try reconnecting after a minute

### "Invalid version request"
- Wrong package name or version
- Verify package exists on npm or PyPI

## Testing Your Configuration

After reconnecting, ask Kiro:
- "List all files in the current directory using MCP"
- "Use the filesystem MCP server to read package.json"

If working, Kiro will use the MCP tools automatically.

## Still Having Issues?

1. Check Node.js is installed: `node --version`
2. Check npm is installed: `npm --version`
3. Try manually: `npx -y @modelcontextprotocol/server-filesystem --help`
4. Check MCP Logs output panel for detailed errors
5. Disable MCP servers if not needed for your current work
