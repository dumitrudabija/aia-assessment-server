import { VercelRequest, VercelResponse } from '@vercel/node';
import { AIAAssessmentServer } from '../src/aia-server';

const aiaServer = new AIAAssessmentServer();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
