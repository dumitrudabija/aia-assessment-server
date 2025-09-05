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

interface AnalyzeProjectArgs {
  projectName: string;
  projectDescription: string;
}

interface AutoAnsweredQuestion {
  questionId: string;
  question: string;
  selectedOption: number;
  selectedText: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

interface ProjectAnalysisResult {
  projectName: string;
  projectDescription: string;
  autoAnswered: AutoAnsweredQuestion[];
  needsManualInput: Array<{
    questionId: string;
    question: string;
    category: string;
    type: 'risk' | 'mitigation';
    options: Array<{ text: string; score: number }>;
    reasoning: string;
  }>;
  partialAssessment?: {
    rawImpactScore: number;
    mitigationScore: number;
    currentScore: number;
    impactLevel: 'I' | 'II' | 'III' | 'IV';
    impactLevelDescription: string;
    scorePercentage: number;
    completionPercentage: number;
  };
}

const isValidProjectAssessmentArgs = (
  args: any
): args is ProjectAssessmentArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.projectName === 'string' &&
  typeof args.projectDescription === 'string' &&
  (args.responses === undefined || Array.isArray(args.responses));

const isValidAnalyzeProjectArgs = (
  args: any
): args is AnalyzeProjectArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.projectName === 'string' &&
  typeof args.projectDescription === 'string';

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
    // 25 representative questions based on Canada's official AIA framework
    // Selected from the official survey-enfr.json to cover all key categories
    return [
      // RISK QUESTIONS (18 total)
      
      // Project Category (3 questions)
      {
        id: 'riskProfile1',
        category: 'Project',
        subcategory: 'Risk Profile',
        question: 'Is the project within an area of intense public scrutiny (for example, because of privacy concerns) and/or frequent litigation?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },
      {
        id: 'riskProfile2',
        category: 'Project',
        subcategory: 'Risk Profile',
        question: 'Does the line of business serve equity denied groups?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },
      {
        id: 'projectAuthority1',
        category: 'Project',
        subcategory: 'Project Authority',
        question: 'Will you require new policy or legal authority for this project?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      },

      // System Category (3 questions)
      {
        id: 'aboutSystem3',
        category: 'System',
        subcategory: 'About the System',
        question: 'Who developed the system?',
        type: 'risk',
        maxScore: 1,
        options: [
          { text: 'Your institution', score: 0 },
          { text: 'Another federal institution', score: 0 },
          { text: 'Another government', score: 1 },
          { text: 'A non-government third party', score: 1 }
        ]
      },
      {
        id: 'aboutSystem6',
        category: 'System',
        subcategory: 'About the System',
        question: 'Have you assigned accountability in your institution for the design, development, and maintenance, of the system?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'Yes', score: 0 },
          { text: 'No', score: 2 }
        ]
      },
      {
        id: 'aboutSystem9',
        category: 'System',
        subcategory: 'About the System',
        question: 'Is a non-automated alternative planned and available in the event the automated decision system was unavailable for an extended period of time?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'Yes', score: 0 },
          { text: 'No', score: 2 }
        ]
      },

      // Algorithm Category (3 questions)
      {
        id: 'aboutAlgorithm2',
        category: 'Algorithm',
        subcategory: 'About the Algorithm',
        question: 'The algorithmic process will be difficult to interpret or to explain',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },
      {
        id: 'aboutAlgorithm8',
        category: 'Algorithm',
        subcategory: 'About the Algorithm',
        question: 'Will the algorithm continue to learn and evolve as it is used?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },
      {
        id: 'aboutAlgorithm9',
        category: 'Algorithm',
        subcategory: 'About the Algorithm',
        question: 'Does the algorithm consider protected characteristics to make its decisions or recommendations?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      },

      // Decision Category (1 question)
      {
        id: 'decisionSector1',
        category: 'Decision',
        subcategory: 'About the Decision',
        question: 'Does the decision pertain to any of the following categories: Health-related services, Economic interests, Social assistance, Access and mobility, Licensing and permits, Employment, Public safety and law enforcement?',
        type: 'risk',
        maxScore: 1,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 1 }
        ]
      },

      // Impact Category (5 questions)
      {
        id: 'impact30',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'Which of the following best describes the type of automation you are planning?',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'Partial automation (the system will contribute to administrative decision-making by supporting an officer)', score: 2 },
          { text: 'Full automation (the system will make an administrative decision)', score: 4 }
        ]
      },
      {
        id: 'impact6',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'Are the impacts resulting from the decision reversible?',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'Reversible', score: 1 },
          { text: 'Likely reversible', score: 2 },
          { text: 'Difficult to reverse', score: 3 },
          { text: 'Irreversible', score: 4 }
        ]
      },
      {
        id: 'impact9',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'The impacts that the decision could have on the rights or freedoms of individuals may be:',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'Little to no impact', score: 1 },
          { text: 'Moderate impact', score: 2 },
          { text: 'High impact', score: 3 },
          { text: 'Very high impact', score: 4 }
        ]
      },
      {
        id: 'impact13',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'The impacts that the decision could have on the economic interests of individuals may be:',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'Little to no impact', score: 1 },
          { text: 'Moderate impact', score: 2 },
          { text: 'High impact', score: 3 },
          { text: 'Very high impact', score: 4 }
        ]
      },
      {
        id: 'impact18',
        category: 'Impact',
        subcategory: 'Impact Assessment',
        question: 'Have you assessed system performance for clients with a range of personal and intersectional identity factors to verify that decisions and outcomes are fair for a diverse group of people?',
        type: 'risk',
        maxScore: 3,
        options: [
          { text: 'Assessment conducted; no performance differences identified', score: 0 },
          { text: 'Assessment conducted; performance differences identified and are justified. Downstream impacts have been considered and addressed', score: 1 },
          { text: 'Assessment conducted; performance differences identified and are justified. Downstream impacts have not been considered or addressed', score: 2 },
          { text: 'No assessment has been conducted', score: 3 }
        ]
      },

      // Data Category (3 questions)
      {
        id: 'aboutDataSource1',
        category: 'Data',
        subcategory: 'About the Data',
        question: 'Will the system use personal information as input data?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      },
      {
        id: 'aboutDataSource15',
        category: 'Data',
        subcategory: 'About the Data',
        question: 'Is the training and testing data for the system representative of the clients being served?',
        type: 'risk',
        maxScore: 2,
        options: [
          { text: 'Yes', score: 0 },
          { text: 'Unsure', score: 1 },
          { text: 'No', score: 2 }
        ]
      },
      {
        id: 'aboutDataSource2',
        category: 'Data',
        subcategory: 'About the Data',
        question: 'What is the highest security classification of the input data used by the system?',
        type: 'risk',
        maxScore: 4,
        options: [
          { text: 'None', score: 0 },
          { text: 'Protected A', score: 1 },
          { text: 'Confidential', score: 2 },
          { text: 'Protected B', score: 3 },
          { text: 'Secret', score: 4 },
          { text: 'Top Secret', score: 4 }
        ]
      },

      // MITIGATION QUESTIONS (7 total)

      // Consultations Category (2 questions)
      {
        id: 'consultationDesign6',
        category: 'Consultations',
        subcategory: 'About the Consultations',
        question: 'Will you consult with the clients that will be most impacted by the system?',
        type: 'mitigation',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Unsure', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },
      {
        id: 'consultationDesign7',
        category: 'Consultations',
        subcategory: 'About the Consultations',
        question: 'Will you consult with clients or communities that will be adversely impacted by the system?',
        type: 'mitigation',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Unsure', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },

      // De-risking Category (5 questions)
      {
        id: 'dataQualityDesign1',
        category: 'De-risking',
        subcategory: 'Data Quality',
        question: 'Will you have documented processes in place to test datasets against biases, discrimination, and other unexpected outcomes?',
        type: 'mitigation',
        maxScore: 3,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 3 }
        ]
      },
      {
        id: 'fairnessDesign13',
        category: 'De-risking',
        subcategory: 'Procedural Fairness',
        question: 'Will there be a recourse process planned or established for clients to challenge the decision?',
        type: 'mitigation',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      },
      {
        id: 'fairnessDesign10',
        category: 'De-risking',
        subcategory: 'Procedural Fairness',
        question: 'Will the system be able to produce reasons for its decisions or recommendations when required?',
        type: 'mitigation',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      },
      {
        id: 'fairnessDesign24',
        category: 'De-risking',
        subcategory: 'Procedural Fairness',
        question: 'Do you have monitoring processes in place to detect changes in system performance over time?',
        type: 'mitigation',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      },
      {
        id: 'privacyDesign1',
        category: 'De-risking',
        subcategory: 'Privacy',
        question: 'If your system uses or creates personal information, will you undertake a privacy impact assessment (PIA), or update an existing one prior to system launch?',
        type: 'mitigation',
        maxScore: 2,
        options: [
          { text: 'No', score: 0 },
          { text: 'Yes', score: 2 }
        ]
      }
    ];
  }

  private analyzeProjectDescription(projectName: string, projectDescription: string): ProjectAnalysisResult {
    const description = projectDescription.toLowerCase();
    const autoAnswered: AutoAnsweredQuestion[] = [];
    const needsManualInput: Array<{
      questionId: string;
      question: string;
      category: string;
      type: 'risk' | 'mitigation';
      options: Array<{ text: string; score: number }>;
      reasoning: string;
    }> = [];

    // Analysis patterns for automatic answering
    const analysisPatterns = {
      // System development patterns
      thirdPartyDeveloped: /third.?party|vendor|contractor|external|outsourced|commercial|off.?the.?shelf|cots/,
      internalDeveloped: /internal|in.?house|developed.?by.?us|our.?team|custom.?built/,
      
      // Data patterns
      personalData: /personal.?information|pii|personal.?data|names?|addresses?|phone.?numbers?|email|ssn|sin|health.?records|financial.?data|biometric/,
      sensitiveData: /classified|confidential|secret|protected|sensitive|restricted/,
      
      // Automation patterns
      fullAutomation: /fully.?automated|automatic.?decision|no.?human.?intervention|autonomous|complete.?automation/,
      partialAutomation: /human.?in.?the.?loop|assisted|support|recommend|partial.?automation|semi.?automated/,
      
      // Impact patterns
      highImpact: /life.?changing|irreversible|permanent|critical|essential|vital|major.?impact/,
      moderateImpact: /significant|important|moderate|substantial/,
      lowImpact: /minor|small|limited|minimal/,
      
      // Sector patterns
      healthSector: /health|medical|hospital|clinic|patient|treatment|diagnosis|healthcare/,
      economicSector: /financial|economic|money|payment|loan|credit|benefit|assistance|employment|job/,
      lawEnforcement: /police|law.?enforcement|criminal|security|surveillance|investigation/,
      licensing: /license|permit|certification|approval|registration/,
      
      // Algorithm patterns
      machineLearning: /machine.?learning|ml|ai|artificial.?intelligence|neural.?network|deep.?learning|algorithm.?learns|adaptive/,
      blackBox: /black.?box|opaque|difficult.?to.?explain|complex.?algorithm|neural.?network|deep.?learning/,
      
      // Mitigation patterns
      consultation: /consult|stakeholder|feedback|input|engagement|community|user.?testing/,
      biasTesting: /bias.?testing|fairness.?testing|discrimination.?testing|equity.?assessment/,
      recourse: /appeal|challenge|review|recourse|complaint|dispute/,
      monitoring: /monitor|track|audit|review|oversight|performance.?tracking/,
      pia: /privacy.?impact.?assessment|pia|privacy.?review/
    };

    // Analyze each question
    for (const question of this.questions) {
      let answered = false;
      
      switch (question.id) {
        case 'aboutSystem3': // Who developed the system?
          if (analysisPatterns.thirdPartyDeveloped.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 3, // A non-government third party
              selectedText: question.options[3].text,
              confidence: 'high',
              reasoning: 'Project description indicates third-party or external development'
            });
            answered = true;
          } else if (analysisPatterns.internalDeveloped.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 0, // Your institution
              selectedText: question.options[0].text,
              confidence: 'high',
              reasoning: 'Project description indicates internal development'
            });
            answered = true;
          }
          break;

        case 'aboutDataSource1': // Will the system use personal information as input data?
          if (analysisPatterns.personalData.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description mentions personal information or PII'
            });
            answered = true;
          }
          break;

        case 'impact30': // Type of automation
          if (analysisPatterns.fullAutomation.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Full automation
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description indicates fully automated decision-making'
            });
            answered = true;
          } else if (analysisPatterns.partialAutomation.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 0, // Partial automation
              selectedText: question.options[0].text,
              confidence: 'high',
              reasoning: 'Project description indicates human-assisted decision-making'
            });
            answered = true;
          }
          break;

        case 'decisionSector1': // Decision sector
          if (analysisPatterns.healthSector.test(description) || 
              analysisPatterns.economicSector.test(description) ||
              analysisPatterns.lawEnforcement.test(description) ||
              analysisPatterns.licensing.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description indicates it pertains to a regulated sector'
            });
            answered = true;
          }
          break;

        case 'aboutAlgorithm8': // Will the algorithm continue to learn and evolve?
          if (analysisPatterns.machineLearning.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'medium',
              reasoning: 'Project description mentions machine learning or adaptive algorithms'
            });
            answered = true;
          }
          break;

        case 'aboutAlgorithm2': // Difficult to interpret or explain
          if (analysisPatterns.blackBox.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'medium',
              reasoning: 'Project description suggests complex or opaque algorithmic processes'
            });
            answered = true;
          }
          break;

        case 'consultationDesign6': // Consult with most impacted clients
        case 'consultationDesign7': // Consult with adversely impacted clients
          if (analysisPatterns.consultation.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 2, // Yes
              selectedText: question.options[2].text,
              confidence: 'medium',
              reasoning: 'Project description mentions consultation or stakeholder engagement'
            });
            answered = true;
          }
          break;

        case 'dataQualityDesign1': // Bias testing processes
          if (analysisPatterns.biasTesting.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description mentions bias testing or fairness assessment'
            });
            answered = true;
          }
          break;

        case 'fairnessDesign13': // Recourse process
          if (analysisPatterns.recourse.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description mentions appeal or challenge processes'
            });
            answered = true;
          }
          break;

        case 'fairnessDesign24': // Monitoring processes
          if (analysisPatterns.monitoring.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description mentions monitoring or performance tracking'
            });
            answered = true;
          }
          break;

        case 'privacyDesign1': // Privacy Impact Assessment
          if (analysisPatterns.pia.test(description)) {
            autoAnswered.push({
              questionId: question.id,
              question: question.question,
              selectedOption: 1, // Yes
              selectedText: question.options[1].text,
              confidence: 'high',
              reasoning: 'Project description mentions Privacy Impact Assessment'
            });
            answered = true;
          }
          break;
      }

      // If not automatically answered, add to manual input list
      if (!answered) {
        needsManualInput.push({
          questionId: question.id,
          question: question.question,
          category: question.category,
          type: question.type,
          options: question.options,
          reasoning: 'Could not be determined from project description - requires manual input'
        });
      }
    }

    // Calculate partial assessment if we have auto-answered questions
    let partialAssessment;
    if (autoAnswered.length > 0) {
      const responses: AIAResponse[] = autoAnswered.map(aa => ({
        questionId: aa.questionId,
        selectedOption: aa.selectedOption,
        score: this.questions.find(q => q.id === aa.questionId)!.options[aa.selectedOption].score
      }));
      
      const assessment = this.calculateAssessment(responses);
      const completionPercentage = (autoAnswered.length / this.questions.length) * 100;
      
      partialAssessment = {
        ...assessment,
        completionPercentage: Math.round(completionPercentage * 100) / 100
      };
    }

    return {
      projectName,
      projectDescription,
      autoAnswered,
      needsManualInput,
      partialAssessment
    };
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
          name: 'analyze_project_description',
          description: 'Intelligently analyze a project description to automatically answer AIA questions where possible and identify questions requiring manual input',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the project being analyzed'
              },
              projectDescription: {
                type: 'string',
                description: 'Detailed description of the project and its automated decision-making components'
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

      if (request.params.name === 'analyze_project_description') {
        if (!isValidAnalyzeProjectArgs(request.params.arguments)) {
          throw new McpError(ErrorCode.InvalidParams, 'Invalid analyze project arguments');
        }

        const { projectName, projectDescription } = request.params.arguments;
        const analysisResult = this.analyzeProjectDescription(projectName, projectDescription);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(analysisResult, null, 2)
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
