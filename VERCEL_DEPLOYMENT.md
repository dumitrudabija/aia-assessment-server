# Vercel Deployment Guide

## 🚀 Deploy Your AIA Server to Vercel (Recommended for Mobile Testing)

Your project is already configured for Vercel deployment. Here's how to deploy it:

## 📋 Step-by-Step Deployment

### Option 1: Import from GitHub (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with your Vercel account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Connect your GitHub account if not already connected

3. **Select Repository**
   - Find: `dumitrudabija/aia-assessment-server`
   - Click "Import"

4. **Configure Project**
   - **Project Name**: `aia-assessment-server` (or your preferred name)
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)

### Option 2: CLI Deployment (Alternative)

```bash
cd /Users/dumitru.dabija/Documents/Cline/MCP/aia-assessment-server
npx vercel --prod
```

## 🌐 Your Deployment URL

After deployment, you'll get a URL like:
```
https://aia-assessment-server-[random].vercel.app
```

## ✅ Verify Deployment

### Test Health Endpoint
Visit in browser:
```
https://your-vercel-url.vercel.app/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-05T16:33:00.000Z",
  "service": "AIA Assessment Server"
}
```

### Test API Endpoint
Use curl or browser:
```bash
curl -X POST https://your-vercel-url.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test System",
    "projectDescription": "Automated AI system using personal data"
  }'
```

## 📱 Mobile ChatGPT Testing

Once deployed, tell mobile ChatGPT:

```
"Please test this API endpoint for me:

POST https://[YOUR-VERCEL-URL].vercel.app/api/analyze

Headers: Content-Type: application/json

Body:
{
  "projectName": "AI Customer Service Bot",
  "projectDescription": "Fully automated chatbot that uses customer data to provide personalized responses and makes decisions about service escalation"
}

Show me the response including the impact level and score percentage."
```

## 🔧 Project Configuration (Already Done)

Your project includes these Vercel-ready files:

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### `api/analyze.ts` (Serverless Function)
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { AIAServer } from '../src/aia-server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... implementation
}
```

### `api/assess.ts` (Serverless Function)
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { AIAServer } from '../src/aia-server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... implementation
}
```

## 🎯 Available Endpoints After Deployment

- `GET /health` - Health check
- `POST /api/analyze` - Intelligent project analysis
- `POST /api/assess` - Complete assessment with responses
- `GET /api/questions` - Get AIA questions by category

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that `npm run build` works locally
   - Ensure all dependencies are in `package.json`

2. **404 on API Endpoints**
   - Verify `api/` folder structure
   - Check `vercel.json` configuration

3. **Function Timeout**
   - Vercel has 10s timeout for hobby plan
   - Consider upgrading if needed

4. **CORS Issues**
   - Already configured in the API functions
   - Should work with mobile ChatGPT

### Debug Steps:

1. **Check Vercel Logs**
   - Go to Vercel dashboard
   - Click on your deployment
   - View "Functions" tab for logs

2. **Test Locally First**
   ```bash
   npm run build
   npm run start:http
   curl http://localhost:3000/health
   ```

## 🔄 Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback capability in Vercel dashboard

## 📊 Expected Mobile ChatGPT Response

When working correctly, ChatGPT should return:

```json
{
  "projectName": "AI Customer Service Bot",
  "projectDescription": "Fully automated chatbot...",
  "autoAnswered": [
    {
      "questionId": "aboutAlgorithm8",
      "question": "Will the algorithm continue to learn and evolve as it is used?",
      "selectedOption": 1,
      "selectedText": "Yes",
      "confidence": "medium",
      "reasoning": "Project description mentions machine learning or adaptive algorithms"
    }
  ],
  "partialAssessment": {
    "rawImpactScore": 6,
    "mitigationScore": 0,
    "currentScore": 6,
    "impactLevel": "I",
    "impactLevelDescription": "Little to no impact",
    "scorePercentage": 12.24,
    "completionPercentage": 12
  }
}
```

## 🎉 Success Indicators

✅ Vercel deployment completes without errors
✅ Health endpoint returns 200 OK
✅ API endpoints return structured JSON
✅ Mobile ChatGPT can reach and use the API
✅ Impact levels and scores are calculated correctly

Your AIA server will then be publicly accessible for mobile ChatGPT testing!
