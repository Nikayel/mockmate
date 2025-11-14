# MockMate Scenario-Based Interview System

## Overview

MockMate now features a comprehensive scenario-based interview system with preloaded coding challenges, enhanced AI personalities, and full workspace context awareness. This update transforms MockMate into a realistic interview simulation platform that mirrors real-world technical interviews at top tech companies.

## 🎯 Key Features

### 1. **Preloaded Coding Scenarios**

Choose from a curated library of coding scenarios including:

#### **DSA (Data Structures & Algorithms)**
- Two Sum (Easy)
- Three Sum (Medium)
- Valid Parentheses (Easy)
- Reverse Linked List (Easy)
- Binary Search (Easy)
- Maximum Subarray - Kadane's Algorithm (Medium)
- Climbing Stairs (Easy)
- Merge Intervals (Medium)

#### **Bug Fix Scenarios**
- Async Race Condition in React
- Memory Leak from Event Listeners
- SQL Injection Vulnerability
- Off-by-One Error in Pagination
- NullPointerException in Java
- ConcurrentModificationException
- Stale Closure in React Hooks
- Mutable Default Argument in Python

### 2. **Enhanced AI Personalities**

#### **AI Interviewer**
- **Company-Specific Behavior**: Adapts interview style based on target company (Google, Meta, Amazon, Netflix, etc.)
- **Level-Appropriate Guidance**: Adjusts complexity and expectations for intern through principal levels
- **Scenario-Aware**: Provides relevant hints and feedback based on the specific problem
- **Full Context Awareness**: Understands your codebase and suggests consistent patterns

#### **AI Coding Partner**
- **Context-Aware Assistance**: Knows your project structure, dependencies, and coding style
- **Scenario-Specific Help**: Provides targeted assistance based on problem type
- **Real-World Simulation**: Acts like GitHub Copilot during an interview
- **Educational Guidance**: Helps you learn while solving problems

### 3. **Full Workspace Context**

The AI now has comprehensive awareness of your codebase:
- **Project Structure**: Understands your folder organization
- **Dependencies**: Knows what libraries you're using (package.json, requirements.txt, go.mod)
- **Open Files**: Reads and understands currently open code
- **Language Detection**: Adapts suggestions to your programming language
- **Coding Patterns**: Matches your existing code style and conventions

### 4. **Interactive Scenario Browser**

Browse and filter scenarios by:
- **Type**: DSA, Bug Fix, Optimization, Security, System Design
- **Difficulty**: Easy, Medium, Hard
- **Company**: Google, Meta, Amazon, Netflix, Apple, Microsoft, Startup
- **Search**: Find scenarios by keywords or tags

## 🚀 Getting Started

### Starting a Scenario-Based Interview

