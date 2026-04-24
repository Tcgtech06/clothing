# MCP Server Setup Guide for E-Commerce Project

## What is MCP?

MCP (Model Context Protocol) allows Kiro to access additional tools and capabilities through specialized servers. These servers provide enhanced functionality like advanced file operations, web fetching, git operations, and more.

## Current Configuration

Your project now has 3 MCP servers configured in `.kiro/settings/mcp.json`:

### 1. **Filesystem Server**
- **Purpose**: Advanced file system operations
- **Capabilities**: Read/write files, search, directory operations
- **Status**: Enabled

### 2. **Fetch Server**
- **Purpose**: Web content fetching and HTTP requests
- **Capabilities**: Fetch URLs, make API calls, download content
- **Status**: Enabled

### 3. **Git Server**
- **Purpose**: Advanced Git operations
- **Capabilities**: Git history, diffs, branch management, commits
- **Status**: Enabled

## Prerequisites

Before MCP servers can work, you need to install **uv** (Python package manager):

### Installation Options:

#### Option 1: Using pip (if you have Python)
```bash
pip install uv
```

#### Option 2: Using Homebrew (if available)
```bash
brew install uv
```

#### Option 3: Official installer
Visit: https://docs.astral.sh/uv/getting-started/installation/

### Verify Installation
```bash
uv --version
uvx --version
```

## How to Use MCP Servers

### 1. **Restart Kiro** (if needed)
- MCP servers connect automatically when Kiro starts
- Or use Command Palette: "MCP: Reconnect Servers"

### 2. **View MCP Status**
- Open Kiro Feature Panel
- Look for "MCP Server" view
- You'll see all configured servers and their status

### 3. **Auto-Approve Tools** (Optional)
If you want certain MCP tools to run without asking permission, add them to `autoApprove`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-server-filesystem", "D:\\TCG TECHNOLOGY CLIENTS\\cloth"],
      "autoApprove": ["read_file", "list_directory"]
    }
  }
}
```

### 4. **Disable a Server** (Optional)
Set `"disabled": true` to temporarily disable a server:

```json
{
  "mcpServers": {
    "fetch": {
      "disabled": true
    }
  }
}
```

## Additional MCP Servers You Can Add

### For Firebase/Firestore Projects:
```json
"firebase": {
  "command": "uvx",
  "args": ["mcp-server-firebase"],
  "env": {
    "FIREBASE_PROJECT_ID": "your-project-id"
  },
  "disabled": false
}
```

### For Database Operations:
```json
"sqlite": {
  "command": "uvx",
  "args": ["mcp-server-sqlite", "--db-path", "./database.db"],
  "disabled": false
}
```

### For AWS Documentation:
```json
"aws-docs": {
  "command": "uvx",
  "args": ["awslabs.aws-documentation-mcp-server@latest"],
  "disabled": false
}
```

## Troubleshooting

### MCP Servers Not Connecting?

1. **Check uv installation**:
   ```bash
   uvx --version
   ```

2. **Check MCP Server View** in Kiro Feature Panel for error messages

3. **Reconnect servers**: Command Palette → "MCP: Reconnect Servers"

4. **Check logs**: Look for MCP-related errors in Kiro's output panel

### Server-Specific Issues

- **Filesystem**: Ensure the path exists and you have permissions
- **Git**: Ensure the repository path is correct
- **Fetch**: Check internet connection

## Configuration File Location

- **Workspace-level**: `.kiro/settings/mcp.json` (current)
- **User-level**: `~/.kiro/settings/mcp.json` (global, applies to all projects)

Workspace configuration overrides user-level configuration.

## Next Steps

1. ✅ MCP configuration created
2. ⏳ Install `uv` package manager (see Prerequisites above)
3. ⏳ Restart Kiro or reconnect MCP servers
4. ⏳ Verify servers are connected in MCP Server view
5. ⏳ Start using enhanced capabilities!

## Testing MCP Servers

Once connected, you can ask Kiro to:
- "Use the git MCP server to show me the commit history"
- "Use the fetch MCP server to get data from this API"
- "Use the filesystem MCP server to search for all TypeScript files"

Kiro will automatically use the appropriate MCP tools when needed.

## Learn More

- MCP Documentation: https://modelcontextprotocol.io/
- Available MCP Servers: https://github.com/modelcontextprotocol/servers
- Kiro MCP Guide: Use Command Palette → "Help: MCP Documentation"
