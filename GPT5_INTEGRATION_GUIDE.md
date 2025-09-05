# GPT-5 Integration Guide for AIA Assessment Server

## Quick Start for External Chatbots

Your AIA Assessment server is now ready for external chatbot integration! Here's exactly what to tell GPT-5 or any other chatbot.

## Server Status ✅

- **Local Server**: Running at `http://localhost:3000` 
- **API Endpoints**: Fully functional with Vercel serverless functions
- **Test Results**: Successfully analyzed "AI Loan System" project
- **Auto-completion**: 16% of questions answered automatically
- **Assessment**: Impact Level I (18.37% score)

## What to Tell GPT-5

### Option 1: Direct API Instructions

```
I have an AIA (Algorithmic Impact Assessment) server running that can analyze AI projects for Canada's regulatory compliance. Here's how to use it:

API Endpoint: http://localhost:3000/api/analyze
Method: POST
Content-Type: application/json

Request format:
{
  "projectName": "Your Project Name",
  "projectDescription": "Detailed description of your AI system including automation level, data usage, decision-making process, and any bias testing"
}

The API will return:
- Auto-answered questions with confidence levels
- Questions requiring manual input
- Partial assessment with impact level (I-IV)
- Score percentage and completion status

Please analyze any AI project I describe using this API and provide a summary of the assessment results, focusing on the impact level and whether a full audit is required.
```

### Option 2: Function Calling (Advanced)

If GPT-5 supports function calling, provide this schema:

```json
{
  "name": "analyze_aia_project",
  "description": "Analyze an AI project using Canada's Algorithmic Impact Assessment framework",
  "parameters": {
    "type": "object",
    "properties": {
      "projectName": {
        "type": "string",
        "description": "Name of the AI project"
      },
      "projectDescription": {
        "type": "string", 
        "description": "Detailed description including automation level, data usage, decision-making process, bias testing, etc."
      }
    },
    "required": ["projectName", "projectDescription"]
  }
}
```

## Example Conversation with GPT-5

**You:** "Analyze this AI project: A fully automated loan approval system that uses personal financial data, credit history, and demographic information to make lending decisions. The system will replace human underwriters and uses machine learning algorithms that adapt over time."

**GPT-5 Response:** 
```javascript
// GPT-5 would make this API call:
fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectName: "Automated Loan Approval System",
    projectDescription: "A fully automated loan approval system that uses personal financial data, credit history, and demographic information to make lending decisions. The system will replace human underwriters and uses machine learning algorithms that adapt over time."
  })
})
```

**Expected Analysis Results:**
- **Impact Level**: Likely II-III (Moderate to High impact)
- **Auto-answered**: ~4-6 questions about automation, personal data usage, ML algorithms
- **Manual input needed**: ~20 questions about governance, fairness testing, recourse processes
- **Recommendation**: Full AIA audit required for Impact Levels III-IV

## SharePoint Integration

Once you have the assessment results, you can feed them into SharePoint:

```javascript
// Example SharePoint update
const assessmentData = {
  ProjectName: "Automated Loan Approval System",
  ImpactLevel: "III", 
  ScorePercentage: 65.2,
  RequiresFullAudit: true,
