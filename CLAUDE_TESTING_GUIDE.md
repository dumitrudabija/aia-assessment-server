# Testing AIA Server with Claude

## 🎯 How to Test Your AIA Assessment Server with Claude

Your AIA server is now deployed on Vercel and can be tested directly with Claude using web requests.

## 🔗 Getting Your Vercel URL

After successful Vercel deployment, you should have received a URL like:
```
https://aia-assessment-server-[random].vercel.app
```

## 🧪 Testing with Claude (This Conversation)

### Method 1: Direct API Test
Ask Claude to test your API:

```
"Please test my AIA Assessment API:

URL: https://[YOUR-VERCEL-URL].vercel.app/api/analyze
Method: POST
Content-Type: application/json

Body:
{
  "projectName": "AI Hiring System",
  "projectDescription": "Automated recruitment system that uses machine learning to screen resumes, analyze video interviews, and make hiring recommendations based on candidate data including personal information"
}

Please show me the complete response including impact level and auto-answered questions."
```

### Method 2: Health Check Test
First verify the server is running:

```
"Please check if my AIA server is healthy:

GET https://[YOUR-VERCEL-URL].vercel.app/health

Show me the response."
```

## 📊 Expected Claude Response

When Claude tests your API successfully, you should see:

```json
{
  "projectName": "AI Hiring System",
  "projectDescription": "Automated recruitment system...",
  "autoAnswered": [
    {
      "questionId": "aboutAlgorithm8",
      "question": "Will the algorithm continue to learn and evolve as it is used?",
      "selectedOption": 1,
      "selectedText": "Yes",
      "confidence": "medium",
      "reasoning": "Project description mentions machine learning or adaptive algorithms"
    },
    {
      "questionId": "impact30",
      "question": "Which of the following best describes the type of automation you are planning?",
      "selectedOption": 1,
      "selectedText": "Full automation (the system will make an administrative decision)",
      "confidence": "high",
      "reasoning": "Project description indicates fully automated decision-making"
    }
  ],
  "needsManualInput": [
    // List of questions requiring manual input
  ],
  "partialAssessment": {
    "rawImpactScore": 12,
    "mitigationScore": 0,
    "currentScore": 12,
    "impactLevel": "II",
    "impactLevelDescription": "Moderate impact",
    "scorePercentage": 24.49,
    "completionPercentage": 16
  }
}
```

## 🎯 Key Things to Verify

### ✅ Auto-Answering Works
- Claude should show 3-5 questions automatically answered
- Each with confidence level (high/medium/low)
- Reasoning for each auto-answer

### ✅ Impact Assessment Works
- Impact Level: I, II, III, or IV
- Score Percentage: 0-100%
- Completion Percentage: Shows how much was auto-completed

### ✅ Question Categories
- Questions should span all 8 AIA categories:
  - Project, System, Algorithm, Decision
  - Impact, Data, Consultations, De-risking

## 🔧 Testing Different Project Types

### High-Risk AI System
```json
{
  "projectName": "Predictive Policing AI",
  "projectDescription": "Machine learning system that analyzes crime data, demographic information, and social media to predict criminal activity and automatically dispatch police resources to specific neighborhoods"
}
```

### Low-Risk AI System
```json
{
  "projectName": "Weather Chatbot",
  "projectDescription": "Simple chatbot that provides weather forecasts based on user location without storing personal data or making automated decisions"
}
```

### Medium-Risk AI System
```json
{
  "projectName": "Document Classification Tool",
  "projectDescription": "AI system that automatically categorizes government documents and routes them to appropriate departments for review"
}
```

## 🚨 Troubleshooting

### If Claude Can't Reach Your Server:
1. **Check URL**: Ensure the Vercel URL is correct and accessible
2. **CORS Issues**: Should be configured, but verify in browser first
3. **Server Status**: Test the `/health` endpoint first
4. **Vercel Logs**: Check Vercel dashboard for function errors

### If API Returns Errors:
1. **400 Bad Request**: Check JSON format in request body
2. **404 Not Found**: Verify endpoint path `/api/analyze`
3. **500 Server Error**: Check Vercel function logs
4. **Timeout**: Vercel functions have 10s limit

## 📱 Comparison with Mobile ChatGPT

Claude testing vs Mobile ChatGPT:
- **Claude**: Can show detailed JSON responses and debug issues
- **Mobile ChatGPT**: Better for real-world usage scenarios
- **Both**: Should return identical assessment results

## 🎉 Success Indicators

✅ **Health endpoint returns 200 OK**
✅ **API returns structured JSON response**
✅ **Auto-answered questions with reasoning**
✅ **Impact level calculation (I-IV)**
✅ **Score percentage calculated**
✅ **Questions span all AIA categories**
✅ **Different project types yield different scores**

## 🔄 Next Steps After Testing

1. **Verify Accuracy**: Check if impact levels make sense
2. **Test Edge Cases**: Very simple vs very complex projects
3. **SharePoint Integration**: Use the structured output
4. **Production Monitoring**: Set up logging and alerts
5. **User Training**: Share API documentation with stakeholders

Your AIA Assessment server is now ready for production use with external AI assistants!
