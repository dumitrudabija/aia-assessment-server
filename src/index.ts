#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// AIA Assessment Types
interface AIAQuestion {
  id: string;
  category: string;
  subcategory: string;
  question: string;
  type: 'risk' | 'mitigation';
  maxScore: number;
  options: Array<{
    text: string;
    score: number;
  }>;
}

interface AIAResponse {
  questionId: string;
  selectedOption: number;
  score: number;
}

interface AIAAssessment {
  projectName: string;
  projectDescription: string;
  responses: AIAResponse[];
  rawImpactScore: number;
  mitigationScore: number;
  currentScore: number;
  impactLevel: 'I' | 'II' | 'III' | 'IV';
  impactLevelDescription: string;
  scorePercentage: number;
  timestamp: string;
}

interface ProjectAssessmentArgs {
  projectName: string;
  projectDescription: string;
  responses?: Array<{
    questionId: string;
    selectedOption: number;
  }>;
}

const isValidProjectAssessmentArgs = (
  args: any
): args is ProjectAssessmentArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.projectName === 'string' &&
  typeof args.projectDescription === 'string' &&
  (args.responses === undefined || Array.isArray(args.responses));

class AIAAssessmentServer {
  private server: Server;
  private questions: AIAQuestion[];

  constructor() {
    this.server = new Server(
      {
        name: 'aia-assessment-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.questions = this.initializeQuestions();
    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private initializeQuestions(): AIAQuestion[] {
    // Sample questions based on Canada's AIA framework
    // In a full implementation, this would include all 106 questions
    return [
      // Risk Questions - Project Category
      {
        id: 'project_001',
        category: 'Project',
        subcategory: 'Risk Profile',
        question: 'Will the system be used to make decisions about vulnerable populations (e.g., children, elderly, persons with disabilities)?',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes, but with limited impact', score: 1 },
          { text: 'Yes, with moderate impact', score: 2 },
          { text: 'Yes, with significant impact', score: 4 }
        ]
      },
      {
        id: 'project_002',
        category: 'Project',
        subcategory: 'Risk Profile',
        question: 'Could the system result in discrimination or unfair treatment of individuals or groups?',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'Very unlikely', score: 0 },
          { text: 'Unlikely', score: 1 },
          { text: 'Possible', score: 2 },
          { text: 'Likely', score: 4 }
        ]
      },
      // System Category
      {
        id: 'system_001',
        category: 'System',
        subcategory: 'About the System',
        question: 'Is the system a black box (i.e., decisions cannot be explained)?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'No, fully explainable', score: 0 },
          { text: 'Partially explainable', score: 1 },
          { text: 'Limited explainability', score: 2 },
          { text: 'Not explainable (black box)', score: 3 }
        ]
      },
      // Algorithm Category
      {
        id: 'algorithm_001',
        category: 'Algorithm',
        subcategory: 'About the Algorithm',
        question: 'Does the algorithm learn and evolve through use (machine learning)?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes, with human oversight', score: 1 },
          { text: 'Yes, with limited oversight', score: 2 }
        ]
      },
      // Decision Category
      {
        id: 'decision_001',
        category: 'Decision',
        subcategory: 'About the Decision',
        question: 'What is the level of human involvement in the decision-making process?',
        type: 'risk',
        maxScore: 8,
        options: [
          { text: 'Human makes final decision with system recommendation', score: 0 },
          { text: 'Human reviews system decision before implementation', score: 2 },
          { text: 'System makes decision with human oversight', score: 4 },
          { text: 'Fully automated decision-making', score: 8 }
        ]
      },
      // Impact Category
      {
        id: 'impact_001',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'Could the decision impact an individual\'s liberty, security, or physical safety?',
        type: 'risk',
        maxScore: 5,
        options: [
          { text: 'No impact', score: 0 },
          { text: 'Minor impact', score: 1 },
          { text: 'Moderate impact', score: 3 },
          { text: 'Significant impact', score: 5 }
        ]
      },
      {
        id: 'impact_002',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'Could the decision significantly impact an individual\'s economic interests?',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'No economic impact', score: 0 },
          { text: 'Minor economic impact', score: 1 },
          { text: 'Moderate economic impact', score: 2 },
          { text: 'Significant economic impact', score: 4 }
        ]
      },
      // Data Category
      {
        id: 'data_001',
        category: 'Data',
        subcategory: 'About the Data',
        question: 'Does the system use personal information?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'No personal information', score: 0 },
          { text: 'Non-sensitive personal information', score: 1 },
          { text: 'Sensitive personal information', score: 2 },
          { text: 'Highly sensitive personal information', score: 3 }
        ]
      },
      {
        id: 'data_002',
        category: 'Data',
        subcategory: 'About the Data',
        question: 'What is the quality and representativeness of the training data?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'High quality, representative data', score: 0 },
          { text: 'Good quality, mostly representative', score: 1 },
          { text: 'Moderate quality, some gaps', score: 2 },
          { text: 'Poor quality or unrepresentative data', score: 3 }
        ]
      },
      // Mitigation Questions - Consultations
      {
        id: 'consultation_001',
        category: 'Consultations',
        subcategory: 'About the Consultations',
        question: 'Have you consulted with affected communities or stakeholders?',
        type: 'mitigation',
        maxScore: 3,
        options: [
          { text: 'No consultations conducted', score: 0 },
          { text: 'Limited consultations', score: 1 },
          { text: 'Moderate consultations', score: 2 },
          { text: 'Extensive consultations', score: 3 }
        ]
      },
      // Mitigation Questions - De-risking measures
      {
        id: 'mitigation_001',
        category: 'De-risking',
        subcategory: 'Data Quality',
        question: 'Are there processes in place to ensure data quality and reduce bias?',
        type: 'mitigation',
        maxScore: 4,
        options: [
          { text: 'No specific processes', score: 0 },
          { text: 'Basic quality checks', score: 1 },
          { text: 'Regular quality assurance', score: 2 },
          { text: 'Comprehensive bias detection and mitigation', score: 4 }
        ]
      },
      {
        id: 'mitigation_002',
        category: 'De-risking',
        subcategory: 'Procedural Fairness',
        question: 'Is there a clear recourse process for individuals affected by decisions?',
        type: 'mitigation',
        maxScore: 4,
        options: [
          { text: 'No recourse process', score: 0 },
          { text: 'Limited recourse options', score: 1 },
          { text: 'Clear recourse process', score: 3 },
          { text: 'Comprehensive appeal and review process', score: 4 }
        ]
      },
      {
        id: 'mitigation_003',
        category: 'De-risking',
        subcategory: 'Privacy',
        question: 'Have privacy impact assessments been completed?',
        type: 'mitigation',
        maxScore: 3,
        options: [
          { text: 'No privacy assessment', score: 0 },
          { text: 'Basic privacy review', score: 1 },
          { text: 'Privacy impact assessment completed', score: 2 },
          { text: 'Comprehensive privacy protection measures', score: 3 }
        ]
      }
    ];
  }

  private calculateAssessment(responses: AIAResponse[]): {
    rawImpactScore: number;
    mitigationScore: number;
    currentScore: number;
    impactLevel: 'I' | 'II' | 'III' | 'IV';
    impactLevelDescription: string;
    scorePercentage: number;
  } {
    const riskResponses = responses.filter(r => {
      const question = this.questions.find(q => q.id === r.questionId);
      return question?.type === 'risk';
    });

    const mitigationResponses = responses.filter(r => {
      const question = this.questions.find(q => q.id === r.questionId);
      return question?.type === 'mitigation';
    });

    const rawImpactScore = riskResponses.reduce((sum, r) => sum + r.score, 0);
    const mitigationScore = mitigationResponses.reduce((sum, r) => sum + r.score, 0);

    // Calculate maximum possible scores for this subset of questions
    const maxRiskScore = this.questions
      .filter(q => q.type === 'risk')
      .reduce((sum, q) => sum + q.maxScore, 0);
    const maxMitigationScore = this.questions
      .filter(q => q.type === 'mitigation')
      .reduce((sum, q) => sum + q.maxScore, 0);

    // Apply mitigation logic: if mitigation score >= 80% of max, reduce raw impact by 15%
    const mitigationThreshold = maxMitigationScore * 0.8;
    const currentScore = mitigationScore >= mitigationThreshold 
      ? rawImpactScore * 0.85 
      : rawImpactScore;

    // Calculate percentage based on maximum possible raw impact score
    const scorePercentage = (currentScore / maxRiskScore) * 100;

    // Determine impact level
    let impactLevel: 'I' | 'II' | 'III' | 'IV';
    let impactLevelDescription: string;

    if (scorePercentage <= 25) {
      impactLevel = 'I';
      impactLevelDescription = 'Little to no impact';
    } else if (scorePercentage <= 50) {
      impactLevel = 'II';
      impactLevelDescription = 'Moderate impact';
    } else if (scorePercentage <= 75) {
      impactLevel = 'III';
      impactLevelDescription = 'High impact';
    } else {
      impactLevel = 'IV';
      impactLevelDescription = 'Very high impact';
    }

    return {
      rawImpactScore,
      mitigationScore,
      currentScore,
      impactLevel,
      impactLevelDescription,
      scorePercentage: Math.round(scorePercentage * 100) / 100
    };
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'aia://questions/all',
          name: 'All AIA Questions',
          mimeType: 'application/json',
          description: 'Complete list of Algorithmic Impact Assessment questions'
        },
        {
          uri: 'aia://questions/risk',
          name: 'Risk Assessment Questions',
          mimeType: 'application/json',
          description: 'Questions that contribute to the raw impact score'
        },
        {
          uri: 'aia://questions/mitigation',
          name: 'Mitigation Questions',
          mimeType: 'application/json',
          description: 'Questions that assess risk mitigation measures'
        }
      ]
    }));

    // Resource templates for dynamic access
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [
        {
          uriTemplate: 'aia://assessment/{projectName}',
          name: 'Project Assessment Results',
          mimeType: 'application/json',
          description: 'Assessment results for a specific project'
        }
      ]
    }));

    // Handle resource requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;

      if (uri === 'aia://questions/all') {
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(this.questions, null, 2)
          }]
        };
      }

      if (uri === 'aia://questions/risk') {
        const riskQuestions = this.questions.filter(q => q.type === 'risk');
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(riskQuestions, null, 2)
          }]
        };
      }

      if (uri === 'aia://questions/mitigation') {
        const mitigationQuestions = this.questions.filter(q => q.type === 'mitigation');
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(mitigationQuestions, null, 2)
          }]
        };
      }

      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'assess_project',
          description: 'Assess a project using Canada\'s Algorithmic Impact Assessment framework',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the project being assessed'
              },
              projectDescription: {
                type: 'string',
                description: 'Detailed description of the project and its automated decision-making components'
              },
              responses: {
                type: 'array',
                description: 'Array of question responses (optional - if not provided, will return questions to answer)',
                items: {
                  type: 'object',
                  properties: {
                    questionId: { type: 'string' },
                    selectedOption: { type: 'number' }
                  },
                  required: ['questionId', 'selectedOption']
                }
              }
            },
            required: ['projectName', 'projectDescription']
          }
        },
        {
          name: 'get_questions',
          description: 'Get AIA questions by category or type',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category (Project, System, Algorithm, Decision, Impact, Data, Consultations, De-risking)',
                enum: ['Project', 'System', 'Algorithm', 'Decision', 'Impact', 'Data', 'Consultations', 'De-risking']
              },
              type: {
                type: 'string',
                description: 'Filter by question type',
                enum: ['risk', 'mitigation']
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'assess_project') {
        if (!isValidProjectAssessmentArgs(request.params.arguments)) {
          throw new McpError(ErrorCode.InvalidParams, 'Invalid project assessment arguments');
        }

        const { projectName, projectDescription, responses } = request.params.arguments;

        // If no responses provided, return the questions to be answered
        if (!responses || responses.length === 0) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                message: 'Please provide responses to the following questions to complete the assessment:',
                questions: this.questions.map(q => ({
                  id: q.id,
                  category: q.category,
                  subcategory: q.subcategory,
                  question: q.question,
                  type: q.type,
                  options: q.options
                }))
              }, null, 2)
            }]
          };
        }

        // Convert responses to AIAResponse format
        const aiaResponses: AIAResponse[] = responses.map(r => {
          const question = this.questions.find(q => q.id === r.questionId);
          if (!question) {
            throw new McpError(ErrorCode.InvalidParams, `Unknown question ID: ${r.questionId}`);
          }
          if (r.selectedOption < 0 || r.selectedOption >= question.options.length) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid option for question ${r.questionId}`);
          }
          return {
            questionId: r.questionId,
            selectedOption: r.selectedOption,
            score: question.options[r.selectedOption].score
          };
        });

        // Calculate assessment
        const assessment = this.calculateAssessment(aiaResponses);

        const result: AIAAssessment = {
          projectName,
          projectDescription,
          responses: aiaResponses,
          ...assessment,
          timestamp: new Date().toISOString()
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      }

      if (request.params.name === 'get_questions') {
        const { category, type } = request.params.arguments || {};
        
        let filteredQuestions = this.questions;
        
        if (category) {
          filteredQuestions = filteredQuestions.filter(q => q.category === category);
        }
        
        if (type) {
          filteredQuestions = filteredQuestions.filter(q => q.type === type);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(filteredQuestions, null, 2)
          }]
        };
      }

      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AIA Assessment MCP server running on stdio');
  }
}

const server = new AIAAssessmentServer();
server.run().catch(console.error);
