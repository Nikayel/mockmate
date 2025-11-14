VS Code extension designed to be the ultimate training ground for modern software engineering interviews. Unlike traditional platforms that focus only on algorithms, SimuView simulates the entire interview experience, including the now-common practice of using an AI coding assistant.

The goal is to help engineers master the art of collaborative, AI-assisted problem-solving, giving them the confidence and skills to land jobs at top tech companies.

2. Core Objective for MVP
The primary objective of this MVP is to validate the core user experience: can we successfully simulate a realistic, AI-assisted technical interview within the VS Code environment and provide valuable, actionable feedback to the user?

3. Functional Requirements & User Stories
3.1. User Onboarding & Authentication
Story: As a new user, I want to sign in to the extension using my GitHub account so that my progress and usage can be securely saved and tracked.

Implementation: Use Supabase Auth with the GitHub provider. The extension should prompt for login upon the first attempt to start a simulation.

3.2. The Interview Session
Story: As a user, I want to start a new simulation and be presented with a pre-defined coding challenge in my editor.

MVP Scope: Start with one fixed challenge (e.g., a junior-level Python problem). The challenge should involve 2-3 pre-populated files in a new workspace.

UI Layout:

Main Editor: Standard VS Code editor with the challenge files.

Right Panel (Webview): A text-based chat interface for the "Interviewer Persona."

Bottom Panel (Webview): A collapsible, text-based chat interface for the "AI Coding Partner."

Story: As a user, I need the Interviewer and Coding Partner to have the full context of all files in my current workspace so they can provide relevant guidance and feedback.

Implementation: On session start, the extension should read the content of all open files and include it in the system prompt for the LLM APIs. This context should be refreshed periodically or on file save.

3.3. Dual AI Personas
Story: As a user, I want to interact with a realistic Interviewer Persona that asks the initial question, provides high-level guidance, and asks follow-up questions about my approach.

Implementation: An LLM instance with a specific system prompt defining its role as an interviewer. It should be mostly reactive and not provide direct code solutions.

Story: As a user, I want to use the AI Coding Partner to ask for code snippets, debug help, or suggestions, just as I would use a tool like GitHub Copilot.

Implementation: A separate LLM instance with a system prompt defining its role as a helpful assistant.

3.4. Usage Limiting & Monetization (Freemium Model)
Story: As a platform owner, I need to limit free-tier users to a specific number of simulations per month to manage API costs.

Implementation:

Use a Supabase Edge Function to act as a secure gatekeeper.

Before a session starts, the extension calls this function.

The function checks the user's simulations_used count in the profiles table against the monthly limit (e.g., 3).

If the limit is not reached, it increments the count and allows the session to start.

If the limit is reached, it returns an error, and the extension UI should display a message prompting the user to upgrade.

4. Technical Specifications
Platform: VS Code Extension

Language: TypeScript

UI: VS Code Webview API with HTML/CSS/JavaScript. (A lightweight framework like Svelte or Preact is recommended for managing the chat interfaces).

Backend & Database: Supabase

Auth: Supabase Auth (GitHub provider).

Database: Supabase Postgres.

Server-side Logic: Supabase Edge Functions (written in Deno/TypeScript).

AI: Google Gemini API (or OpenAI API, TBD). Requires secure handling of API keys via server-side functions, not on the client.

5. Database Schema (Supabase)
A single table, profiles, is required for the MVP.

Column Name	Data Type	Description
id	UUID	Primary Key. Foreign key relationship to auth.users.id.
email	TEXT	User's email, retrieved from auth provider.
subscription_tier	TEXT	Default: 'free'. Can be 'pro'.
simulations_used	INT	Default: 0. Counter for the current billing cycle.
usage_reset_date	TIMESTAMP	The date when simulations_used should reset to 0.

Export to Sheets
6. High-Level Architecture Flow
User Action (Start Simulation) -> VS Code Extension

VS Code Extension -> Calls Supabase Edge Function with User Auth Token

Supabase Edge Function -> Reads profiles table to check user's subscription_tier and simulations_used.

If OK: Increment simulations_used in DB -> Send "Success" back to Extension.

Extension -> Initializes UI, reads workspace files for context -> Makes call to LLM API (via another Edge Function for security) to get the first interviewer prompt.

User & AI Interaction -> All LLM calls are proxied through secure Edge Functions.