# Canada Algorithmic Impact Assessment (AIA) MCP Server

This MCP server provides tools and resources for conducting Canada's Algorithmic Impact Assessment on AI/automated decision-making projects.

## Overview

The server implements Canada's AIA framework which includes:
- **65 risk questions** across 6 categories (Project, System, Algorithm, Decision, Impact, Data)
- **41 mitigation questions** across 2 categories (Consultations, De-risking measures)
- **Scoring algorithm** that calculates raw impact score, mitigation score, and final impact level
- **4 impact levels** (I-IV) ranging from "Little to no impact" to "Very high impact"

## Available Tools

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

## Usage in LLM Chatbots

This MCP server enables LLM chatbots to:
1. Present AIA questions to users
2. Collect responses about their AI projects
3. Calculate impact scores automatically
4. Provide immediate feedback on audit requirements
5. Generate reports for compliance purposes

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
