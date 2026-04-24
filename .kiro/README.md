# .kiro Directory

This directory contains Kiro-specific configuration and documentation for your e-commerce project.

## Directory Structure

```
.kiro/
├── settings/
│   └── mcp.json          # MCP server configuration
├── steering/             # (Optional) Steering files for custom instructions
├── skills/               # (Optional) Custom skills for Kiro
├── MCP_SETUP_GUIDE.md    # Complete MCP setup documentation
├── MCP_QUICK_START.md    # Quick 3-step MCP setup
└── README.md             # This file
```

## What's Inside

### settings/mcp.json
Configuration for Model Context Protocol (MCP) servers. Currently configured:
- **filesystem**: Advanced file operations
- **fetch**: Web content fetching
- **git**: Git operations and history

### MCP_SETUP_GUIDE.md
Complete guide for setting up and using MCP servers with detailed explanations.

### MCP_QUICK_START.md
Quick 3-step guide to get MCP servers running immediately.

## Optional Directories

### steering/ (Not yet created)
Create this folder to add custom instructions that Kiro will follow:
- Always included instructions (default)
- File-specific instructions (triggered when certain files are opened)
- Manual instructions (triggered with # in chat)

Example: `.kiro/steering/coding-standards.md`

### skills/ (Not yet created)
Create this folder to add reusable skills that Kiro can activate:
- Custom workflows
- Project-specific commands
- Specialized capabilities

Example: `.kiro/skills/deploy-to-netlify.md`

## Getting Started with MCP

1. Read: `MCP_QUICK_START.md`
2. Install `uv` package manager
3. Restart Kiro or reconnect MCP servers
4. Start using enhanced capabilities!

## Learn More

- Steering Files: Command Palette → "Kiro: Open Steering UI"
- Skills: Command Palette → "Kiro: Manage Skills"
- Hooks: Command Palette → "Kiro: Open Hook UI"
- MCP Servers: Check "MCP Server" view in Kiro Feature Panel
