# MockMate

A VS Code extension that simulates realistic technical interviews with AI assistance, helping engineers master collaborative, AI-assisted problem-solving.

## Overview

MockMate is designed to be the ultimate training ground for modern software engineering interviews. Unlike traditional platforms that focus only on algorithms, MockMate simulates the entire interview experience, including the now-common practice of using an AI coding assistant.

The extension provides a realistic interview environment where you can:
- Solve coding challenges in your VS Code editor
- Interact with an AI **Interviewer** persona that asks questions and provides guidance
- Use an AI **Coding Partner** (like GitHub Copilot) for code suggestions and debugging help
- Practice with full workspace context awareness

## Features

### Dual AI Personas

- **Interviewer Persona**: Acts as a technical interviewer, asking initial questions, providing high-level guidance, and asking follow-up questions about your approach. It's designed to be reactive and not provide direct code solutions.

- **Coding Partner Persona**: Acts as a helpful AI assistant, similar to GitHub Copilot, helping with code snippets, debugging, and suggestions.

### Authentication & Usage Management

- GitHub OAuth authentication via Supabase
- Freemium model with usage limits:
  - **Free tier**: 3 simulations per month
  - **Pro tier**: 30 simulations per month
- Secure usage tracking through Supabase Edge Functions

### Workspace Context Awareness

- Automatically reads content from all open files in your workspace
- Provides full context to both AI personas for relevant guidance
- Configurable workspace folders for context inclusion
- Context refreshed on file saves

### Multi-Provider LLM Support

- Supports **OpenAI** (GPT-3.5-turbo, GPT-4o) and **Google Gemini** (Gemini 1.5 Flash, Gemini 1.5 Pro)
- Smart model routing based on subscription tier
- Automatic fallback mechanisms if one provider fails
- Configurable model policies per tier and persona

### Session Management

- Tracks interview sessions in Supabase database
- Logs all events (messages, interactions, timestamps)
- Inactivity monitoring
- Session summary and feedback

## Architecture

### Frontend
- **VS Code Extension** (TypeScript)
- Webview panels for chat interfaces
- Commands and views integration

### Backend
- **Supabase** (PostgreSQL database + Edge Functions)
- Authentication via Supabase Auth (GitHub provider)
- Server-side logic via Supabase Edge Functions (Deno/TypeScript)

### AI Integration
- LLM calls proxied through Supabase Edge Functions for security
- API keys never exposed to client
- Support for streaming responses

## Project Structure

```
Mocking/
├── VScodeExtension/
│   ├── nikayel/              # VS Code extension source
│   │   ├── src/
│   │   │   ├── extension.ts  # Main extension entry point
│   │   │   ├── flows/        # Simulation flow logic
│   │   │   ├── models/       # LLM vendor integrations
│   │   │   ├── supabase/     # Supabase client code
│   │   │   ├── ui/           # Webview panels and UI
│   │   │   └── utils/        # Utility functions
│   │   └── package.json
│   ├── Requirements.md        # Project requirements document
│   └── supabase/
│       └── functions/        # Supabase Edge Functions
│           ├── chat-proxy/   # LLM API proxy
│           ├── session-start/# Session initialization
│           ├── session-event/# Event logging
│           ├── session-finalize/# Session completion
│           ├── usage-gate/   # Usage limit enforcement
│           └── upgrade-tier/ # Subscription management
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- VS Code (v1.102.0 or higher)
- Supabase account and project
- OpenAI API key or Google Gemini API key

### Installation

1. Clone this repository
2. Navigate to the extension directory:
   ```bash
   cd VScodeExtension/nikayel
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the extension:
   ```bash
   npm run compile
   ```

### Configuration

Configure the extension in VS Code settings:

```json
{
  "mockmate.supabaseUrl": "your-supabase-url",
  "mockmate.supabaseAnonKey": "your-supabase-anon-key",
  "mockmate.websiteUrl": "https://mockmate.dev",
  "mockmate.requireSignIn": true,
  "mockmate.defaultProvider": "auto",
  "mockmate.enableStreaming": true,
  "mockmate.maxResponseTokens": 1024
}
```

### Supabase Setup

1. Create a Supabase project
2. Set up the database schema (see `Requirements.md` for details)
3. Deploy Edge Functions:
   ```bash
   cd supabase/functions
   # Deploy each function to Supabase
   ```
4. Configure GitHub OAuth in Supabase Auth settings
5. Set environment variables in Supabase:
   - `OPENAI_API_KEY` or `GOOGLE_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Usage

1. **Sign In**: Use the command palette (`Cmd+Shift+P`) and run `MockMate: Sign In`
2. **Start Simulation**: Run `MockMate: Start Simulation` to begin a new interview session
3. **Configure Context**: Optionally run `MockMate: Configure Workspace Context` to select folders
4. **Interact**: Use the Interviewer and Coding Partner panels to interact with the AI personas
5. **Submit Solution**: When done, run `MockMate: Submit Solution` to complete the session

## Development

### Building

```bash
npm run compile      # One-time build
npm run watch        # Watch mode for development
npm run package      # Production build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run check-types
```

## Extension Settings

The extension contributes the following settings:

- `mockmate.supabaseUrl`: Supabase project URL
- `mockmate.supabaseAnonKey`: Supabase anon public key
- `mockmate.websiteUrl`: Website base URL for OAuth
- `mockmate.requireSignIn`: Require sign-in to start simulations
- `mockmate.defaultProvider`: Default model provider (auto/openai/gemini)
- `mockmate.enableStreaming`: Enable streaming responses
- `mockmate.maxResponseTokens`: Max response tokens
- `mockmate.modelPolicy`: Model routing policy by tier and persona
- `mockmate.useWizard`: Use guided start wizard
- `mockmate.workspaceContextRoots`: Workspace folders for context

## Commands

- `MockMate: Start Simulation` - Begin a new interview session
- `MockMate: End Simulation` - End the current session
- `MockMate: Sign In` - Authenticate with GitHub
- `MockMate: Sign Out` - Sign out
- `MockMate: Open Interviewer` - Open interviewer chat panel
- `MockMate: Open Coding Partner` - Open coding partner chat panel
- `MockMate: Pricing & Limits` - View subscription and usage
- `MockMate: Configure Workspace Context` - Select folders for context
- `MockMate: Submit Solution` - Complete and submit your solution

## Database Schema

The project uses a Supabase PostgreSQL database with the following main tables:

- `profiles`: User profiles with subscription tier and usage tracking
- `interview_sessions`: Interview session records
- `session_events`: Event logs for sessions

See `Requirements.md` for detailed schema information.

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

## Support

For issues and questions, please open an issue on GitHub.

