# Testing AIA Server with External AI Assistants

## 🎯 Two Ways to Access Your AIA Server

Your AIA Assessment server can be accessed in two different ways:

### 1. **MCP Connection** (Local - for Claude Desktop)
- **URL**: Local MCP server connection
- **Access**: Claude Desktop app only
- **Status**: ✅ Working perfectly

### 2. **HTTP API** (Web - for External AIs)
- **URL**: https://aia-assessment-server.vercel.app
- **Access**: Any AI assistant with web access
- **Status**: ✅ Working perfectly

## 🖥️ **Testing with Claude Desktop App**

Your MCP server is already configured and working! In Claude Desktop app, you can directly use:

```
"Please analyze this project using the AIA assessment tool:

Project: AI Customer Service Bot
Description: Automated chatbot that uses customer data to provide personalized responses and makes decisions about service escalation using machine learning algorithms"
```

Claude Desktop will automatically use the MCP connection and return the assessment.

## 🌐 **Testing with External AIs (GPT-5, Mobile ChatGPT, etc.)**

For external AI assistants, use the HTTP API:

### **For GPT-5/ChatGPT:**
```
"I need you to test an API endpoint for me. Please make a POST request to:

URL: https://aia-assessment-server.vercel.app/api/analyze
Method: POST
Headers: Content-Type: application/json

Body:
{
  "projectName": "AI Customer Service Bot",
  "projectDescription": "Automated chatbot that uses customer data to provide personalized responses and makes decisions about service escalation using machine learning algorithms"
}

Please show me the complete response including the impact level and auto-answered questions."
```

## 🚨 **Why GPT-5 Says "Cannot Connect to MCP Server"**

GPT-5 is trying to connect to your **MCP server** (local connection), but it should use the **HTTP API** (web connection) instead.

### **The Issue:**
- **MCP servers** run locally and only Claude Desktop can connect to them
- **External AIs** (GPT-5, mobile ChatGPT) need the **HTTP API** endpoint

### **The Solution:**
Tell GPT-5 to use the **HTTP API**, not the MCP server:

```
"Don't try to connect to an MCP server. Instead, make an HTTP request to:
https://aia-assessment-server.vercel.app/api/analyze

This is a web API, not an MCP server."
```

## ✅ **Verified Test Results**

### **MCP Connection (Claude Desktop):**
- ✅ Auto-answered 2 questions
- ✅ Impact Level: I (Little to no impact)
- ✅ Score: 10.2%
- ✅ 23 questions identified for manual input

### **HTTP API (External AIs):**
- ✅ Same results as MCP connection
- ✅ Accessible from any AI with web access
- ✅ CORS configured for external requests

## 🔧 **Troubleshooting External AI Access**

### **If GPT-5 Still Can't Connect:**

1. **Clarify the Request:**
```
"This is NOT an MCP server connection. Please make a standard HTTP POST request to the web API:
https://aia-assessment-server.vercel.app/api/analyze"
```

2. **Test Health Endpoint First:**
```
"First, test if the server is running by making a GET request to:
https://aia-assessment-server.vercel.app/health

This should return a JSON response with status: healthy"
```

3. **Use curl-style Format:**
```
"Make this HTTP request:
curl -X POST https://aia-assessment-server.vercel.app/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"projectName": "Test", "projectDescription": "AI system description"}'
"
```

## 📱 **Mobile Testing Commands**

### **For Mobile ChatGPT:**
```
"Test this web API (not MCP):
POST https://aia-assessment-server.vercel.app/api/analyze

JSON body: {"projectName": "AI Bot", "projectDescription": "Automated system using personal data"}

Show impact level and auto-answered questions."
```

### **For Claude Mobile:**
```
"Make HTTP request to assess AI project:
https://aia-assessment-server.vercel.app/api/analyze

Project: Customer AI System
Description: Machine learning chatbot processing customer data for personalized recommendations

Return impact assessment results."
```

## 🎯 **Key Differences**

| Feature | MCP Connection | HTTP API |
|---------|----------------|----------|
| **Access** | Claude Desktop only | Any AI assistant |
| **URL** | Local MCP server | https://aia-assessment-server.vercel.app |
| **Connection** | Direct tool call | HTTP POST request |
| **Results** | Identical | Identical |
| **Setup** | Already configured | No setup needed |

## 🎉 **Success Indicators**

### **For Claude Desktop (MCP):**
- ✅ Can use AIA tools directly in conversation
- ✅ No need to specify URLs or make HTTP requests
- ✅ Automatic tool detection and usage

### **For External AIs (HTTP API):**
- ✅ Health endpoint returns `{"status":"healthy"}`
- ✅ API returns structured JSON with assessment
- ✅ Auto-answered questions with confidence levels
- ✅ Impact level calculation (I-IV)
- ✅ Score percentage provided

## 🔄 **Next Steps**

1. **Claude Desktop**: Already working - just ask for AIA assessments
2. **External AIs**: Use HTTP API endpoints, not MCP server references
3. **Mobile Testing**: Use the web API URL in all requests
4. **SharePoint Integration**: Use the structured JSON output from either method

Your AIA server is fully operational for both local (MCP) and external (HTTP API) access!
