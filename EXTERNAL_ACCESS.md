# External Access Guide

This guide explains how to access the AIA Assessment server from external chatbots and applications.

## Deployment Options

### Option 1: HTTP API Server (Recommended for External Access)

The easiest way to make the AIA server accessible to external chatbots is through the HTTP API wrapper.

#### Local Development
```bash
# Build the project
npm run build

# Start the HTTP API server
npm run start:http

# Or for development with auto-rebuild
npm run dev:http
```

The server will be available at `http://localhost:3000`

#### API Endpoints

**Base URL:** `http://localhost:3000` (or your deployed URL)

1. **POST /api/analyze** - Intelligent project analysis
   ```json
   {
     "projectName": "AI Loan System",
     "projectDescription": "Fully automated ML system using personal data for lending decisions with bias testing planned"
   }
   ```

2. **POST /api/assess** - Complete assessment with manual responses
   ```json
   {
     "projectName": "AI System",
     "projectDescription": "Description here",
     "responses": [
       {"questionId": "riskProfile1", "selectedOption": 0}
     ]
   }
   ```

3. **GET /api/questions** - Get questions by category/type
   ```
   /api/questions?category=Impact&type=risk
   ```

4. **GET /api/docs** - API documentation
5. **GET /health** - Health check

### Option 2: Cloud Deployment

#### Deploy to Railway
1. Fork the repository
2. Connect to Railway
3. Deploy with environment variables:
   ```
   PORT=3000
   NODE_ENV=production
   ```

#### Deploy to Heroku
```bash
# Install Heroku CLI
heroku create your-aia-server
git push heroku main
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
vercel --prod
```

#### Deploy to AWS/Azure/GCP
Use Docker or direct deployment with Node.js runtime.

### Option 3: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
EXPOSE 3000
CMD ["npm", "run", "start:http"]
```

Build and run:
```bash
docker build -t aia-server .
docker run -p 3000:3000 aia-server
```

## Integration Examples

### ChatGPT/GPT-4 Integration

```javascript
// In your chatbot code
async function analyzeProject(projectName, description) {
  const response = await fetch('http://your-server.com/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName,
      projectDescription: description
    })
  });
  return response.json();
}
```

### Claude Integration

```python
import requests

def analyze_aia_project(project_name, description):
    response = requests.post(
        'http://your-server.com/api/analyze',
        json={
            'projectName': project_name,
            'projectDescription': description
        }
    )
    return response.json()
```

### Webhook Integration

```javascript
// Express webhook endpoint
app.post('/webhook/aia-assess', async (req, res) => {
  const { projectName, projectDescription } = req.body;
  
  const analysis = await fetch('http://your-aia-server.com/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectName, projectDescription })
  }).then(r => r.json());
  
  // Send to SharePoint or other system
  await updateSharePoint(analysis);
  
  res.json({ success: true, analysis });
});
```

## Security Considerations

### Authentication
Add API key authentication:
```javascript
// In http-server.ts
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### CORS Configuration
```javascript
app.use(cors({
  origin: ['https://your-chatbot-domain.com'],
  credentials: true
}));
```

## SharePoint Integration

### Power Automate Flow
1. Create HTTP trigger in Power Automate
2. Call AIA API endpoint
3. Parse JSON response
4. Update SharePoint list

### Direct SharePoint API
```javascript
async function updateSharePointAssessment(analysis) {
  const sharePointData = {
    Title: analysis.projectName,
    ImpactLevel: analysis.partialAssessment?.impactLevel,
    Score: analysis.partialAssessment?.scorePercentage,
    RequiresAudit: ['III', 'IV'].includes(analysis.partialAssessment?.impactLevel),
    AssessmentDate: new Date().toISOString()
  };
  
  // Update SharePoint list item
  await fetch(`${sharePointSiteUrl}/_api/web/lists/getbytitle('AIA Assessments')/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(sharePointData)
  });
}
```

## Monitoring and Logging

### Health Checks
```bash
curl http://your-server.com/health
```

### Logging
```javascript
// Add structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'aia-server.log' })
  ]
});

// Log API calls
app.use((req, res, next) => {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  next();
});
```

## Environment Variables

Create `.env` file:
```
PORT=3000
NODE_ENV=production
API_KEY=your-secret-api-key
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_CLIENT_SECRET=your-client-secret
```

## Testing the API

### Using curl
```bash
# Test analyze endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "projectDescription": "Fully automated AI system using personal data for loan decisions"
  }'

# Test health endpoint
curl http://localhost:3000/health
```

### Using Postman
Import the API collection with these endpoints:
- POST `/api/analyze`
- POST `/api/assess`
- GET `/api/questions`
- GET `/api/docs`
- GET `/health`

## Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT environment variable
2. **CORS errors**: Update CORS configuration
3. **Build errors**: Run `npm run build` first
4. **Module not found**: Check import paths and file extensions

### Debug Mode
```bash
DEBUG=* npm run dev:http
```

This setup allows any external chatbot or application to access your AIA assessment server through standard HTTP API calls.
