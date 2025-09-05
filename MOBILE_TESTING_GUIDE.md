# Mobile ChatGPT Testing Guide

## 🎯 How to Test AIA Server from Mobile ChatGPT

Your AIA Assessment server needs to be publicly accessible for mobile ChatGPT to reach it. Here are several options:

## 🌐 Option 1: Vercel Deployment (Recommended)

### Step 1: Get Your Vercel URL
Your project is already configured for Vercel. The typical URL format is:
```
https://aia-assessment-server-[username].vercel.app
```

### Step 2: Test the API Endpoint
From mobile ChatGPT, ask it to make this request:
```
POST https://your-vercel-url.vercel.app/api/analyze
Content-Type: application/json

{
  "projectName": "Test AI System",
  "projectDescription": "Automated decision-making system using personal data for loan approvals with machine learning algorithms"
}
```

## 🔧 Option 2: Using ngrok (Temporary Public URL)

If you want to test with your local server:

### Install ngrok locally (not globally):
```bash
cd /Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server
npx ngrok http 3000
```

This creates a temporary public URL like: `https://abc123.ngrok.io`

### Test from Mobile ChatGPT:
```
POST https://abc123.ngrok.io/api/analyze
Content-Type: application/json

{
  "projectName": "Mobile Test",
  "projectDescription": "AI system for automated processing"
}
```

## 📱 Option 3: Alternative Cloud Platforms

### Railway Deployment:
1. Connect your GitHub repo to Railway
2. Deploy automatically
3. Get URL: `https://your-app.railway.app`

### Heroku Deployment:
```bash
heroku create your-aia-server
git push heroku main
```
URL: `https://your-aia-server.herokuapp.com`

## 🧪 Testing Instructions for Mobile ChatGPT

### What to Tell ChatGPT:

```
"I need you to test an API endpoint for me. Please make a POST request to:

URL: [YOUR_PUBLIC_URL]/api/analyze
Method: POST
Headers: Content-Type: application/json
Body: {
  "projectName": "AI Loan System",
  "projectDescription": "Fully automated machine learning system that uses personal information to make lending decisions. The system includes bias testing and fairness assessments."
}

Please show me the full response including the impact level and score."
```

### Expected Response Format:
```json
{
  "projectName": "AI Loan System",
  "autoAnswered": [
    {
      "questionId": "aboutAlgorithm8",
      "question": "Will the algorithm continue to learn and evolve as it is used?",
      "selectedOption": 1,
      "selectedText": "Yes",
      "confidence": "medium"
    }
  ],
  "partialAssessment": {
    "impactLevel": "I",
    "scorePercentage": 18.37,
    "completionPercentage": 16
  }
}
```

## 🔍 Health Check Test

First, test if your server is reachable:

### Simple Health Check:
```
GET [YOUR_PUBLIC_URL]/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-05T16:32:00.000Z",
  "service": "AIA Assessment Server"
}
```

## 🚨 Troubleshooting

### If Mobile ChatGPT Can't Reach Your Server:

1. **Check CORS Settings**: Ensure your server allows external requests
2. **Verify URL**: Make sure the public URL is correct and accessible
3. **Test with Browser**: Try accessing the URL from your phone's browser first
4. **Check Firewall**: Ensure no firewall is blocking the requests

### Common Issues:

- **404 Error**: API endpoint path is incorrect
- **CORS Error**: Server not configured for external access
- **Timeout**: Server is not publicly accessible
- **500 Error**: Server error - check logs

## 📋 Quick Test Checklist

- [ ] Server is running locally (http://localhost:3000)
- [ ] Public URL is accessible (Vercel/ngrok/other)
- [ ] Health endpoint responds: `GET /health`
- [ ] API endpoint works: `POST /api/analyze`
- [ ] Mobile ChatGPT can reach the URL
- [ ] Response includes impact level and score

## 🎯 What Mobile ChatGPT Should Return

When successful, ChatGPT should show:
- **Project Name**: Your test project name
- **Auto-answered Questions**: List of questions answered automatically
- **Impact Level**: I, II, III, or IV
- **Score Percentage**: Numerical score (e.g., 18.37%)
- **Completion**: Percentage of questions answered

## 🔗 Integration Example for ChatGPT

```
"Please analyze this project using the AIA Assessment API:

Project: Customer Service AI Bot
Description: Automated chatbot that handles customer inquiries, escalates complex issues to humans, and maintains conversation logs for quality improvement.

Use this API:
POST [YOUR_URL]/api/analyze

Show me the impact level and whether a full audit is required."
```

## 📊 Expected Business Value

Once mobile testing works:
- ✅ External chatbots can assess projects
- ✅ SharePoint integration becomes possible
- ✅ Self-service AIA screening is available
- ✅ Compliance automation is functional

## 🔄 Next Steps After Testing

1. **Verify Results**: Ensure impact levels are accurate
2. **SharePoint Integration**: Use the structured output
3. **Production Deployment**: Move to permanent cloud hosting
4. **API Documentation**: Share with stakeholders
5. **Monitoring**: Set up logging and alerts
