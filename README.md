# Canada Algorithmic Impact Assessment (AIA) MCP Server

This MCP server provides tools and resources for conducting Canada's Algorithmic Impact Assessment on AI/automated decision-making projects.

## Overview

The server implements Canada's AIA framework which includes:
- **65 risk questions** across 6 categories (Project, System, Algorithm, Decision, Impact, Data)
- **41 mitigation questions** across 2 categories (Consultations, De-risking measures)
- **Scoring algorithm** that calculates raw impact score, mitigation score, and final impact level
- **4 impact levels** (I-IV) ranging from "Little to no impact" to "Very high impact"

## Available Tools

### `analyze_project_description` ⭐ **NEW!**
Intelligently analyze a project description to automatically answer AIA questions where possible and identify questions requiring manual input.

**Parameters:**
- `projectName` (string): Name of the project being analyzed
- `projectDescription` (string): Detailed description of the project and its automated decision-making components

**Returns:**
- `autoAnswered`: Questions automatically answered with confidence levels and reasoning
- `needsManualInput`: Questions that require manual user input
- `partialAssessment`: Preliminary impact assessment based on auto-answered questions

**Example Usage:**
```json
{
  "projectName": "AI-Powered Loan System",
  "projectDescription": "Fully automated machine learning system using personal data to make lending decisions with bias testing and PIA planned"
}
```

### `assess_project`
Assess a project using Canada's Algorithmic Impact Assessment framework.

**Parameters:**
- `projectName` (string): Name of the project being assessed
- `projectDescription` (string): Detailed description of the project and its automated decision-making components
- `responses` (array, optional): Array of question responses. If not provided, returns questions to answer.

**Example Usage:**
```json
{
  "projectName": "AI Benefits System",
  "projectDescription": "Automated system for determining benefit eligibility",
  "responses": [
    {
      "questionId": "project_001",
      "selectedOption": 2
    }
  ]
}
```

### `get_questions`
Get AIA questions filtered by category or type.

**Parameters:**
- `category` (string, optional): Filter by category (Project, System, Algorithm, Decision, Impact, Data, Consultations, De-risking)
- `type` (string, optional): Filter by question type (risk, mitigation)

## Available Resources

### Static Resources
- `aia://questions/all` - Complete list of all AIA questions
- `aia://questions/risk` - Risk assessment questions only
- `aia://questions/mitigation` - Mitigation questions only

### Resource Templates
- `aia://assessment/{projectName}` - Assessment results for a specific project

## Assessment Results

The assessment returns:
- **Raw Impact Score**: Sum of risk question scores
- **Mitigation Score**: Sum of mitigation question scores
- **Current Score**: Raw impact score adjusted for mitigation (15% reduction if mitigation ≥ 80% of max)
- **Impact Level**: I, II, III, or IV based on score percentage
- **Score Percentage**: Current score as percentage of maximum possible risk score

## Impact Levels

| Level | Description | Score Range | Audit Requirement |
|-------|-------------|-------------|-------------------|
| I | Little to no impact | 0-25% | Minimal oversight |
| II | Moderate impact | 26-50% | Regular review |
| III | High impact | 51-75% | **Full audit required** |
| IV | Very high impact | 76-100% | **Full audit required** |

## Integration with SharePoint

The assessment results can be used to populate a SharePoint page with:
- Project name and description
- Impact level and score
- Recommendation for full audit (Level III-IV projects)
- Timestamp of assessment

## Sample Questions Included

The server includes a representative sample of questions from each category:
- **Project**: Vulnerable populations, discrimination risk
- **System**: Explainability, system capabilities
- **Algorithm**: Machine learning, evolution
- **Decision**: Human involvement level
- **Impact**: Safety, economic, liberty impacts
- **Data**: Personal information use, data quality
- **Consultations**: Stakeholder engagement
- **Mitigation**: Data quality, procedural fairness, privacy

## Intelligent Document Analysis Workflow

The new `analyze_project_description` tool enables a streamlined assessment process:

1. **User provides project description** in natural language
2. **AI analyzes the text** using pattern matching to identify key indicators
3. **Questions are automatically answered** where sufficient information is available
4. **Confidence levels assigned** (high/medium/low) with reasoning provided
5. **Partial assessment generated** showing preliminary impact level
6. **Remaining questions identified** for manual user input

### Auto-Detection Patterns

The system can automatically detect:
- **Development approach**: Internal vs third-party development
- **Data usage**: Personal information, sensitive data classifications
- **Automation level**: Full automation vs human-in-the-loop
- **Sector applicability**: Health, financial, law enforcement, licensing
- **Algorithm complexity**: Machine learning, black-box systems
- **Mitigation measures**: Bias testing, consultations, PIA, monitoring

## Usage in LLM Chatbots

This MCP server enables LLM chatbots to:
1. **Analyze project descriptions** automatically using intelligent pattern matching
2. Present remaining AIA questions to users for manual input
3. Collect responses about their AI projects
4. Calculate impact scores automatically
5. Provide immediate feedback on audit requirements
6. Generate reports for compliance purposes

## Example Assessment Result

```json
{
  "projectName": "AI-Powered Benefits Eligibility System",
  "rawImpactScore": 23,
  "mitigationScore": 7,
  "currentScore": 23,
  "impactLevel": "III",
  "impactLevelDescription": "High impact",
  "scorePercentage": 63.89,
  "timestamp": "2025-09-05T15:24:17.352Z"
}
```

This result indicates a **Level III (High Impact)** project requiring a **full audit**.
