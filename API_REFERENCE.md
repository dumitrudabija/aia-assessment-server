# AIA Assessment Server API Reference

## Overview
This document provides detailed API reference for the Canada Algorithmic Impact Assessment MCP server tools and resources.

## Tools

### `assess_project`

Conducts a comprehensive AIA assessment for an AI/automated decision-making project.

#### Input Schema
```json
{
  "type": "object",
  "properties": {
    "projectName": {
      "type": "string",
      "description": "Name of the project being assessed",
      "required": true
    },
    "projectDescription": {
      "type": "string", 
      "description": "Detailed description of the project and its automated decision-making components",
      "required": true
    },
    "responses": {
      "type": "array",
      "description": "Array of question responses (optional - if not provided, will return questions to answer)",
      "items": {
        "type": "object",
        "properties": {
          "questionId": {
            "type": "string",
            "description": "ID of the question being answered"
          },
          "selectedOption": {
            "type": "number",
            "description": "Index of the selected answer option (0-based)"
          }
        },
        "required": ["questionId", "selectedOption"]
      }
    }
  },
  "required": ["projectName", "projectDescription"]
}
```

#### Response Format

**When no responses provided:**
```json
{
  "message": "Please provide responses to the following questions to complete the assessment:",
  "questions": [
    {
      "id": "project_001",
      "category": "Project",
      "subcategory": "Risk Profile",
      "question": "Will the system be used to make decisions about vulnerable populations?",
      "type": "risk",
      "options": [
        {"text": "No", "score": 0},
        {"text": "Yes, but with limited impact", "score": 1},
        {"text": "Yes, with moderate impact", "score": 2},
        {"text": "Yes, with significant impact", "score": 4}
      ]
    }
    // ... additional questions
  ]
}
```

**When responses provided:**
```json
{
  "projectName": "AI-Powered Benefits Eligibility System",
  "projectDescription": "An automated system that uses machine learning...",
  "responses": [
    {
      "questionId": "project_001",
      "selectedOption": 3,
      "score": 4
    }
    // ... additional responses
  ],
  "rawImpactScore": 23,
  "mitigationScore": 7,
  "currentScore": 23,
  "impactLevel": "III",
  "impactLevelDescription": "High impact",
  "scorePercentage": 63.89,
  "timestamp": "2025-09-05T15:24:17.352Z"
}
```

#### Usage Examples

**Initial Assessment (Get Questions):**
```json
{
  "projectName": "AI Hiring System",
  "projectDescription": "Machine learning system for screening job applications"
}
```

**Complete Assessment:**
```json
{
  "projectName": "AI Hiring System",
  "projectDescription": "Machine learning system for screening job applications",
  "responses": [
    {"questionId": "project_001", "selectedOption": 2},
    {"questionId": "project_002", "selectedOption": 1},
    {"questionId": "system_001", "selectedOption": 1}
    // ... additional responses
  ]
}
```

### `get_questions`

Retrieves AIA questions filtered by category or type.

#### Input Schema
```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "Filter by category",
      "enum": ["Project", "System", "Algorithm", "Decision", "Impact", "Data", "Consultations", "De-risking"]
    },
    "type": {
      "type": "string",
      "description": "Filter by question type",
      "enum": ["risk", "mitigation"]
    }
  }
}
```

#### Response Format
```json
[
  {
    "id": "impact_001",
    "category": "Impact",
    "subcategory": "Impact Assessment",
    "question": "Could the decision impact an individual's liberty, security, or physical safety?",
    "type": "risk",
    "maxScore": 5,
    "options": [
      {"text": "No impact", "score": 0},
      {"text": "Minor impact", "score": 1},
      {"text": "Moderate impact", "score": 3},
      {"text": "Significant impact", "score": 5}
    ]
  }
  // ... additional questions
]
```

#### Usage Examples

**Get all risk questions:**
```json
{
  "type": "risk"
}
```

**Get Impact category questions:**
```json
{
  "category": "Impact"
}
```

**Get Impact risk questions only:**
```json
{
  "category": "Impact",
  "type": "risk"
}
```

## Resources

### Static Resources

#### `aia://questions/all`
Returns all AIA questions (both risk and mitigation).

**Response:** Array of `AIAQuestion` objects

#### `aia://questions/risk`
Returns only risk assessment questions.

**Response:** Array of `AIAQuestion` objects with `type: "risk"`

#### `aia://questions/mitigation`
Returns only mitigation questions.

**Response:** Array of `AIAQuestion` objects with `type: "mitigation"`

### Resource Templates

#### `aia://assessment/{projectName}`
Template for accessing assessment results for a specific project.

**Note:** Currently returns static resource content. Future implementation could store/retrieve project-specific assessments.

## Question Categories

### Risk Questions (9 sample questions included)

#### Project Category
- `project_001`: Vulnerable populations impact
- `project_002`: Discrimination risk

#### System Category  
- `system_001`: System explainability (black box assessment)

#### Algorithm Category
- `algorithm_001`: Machine learning evolution

#### Decision Category
- `decision_001`: Human involvement level

#### Impact Category
- `impact_001`: Liberty/security/safety impact
- `impact_002`: Economic impact

#### Data Category
- `data_001`: Personal information usage
- `data_002`: Data quality and representativeness

### Mitigation Questions (4 sample questions included)

#### Consultations Category
- `consultation_001`: Stakeholder consultations

#### De-risking Category
- `mitigation_001`: Data quality processes
- `mitigation_002`: Recourse processes
- `mitigation_003`: Privacy impact assessments

## Scoring System

### Score Calculation
1. **Raw Impact Score**: Sum of all risk question scores
2. **Mitigation Score**: Sum of all mitigation question scores
3. **Current Score**: Raw impact score, reduced by 15% if mitigation score ≥ 80% of maximum
4. **Score Percentage**: (Current Score / Maximum Possible Risk Score) × 100

### Impact Levels
| Level | Range | Description | Audit Requirement |
|-------|-------|-------------|-------------------|
| I | 0-25% | Little to no impact | Minimal oversight |
| II | 26-50% | Moderate impact | Regular review |
| III | 51-75% | High impact | **Full audit required** |
| IV | 76-100% | Very high impact | **Full audit required** |

## Error Handling

### Common Error Responses

#### Invalid Parameters
```json
{
  "error": "Invalid project assessment arguments",
  "code": "InvalidParams"
}
```

#### Unknown Question ID
```json
{
  "error": "Unknown question ID: invalid_question",
  "code": "InvalidParams"
}
```

#### Invalid Option Selection
```json
{
  "error": "Invalid option for question project_001",
  "code": "InvalidParams"
}
```

#### Unknown Tool
```json
{
  "error": "Unknown tool: invalid_tool",
  "code": "MethodNotFound"
}
```

## Integration Notes

### SharePoint Integration
Assessment results can be formatted for SharePoint with:
- Project name and description
- Impact level and percentage
- Audit requirement flag (Level III-IV)
- Assessment timestamp
- Detailed scoring breakdown

### LLM Chatbot Integration
The API supports conversational workflows:
1. Present project description form
2. Retrieve and display questions
3. Collect user responses
4. Calculate and present results
5. Provide audit recommendations
