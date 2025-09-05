#!/usr/bin/env node
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AIAAssessmentServer } from './aia-server.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize AIA Assessment Server
const aiaServer = new AIAAssessmentServer();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Analyze project description endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { projectName, projectDescription } = req.body;
    
    if (!projectName || !projectDescription) {
      return res.status(400).json({
        error: 'Missing required fields: projectName and projectDescription'
      });
    }

    const result = aiaServer.analyzeProjectDescription(projectName, projectDescription);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assess project endpoint
app.post('/api/assess', async (req: Request, res: Response) => {
  try {
    const { projectName, projectDescription, responses } = req.body;
    
    if (!projectName || !projectDescription) {
      return res.status(400).json({
        error: 'Missing required fields: projectName and projectDescription'
      });
    }

    const result = aiaServer.assessProject(projectName, projectDescription, responses);
    res.json(result);
  } catch (error) {
    console.error('Error assessing project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions endpoint
app.get('/api/questions', (req: Request, res: Response) => {
  try {
    const { category, type } = req.query;
    const result = aiaServer.getQuestions(category as string, type as 'risk' | 'mitigation');
    res.json(result);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    title: 'Canada AIA Assessment API',
    version: '2.0.0',
    endpoints: {
      'POST /api/analyze': {
        description: 'Analyze project description and auto-answer questions',
        body: {
          projectName: 'string (required)',
          projectDescription: 'string (required)'
        }
      },
      'POST /api/assess': {
        description: 'Complete AIA assessment with responses',
        body: {
          projectName: 'string (required)',
          projectDescription: 'string (required)',
          responses: 'array (optional) - [{questionId: string, selectedOption: number}]'
        }
      },
      'GET /api/questions': {
        description: 'Get AIA questions',
        query: {
          category: 'string (optional) - Project|System|Algorithm|Decision|Impact|Data|Consultations|De-risking',
          type: 'string (optional) - risk|mitigation'
        }
      }
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 AIA Assessment HTTP API running on port ${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health Check: http://localhost:${port}/health`);
});
