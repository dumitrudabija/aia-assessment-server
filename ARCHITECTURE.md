# AIA Assessment Server Architecture

## Overview
This document describes the technical architecture of the Canada Algorithmic Impact Assessment (AIA) MCP server.

## System Architecture

### Core Components

```
aia-assessment-server/
├── src/
│   └── index.ts              # Main server implementation
├── build/                    # Compiled JavaScript output
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── docs/                    # Documentation files
```

### Class Structure

#### `AIAAssessmentServer`
Main server class that implements the MCP server protocol.

**Key Methods:**
- `constructor()`: Initializes server, questions, and handlers
- `initializeQuestions()`: Loads the AIA question framework
- `calculateAssessment()`: Implements Canada's AIA scoring algorithm
- `setupResourceHandlers()`: Configures MCP resource endpoints
- `setupToolHandlers()`: Configures MCP tool endpoints
- `run()`: Starts the server with stdio transport

### Data Models

#### `AIAQuestion`
```typescript
interface AIAQuestion {
  id: string;                    // Unique question identifier
  category: string;              // Risk category (Project, System, etc.)
  subcategory: string;           // Specific subcategory
  question: string;              // Question text
  type: 'risk' | 'mitigation';   // Question type
  maxScore: number;              // Maximum possible score
  options: Array<{               // Answer options
    text: string;
    score: number;
  }>;
}
```

#### `AIAResponse`
```typescript
interface AIAResponse {
  questionId: string;            // Reference to question
  selectedOption: number;        // Index of selected option
  score: number;                 // Score for selected option
}
```

#### `AIAAssessment`
```typescript
interface AIAAssessment {
  projectName: string;
  projectDescription: string;
  responses: AIAResponse[];
  rawImpactScore: number;        // Sum of risk scores
  mitigationScore: number;       // Sum of mitigation scores
  currentScore: number;          // Adjusted score after mitigation
  impactLevel: 'I' | 'II' | 'III' | 'IV';
  impactLevelDescription: string;
  scorePercentage: number;       // Percentage of maximum risk score
  timestamp: string;
}
```

## MCP Protocol Implementation

### Tools
- **assess_project**: Main assessment tool
- **get_questions**: Question filtering tool

### Resources
- **Static Resources**: Predefined question sets
- **Resource Templates**: Dynamic project assessments

### Transport
Uses `StdioServerTransport` for communication with MCP clients.

## Scoring Algorithm

### Canada AIA Methodology
1. **Risk Assessment**: Sum scores from risk questions (categories 1-6)
2. **Mitigation Assessment**: Sum scores from mitigation questions (categories 7-8)
3. **Score Adjustment**: If mitigation ≥ 80% of max, reduce risk score by 15%
4. **Impact Level**: Classify based on percentage ranges

### Impact Level Thresholds
- Level I: 0-25% (Little to no impact)
- Level II: 26-50% (Moderate impact)
- Level III: 51-75% (High impact)
- Level IV: 76-100% (Very high impact)

## Question Framework

### Risk Categories (65 questions in full implementation)
1. **Project** (10 questions, max 22 points)
2. **System** (9 questions, max 17 points)
3. **Algorithm** (9 questions, max 15 points)
4. **Decision** (1 question, max 8 points)
5. **Impact** (20 questions, max 52 points)
6. **Data** (16 questions, max 55 points)

### Mitigation Categories (41 questions in full implementation)
7. **Consultations** (4 questions, max 10 points)
8. **De-risking** (37 questions, max 65 points)

## Error Handling
- Input validation for all tool parameters
- Graceful handling of unknown question IDs
- Proper MCP error responses with appropriate error codes

## Security Considerations
- No external network access required
- Stateless operation (no persistent data storage)
- Input sanitization for all user-provided data
