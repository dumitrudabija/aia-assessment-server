# AIA Assessment Server Deployment Guide

## Prerequisites

### System Requirements
- Node.js 18+ 
- npm 8+
- TypeScript 4.5+
- MCP-compatible client (Cline/Claude Dev)

### Dependencies
- `@modelcontextprotocol/sdk`: MCP server framework
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

## Installation Steps

### 1. Project Setup
```bash
# Navigate to MCP servers directory
cd /Users/dumitru.dabija/Documents/Cline/MCP

# Create project directory
mkdir aia-assessment-server
cd aia-assessment-server

# Initialize npm project
npm init -y
```

### 2. Install Dependencies
```bash
npm install @modelcontextprotocol/sdk typescript @types/node
```

### 3. Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
```

### 4. Update Package.json
```json
{
  "type": "module",
  "scripts": {
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "start": "node build/index.js",
    "dev": "tsc && node build/index.js"
  }
}
```

### 5. Build the Server
```bash
npm run build
```

## MCP Configuration

### Cline/Claude Dev Configuration
Add to MCP settings file:
`/Users/dumitru.dabija/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "aia-assessment": {
      "command": "node",
      "args": ["/Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Claude Desktop Configuration (Alternative)
Add to: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aia-assessment": {
      "command": "node",
      "args": ["/path/to/aia-assessment-server/build/index.js"]
    }
  }
}
```

## Verification

### 1. Test Server Startup
```bash
cd /Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server
npm run start
```
Should output: "AIA Assessment MCP server running on stdio"

### 2. Test MCP Integration
After configuration, the server should appear in the "Connected MCP Servers" section with available tools:
- `assess_project`
- `get_questions`

### 3. Test Assessment
Use the MCP tool to test basic functionality:
```json
{
  "projectName": "Test Project",
  "projectDescription": "Test description"
}
```

## Troubleshooting

### Common Issues

#### Server Not Connecting
- Verify build path in MCP settings matches actual build location
- Check that `build/index.js` exists and is executable
- Ensure Node.js version compatibility

#### Build Errors
- Verify TypeScript configuration
- Check all dependencies are installed
- Ensure source files are in `src/` directory

#### Permission Issues
- Verify file permissions on build output
- Check that the build script sets executable permissions

### Debug Mode
For debugging, run the server directly:
```bash
node build/index.js
```

## Maintenance

### Regular Updates
1. Update dependencies periodically
2. Rebuild after any source changes
3. Test functionality after updates

### Monitoring
- Check MCP client logs for connection issues
- Monitor server startup messages
- Verify tool responses are properly formatted

### Backup
Maintain backups of:
- Source code (`src/` directory)
- Configuration files
- Documentation
- MCP settings configuration

## Security Notes
- Server runs locally only
- No external network access required
- No persistent data storage
- Input validation implemented for all tools
