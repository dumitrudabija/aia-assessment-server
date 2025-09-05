# AIA Assessment Server Maintenance Guide

## Overview
This document provides guidance for maintaining, updating, and troubleshooting the Canada Algorithmic Impact Assessment MCP server.

## Regular Maintenance Tasks

### Weekly Tasks
- [ ] Verify server connectivity in MCP client
- [ ] Test basic assessment functionality
- [ ] Check for any error logs or issues
- [ ] Monitor server startup time and performance

### Monthly Tasks
- [ ] Review and update dependencies
- [ ] Run full test suite with sample assessments
- [ ] Check TypeScript compilation for warnings
- [ ] Review documentation for accuracy
- [ ] Backup configuration files

### Quarterly Tasks
- [ ] Update to latest MCP SDK version
- [ ] Review Canada AIA framework for changes
- [ ] Update question set if regulations change
- [ ] Performance optimization review
- [ ] Security audit of dependencies

## Dependency Management

### Current Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.17.5",
  "typescript": "^5.9.2",
  "@types/node": "^24.3.1"
}
```

### Update Process
1. **Check for updates:**
   ```bash
   cd /Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server
   npm outdated
   ```

2. **Update dependencies:**
   ```bash
   npm update
   ```

3. **Test after updates:**
   ```bash
   npm run build
   npm run start
   ```

4. **Verify MCP integration:**
   - Check server appears in Connected MCP Servers
   - Test assess_project tool
   - Test get_questions tool
   - Verify resource access

### Breaking Changes
Monitor these dependencies for breaking changes:
- **@modelcontextprotocol/sdk**: MCP protocol changes
- **typescript**: Language feature changes
- **@types/node**: Node.js API changes

## Code Maintenance

### Adding New Questions
1. **Locate question array** in `src/index.ts`
2. **Add new question object:**
   ```typescript
   {
     id: 'category_###',
     category: 'CategoryName',
     subcategory: 'Subcategory',
     question: 'Question text?',
     type: 'risk' | 'mitigation',
     maxScore: number,
     options: [
       { text: 'Option 1', score: 0 },
       { text: 'Option 2', score: 1 }
     ]
   }
   ```
3. **Rebuild and test:**
   ```bash
   npm run build
   ```

### Modifying Scoring Algorithm
1. **Locate `calculateAssessment` method**
2. **Update scoring logic** while maintaining Canada AIA compliance
3. **Test with known assessment scenarios**
4. **Update documentation** if scoring changes

### Error Handling Updates
1. **Add new error types** to appropriate handlers
2. **Use proper MCP error codes:**
   - `ErrorCode.InvalidParams`: Invalid input
   - `ErrorCode.InvalidRequest`: Invalid resource URI
   - `ErrorCode.MethodNotFound`: Unknown tool
   - `ErrorCode.InternalError`: Server errors

## Troubleshooting

### Common Issues

#### Server Not Starting
**Symptoms:** MCP client shows server as disconnected

**Diagnosis:**
```bash
cd /Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server
node build/index.js
```

**Solutions:**
- Verify build directory exists and contains index.js
- Check file permissions (should be executable)
- Verify Node.js version compatibility
- Check for TypeScript compilation errors

#### Build Failures
**Symptoms:** `npm run build` fails

**Diagnosis:**
- Check TypeScript errors in output
- Verify all imports are correct
- Check for syntax errors

**Solutions:**
- Fix TypeScript errors
- Update type definitions if needed
- Verify all dependencies are installed

#### Tool Execution Errors
**Symptoms:** MCP tools return errors

**Diagnosis:**
- Check tool parameter validation
- Verify question IDs exist
- Check option indices are valid

**Solutions:**
- Update input validation
- Fix question ID references
- Ensure proper error handling

### Debug Mode
Enable detailed logging by modifying the server:

```typescript
// Add to constructor
console.error('AIA Server: Initializing...');

// Add to tool handlers
console.error('AIA Server: Tool called:', request.params.name);
console.error('AIA Server: Arguments:', request.params.arguments);
```

### Performance Monitoring
Monitor these metrics:
- Server startup time
- Tool response time
- Memory usage
- Question loading time

## Configuration Management

### MCP Settings Backup
Regularly backup MCP configuration:
```bash
cp "/Users/dumitru.dabija/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json" \
   "/Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server/config-backup-$(date +%Y%m%d).json"
```

### Environment Variables
Currently no environment variables required, but future versions may need:
- Database connection strings
- API keys for external services
- Configuration flags

## Version Management

### Release Process
1. **Update version** in package.json
2. **Update CHANGELOG.md** with changes
3. **Test thoroughly** with sample assessments
4. **Build and verify** functionality
5. **Tag release** if using version control
6. **Update documentation** if needed

### Rollback Process
If issues occur after update:
1. **Restore previous build** from backup
2. **Revert MCP configuration** if changed
3. **Restart MCP client** to reload server
4. **Verify functionality** with test assessment

## Security Maintenance

### Regular Security Tasks
- [ ] Review dependencies for vulnerabilities
- [ ] Check for security updates
- [ ] Audit input validation
- [ ] Review error messages for information leakage

### Security Scanning
```bash
# Check for known vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix
```

## Documentation Updates

### When to Update Documentation
- New features added
- API changes
- Configuration changes
- New dependencies
- Bug fixes that affect usage

### Documentation Files to Maintain
- README.md: User-facing changes
- API_REFERENCE.md: API modifications
- ARCHITECTURE.md: Technical changes
- DEPLOYMENT.md: Installation updates
- CHANGELOG.md: All changes

## Backup Strategy

### What to Backup
- Source code (`src/` directory)
- Configuration files
- Documentation
- Build artifacts (for rollback)
- MCP settings configuration

### Backup Schedule
- **Daily**: Automatic source code backup
- **Weekly**: Configuration and documentation
- **Before updates**: Complete system backup
- **Before major changes**: Full backup with versioning

## Support and Escalation

### Internal Support
1. Check this maintenance guide
2. Review error logs and diagnostics
3. Test with minimal configuration
4. Check recent changes in CHANGELOG.md

### External Resources
- MCP SDK documentation
- Canada AIA official documentation
- TypeScript documentation
- Node.js documentation

### Escalation Path
1. Document the issue thoroughly
2. Include error messages and logs
3. Note recent changes or updates
4. Provide steps to reproduce
5. Include system configuration details