1. **Open Command Palette** (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Run `MockMate: Start Simulation`
3. Choose **🎯 Scenario-Based Interview (Recommended)**
4. Select your **target company**
5. Enter your **role** (e.g., Backend Engineer, Frontend Developer)
6. Select your **seniority level**
7. **Browse scenarios** in the interactive browser
8. **Filter by**:
   - Type (DSA, Bug Fix, etc.)
   - Difficulty (Easy, Medium, Hard)
   - Company (to see company-specific questions)
9. **Click on a scenario** to start the interview

### During the Interview

#### Using the AI Interviewer
- **Ask clarifying questions** - The interviewer expects this!
- **Think out loud** - Explain your approach
- **Request hints** - Use Socratic guidance when stuck
- **Discuss trade-offs** - Show your engineering judgment

#### Using the AI Coding Partner
- **Ask for code suggestions** - Get implementation help
- **Request debugging assistance** - Find and fix bugs
- **Get test case ideas** - Improve your testing
- **Discuss patterns** - Learn best practices

### Commands

- `MockMate: Start Simulation` - Begin a new interview session
- `MockMate: Open Interviewer` - Show the interviewer panel
- `MockMate: Open Coding Partner` - Show the coding partner panel
- `MockMate: End Simulation` - End the current session
- `MockMate: Submit Solution` - Submit and get feedback
- `MockMate: Configure Workspace Context` - Select folders for context

## 📋 Scenario Structure

Each scenario includes:

### For DSA Problems
- **Problem Statement**: Clear description of the task
- **Examples**: Input/output examples with explanations
- **Constraints**: Problem limitations and requirements
- **Hints**: Progressive hints (shown when requested)
- **Starter Code**: Templates in multiple languages
- **Optimal Complexity**: Target time/space complexity

### For Bug Fix Problems
- **Buggy Code**: Code with defects to identify and fix
- **Bug Description**: What's wrong (high-level)
- **Expected Behavior**: How it should work
- **Test Cases**: Failing tests to validate your fix
- **Hints**: Debugging guidance

## 🏢 Company-Specific Interview Styles

The AI Interviewer adapts to company culture:

- **Google**: Emphasizes algorithmic complexity, scale, rigorous analysis
- **Meta**: Focus on large codebases, attention to detail, iteration
- **Amazon**: Values ownership, customer obsession, operational excellence
- **Netflix**: Emphasizes resilience, microservices, chaos scenarios
- **Microsoft**: Enterprise-quality code, backward compatibility
- **Apple**: Performance, user experience, elegant solutions
- **Startup**: Pragmatism, speed, shipping working code

## 📊 Seniority Levels

Interview expectations scale with level:

- **Intern**: Fundamentals, clear thinking, willingness to learn
- **Junior**: Correct implementation, basic testing, code readability
- **Mid**: Production-ready code, edge cases, error handling
- **Senior**: System design, scalability, performance optimization
- **Staff**: Architectural impact, cross-system concerns, operational excellence
- **Principal**: Strategic decisions, risk assessment, long-term maintainability

## 🔧 How It Works

### Workspace Context Collection

The system automatically gathers:
1. **All open editor files** (with content)
2. **Project folder structure** (up to 200 files)
3. **Dependencies** from package.json, requirements.txt, or go.mod
4. **Programming languages** in use
5. **Total file count** in the workspace

This context is refreshed on every message to the AI, ensuring they always have current information.

### AI Persona System

Both the Interviewer and Coding Partner receive:
- **Selected scenario details** (problem, constraints, hints)
- **Your workspace context** (code, dependencies, structure)
- **Company and level information** (for appropriate behavior)
- **Real-time code changes** (as you edit files)

### Scenario Data

Scenarios are stored in TypeScript modules:
- `src/scenarios/types.ts` - Type definitions
- `src/scenarios/dsa-scenarios.ts` - DSA problems
- `src/scenarios/bugfix-scenarios.ts` - Bug fix problems
- `src/scenarios/index.ts` - Filtering and management

## 📝 Example Workflow

### Example: Two Sum Interview

1. **Start**: Choose "Two Sum" from DSA scenarios
2. **Interviewer presents problem**: Shows examples and constraints
3. **You ask**: "Can I assume the array is sorted?"
4. **Interviewer responds**: "No, the array is unsorted. How would you approach this?"
5. **You explain**: "I'll use a hash map to store seen numbers..."
6. **Interviewer**: "Good approach! What would the complexity be?"
7. **You code**: Write your solution with Coding Partner assistance
8. **Interviewer reviews**: Asks about edge cases
9. **You add**: Handle edge cases and write tests
10. **Submit**: Get feedback and next steps

## 🎨 Customization

### Adding New Scenarios

Create scenarios in the appropriate file:

```typescript
// In src/scenarios/dsa-scenarios.ts
{
  id: 'dsa-your-problem',
  title: 'Your Problem Title',
  type: 'dsa',
  difficulty: 'medium',
  companies: ['Google', 'Meta'],
  description: 'Brief description',
  tags: ['array', 'hash-table'],
  estimatedTime: 30,
  problemStatement: '...',
  examples: [...],
  constraints: [...],
  hints: [...],
  optimalComplexity: {
    time: 'O(n)',
    space: 'O(n)'
  }
}
```

### Modifying AI Personalities

Edit persona builders in:
- `src/personas/scenarioPersonas.ts`

Customize:
- Company-specific behaviors
- Level-appropriate guidance
- Scenario-specific hints
- Evaluation criteria

## 🐛 Troubleshooting

### AI doesn't see my code
- Make sure files are open in the editor
- Run `MockMate: Configure Workspace Context` to select folders
- Check that files aren't binary or too large

### Scenarios don't load
- Check browser console for errors
- Ensure `src/scenarios/index.ts` exports all scenarios
- Verify TypeScript compilation succeeded

### Interview style doesn't match company
- Check that company name matches exactly (case-insensitive)
- Verify `src/personas/scenarioPersonas.ts` has company entry
- Review company style definitions

## 📚 Architecture

```
VScodeExtension/nikayel/
├── src/
│   ├── scenarios/               # Scenario database
│   │   ├── types.ts            # Type definitions
│   │   ├── dsa-scenarios.ts    # DSA problems
│   │   ├── bugfix-scenarios.ts # Bug fix problems
│   │   └── index.ts            # Filtering & management
│   ├── personas/               # AI personality system
│   │   └── scenarioPersonas.ts # Context-aware personas
│   ├── flows/                  # Interview flows
│   │   ├── scenarioBasedSimulation.ts  # New scenario flow
│   │   └── startSimulation.ts          # Legacy flow
│   ├── ui/                     # User interfaces
│   │   ├── scenarioBrowser.ts  # Scenario selection UI
│   │   └── ...                 # Other panels
│   └── utils/                  # Utilities
│       └── workspace.ts        # Context collection
```

## 🚦 Future Enhancements

Planned features:
- [ ] More scenarios (100+ problems)
- [ ] System design scenarios
- [ ] Optimization scenarios
- [ ] Security scenarios
- [ ] Custom scenario creation UI
- [ ] Interview recording & playback
- [ ] Detailed performance metrics
- [ ] Multi-language support
- [ ] Community-contributed scenarios

## 💡 Tips for Best Results

1. **Think out loud**: The interviewer wants to see your thought process
2. **Ask questions**: Clarifying ambiguity is expected
3. **Use the coding partner**: It simulates having Copilot in a real interview
4. **Start simple**: Begin with a brute force solution, then optimize
5. **Test your code**: Write test cases as you would in production
6. **Explain trade-offs**: Show engineering judgment
7. **Match the level**: If you're practicing for senior, think about scale
8. **Stay in character**: Treat it like a real interview for best practice

## 🔗 Related Documentation

- Main README: `../../README.md`
- Project Requirements: `../../Requirements.md`
- Supabase Functions: `../supabase/functions/`
- Extension Configuration: `package.json`

---

**Built with ❤️ for realistic interview practice**
